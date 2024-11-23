"use client";

import { useEdgeRuntime, WebSpeechSynthesisAdapter } from "@assistant-ui/react";
import { Thread } from "@assistant-ui/react";
import { makeMarkdownText } from "@assistant-ui/react-markdown";

const MarkdownText = makeMarkdownText();

export function MyAssistant() {
  const runtime = useEdgeRuntime({
    api: "/api/chat",
    adapters: {
      speech: new WebSpeechSynthesisAdapter(),
    },
  });

  return (
    <Thread
      runtime={runtime}
      assistantMessage={{ components: { Text: MarkdownText } }}
    />
  );
}
