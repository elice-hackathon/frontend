"use client";

import { useEdgeRuntime, WebSpeechSynthesisAdapter } from "@assistant-ui/react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { MyThread } from "./assistant-ui/thread";

export function NewMyAssistant() {
  // const runtime = useEdgeRuntime({
  //   api: "/api/chat",
  //   adapters: {
  //     speech: new WebSpeechSynthesisAdapter(),
  //   },
  // });

  const runtime = useEdgeRuntime({
    api: "/api/order-chat",
    adapters: {
      speech: new WebSpeechSynthesisAdapter(),
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <MyThread />
    </AssistantRuntimeProvider>
  );
}
