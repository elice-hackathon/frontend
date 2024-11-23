// Refer to https://github.com/vercel/ai/blob/main/packages/ai/streams/langchain-adapter.ts
import { mergeStreams } from "./merge-stream";
import { prepareResponseHeaders } from "./prepare-response-header";
import { AIStreamCallbacksAndOptions } from "ai";
import { StreamData } from "ai";
import { formatDataStreamPart } from "@ai-sdk/ui-utils";

// LC stream event v2
type LangChainStreamEvent = {
  event: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  name?: string;
};

export function parseSSEChunkToJSON(
  chunk: string,
  controller: TransformStreamDefaultController
) {
  const lines = chunk.split("\n").filter((line) => line.trim());

  for (const line of lines) {
    try {
      if (line.startsWith("data: ")) {
        const jsonData = JSON.parse(line.slice(6)) as LangChainStreamEvent;
        controller.enqueue(jsonData);
      }
    } catch (e) {
      console.error("[ERROR] Error processing line:", e);
      console.error("[ERROR] Problematic line:", line);
    }
  }
}

function tryParseJSON(content: string) {
  try {
    return JSON.parse(content);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return content;
  }
}

/**
Converts LangChain output streams to AIStream.

The following streams are supported:
- `LangChainAIMessageChunk` streams (LangChain `model.stream` output)
- `string` streams (LangChain `StringOutputParser` output)
 */
// Refer: https://github.com/vercel/ai/blob/main/packages/ai/core/generate-text/stream-text.ts#L1136
export function toDataStream(
  stream: ReadableStream<LangChainStreamEvent>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _callbacks?: AIStreamCallbacksAndOptions
) {
  return (
    stream
      .pipeThrough(
        new TransformStream<LangChainStreamEvent>({
          transform: async (value, controller) => {
            console.log(
              "First transformer input:",
              JSON.stringify(value, null, 2)
            );
            if ("event" in value) {
              if (value.event === "on_chat_model_stream") {
                controller.enqueue({
                  type: "text",
                  content: value.data.chunk.content,
                });
              } else if (value.event === "on_chat_model_end") {
                if (
                  value.data.output.content === "" &&
                  (value.data.output.tool_calls?.length ?? 0) > 0
                ) {
                  const tool_call = value.data.output.tool_calls[0];
                  controller.enqueue({
                    type: "tool-call-streaming-start",
                    toolCallId: tool_call.id,
                    toolName: tool_call.name,
                  });
                  controller.enqueue({
                    type: "tool-call",
                    toolCallId: tool_call.id,
                    toolName: tool_call.name,
                    args: tool_call.args,
                  });
                }
              } else if (value.event === "on_tool_end") {
                controller.enqueue({
                  type: "tool-result",
                  toolCallId: value.data.output.tool_call_id,
                  result: tryParseJSON(value.data.output.content),
                });
              }
            }
            console.log("No matching conditions found for value");
          },
        })
      )
      // .pipeThrough(createCallbacksTransformer(callbacks))
      // .pipeThrough(
      //   new TransformStream({
      //     transform: async (chunk, controller) => {
      //       console.log('Before final transformer:', chunk);
      //       controller.enqueue(chunk);
      //     },
      //   })
      // )
      .pipeThrough(createLangServeAdapterStreamDataTransformer())
  );
}

export function toDataStreamResponse(
  stream: ReadableStream<LangChainStreamEvent>,
  options?: {
    init?: ResponseInit;
    data?: StreamData;
    callbacks?: AIStreamCallbacksAndOptions;
  }
) {
  const dataStream = toDataStream(stream, options?.callbacks);
  const data = options?.data;
  const init = options?.init;

  const responseStream = data
    ? mergeStreams(data.stream, dataStream)
    : dataStream;

  return new Response(responseStream, {
    status: init?.status ?? 200,
    statusText: init?.statusText,
    headers: prepareResponseHeaders(init, {
      contentType: "text/plain; charset=utf-8",
      dataStreamVersion: "v1",
    }),
  });
}

// Refer: https://github.com/vercel/ai/blob/main/packages/ui-utils/src/stream-parts.ts#L233
export function createLangServeAdapterStreamDataTransformer() {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  return new TransformStream({
    transform: async (chunk, controller) => {
      console.log("Final transformer received:", chunk);
      console.log("Chunk type:", typeof chunk);
      console.log("Chunk properties:", Object.keys(chunk));

      // Try to handle both string and object cases
      let parsedChunk;
      if (typeof chunk === "string") {
        try {
          parsedChunk = JSON.parse(chunk);
        } catch (e) {
          console.error("Failed to parse chunk as JSON:", e);
          parsedChunk = chunk;
        }
      } else {
        parsedChunk = chunk;
      }

      console.log("Parsed chunk:", parsedChunk);

      switch (parsedChunk.type) {
        case "text": {
          // If content is already a string, no need to decode
          const message =
            typeof parsedChunk.content === "string"
              ? parsedChunk.content
              : decoder.decode(parsedChunk.content);
          controller.enqueue(
            encoder.encode(formatDataStreamPart("text", message))
          );
          break;
        }
        case "tool-call-streaming-start": {
          // Use encoder.encode() on the formatted stream part
          controller.enqueue(
            encoder.encode(
              formatDataStreamPart("tool_call_streaming_start", {
                toolCallId: parsedChunk.toolCallId,
                toolName: parsedChunk.toolName,
              })
            )
          );
          break;
        }
        case "tool-call-delta": {
          controller.enqueue(
            formatDataStreamPart("tool_call_delta", {
              toolCallId: parsedChunk.toolCallId,
              argsTextDelta: parsedChunk.argsTextDelta,
            })
          );
          break;
        }
        case "tool-call": {
          controller.enqueue(
            encoder.encode(
              formatDataStreamPart("tool_call", {
                toolCallId: parsedChunk.toolCallId,
                toolName: parsedChunk.toolName,
                args: parsedChunk.args,
              })
            )
          );
          break;
        }
        case "tool-result": {
          controller.enqueue(
            encoder.encode(
              formatDataStreamPart("tool_result", {
                toolCallId: parsedChunk.toolCallId,
                result: parsedChunk.result,
              })
            )
          );
          break;
        }
        case "error": {
          controller.enqueue(
            encoder.encode(
              formatDataStreamPart(
                "error",
                parsedChunk.error?.message || "Unknown error"
              )
            )
          );
          break;
        }
        case "step-finish": {
          controller.enqueue(
            encoder.encode(
              formatDataStreamPart("finish_step", {
                finishReason: parsedChunk.finishReason,
                usage: parsedChunk.usage
                  ? {
                      promptTokens: parsedChunk.usage.promptTokens,
                      completionTokens: parsedChunk.usage.completionTokens,
                    }
                  : undefined,
                isContinued: parsedChunk.isContinued,
              })
            )
          );
          break;
        }
        case "finish": {
          controller.enqueue(
            encoder.encode(
              formatDataStreamPart("finish_message", {
                finishReason: parsedChunk.finishReason,
                usage: parsedChunk.usage
                  ? {
                      promptTokens: parsedChunk.usage.promptTokens,
                      completionTokens: parsedChunk.usage.completionTokens,
                    }
                  : undefined,
              })
            )
          );
          break;
        }
        default: {
          console.warn("Unknown chunk type:", parsedChunk.type);
        }
      }
    },
  });
}
