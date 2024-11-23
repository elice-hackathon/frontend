"use client";

import { useRef } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useLangGraphRuntime } from "@assistant-ui/react-langgraph";

import { createThread, getThreadState, sendMessage } from "@/lib/chatApi";
import { MyThread } from "@/components/assistant-ui/thread";

import { PurchaseBurgerItemsTool } from "@/components/tools/purchase-burger-items/PurchaseBurgerItemsTool";
import { SuggestBurgersTool } from "@/components/tools/suggest-burgers/SuggestBurgersTool";

export function OrderAssistant() {
  const threadIdRef = useRef<string | undefined>();
  const runtime = useLangGraphRuntime({
    threadId: threadIdRef.current,
    stream: async (messages) => {
      if (!threadIdRef.current) {
        const { thread_id } = await createThread();
        threadIdRef.current = thread_id;
      }
      const threadId = threadIdRef.current;
      return sendMessage({ threadId, messages });
    },
    onSwitchToNewThread: async () => {
      const { thread_id } = await createThread();
      threadIdRef.current = thread_id;
    },
    onSwitchToThread: async (threadId) => {
      const state = await getThreadState(threadId);
      threadIdRef.current = threadId;
      return { messages: state.values.messages };
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SuggestBurgersTool />
      <PurchaseBurgerItemsTool />
      <MyThread />
    </AssistantRuntimeProvider>
  );
}
