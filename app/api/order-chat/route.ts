import { type Message } from "ai";
import * as LangServeAdapter from "@/app/lib/langserve-adapter";

export const maxDuration = 30;

interface IRequest {
  messages: Message[];
}

export async function POST(req: Request) {
  console.log(req);
  const { messages }: IRequest = await req.json();

  console.log(`JSON :: ${messages}`);

  const response = await fetch("http://localhost:56582", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      input: { messages },
      config: {
        configurable: {
          session_id: crypto.randomUUID(),
        },
      },
      streamMode: "values",
    }),
  });

  if (!response.ok) {
    console.error(`[ERROR] Server responded with status ${response.status}`);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (!response.body) {
    console.error("[ERROR] No response body received");
    throw new Error("No response body received");
  }

  console.log("[DEBUG] Setting up stream processing pipeline...");
  const stream = response.body.pipeThrough(new TextDecoderStream()).pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        LangServeAdapter.parseSSEChunkToJSON(chunk, controller);
      },
    })
  );

  console.log("[DEBUG] Stream pipeline setup complete, returning response...");
  return LangServeAdapter.toDataStreamResponse(stream);
}
