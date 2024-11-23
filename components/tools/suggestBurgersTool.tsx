"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type SuggestBurgersToolArgs = {};

export const SuggestBurgersTool = makeAssistantToolUI<
  SuggestBurgersToolArgs,
  string
>({
  toolName: "suggest_burgers",
  render: function SuggestBurgersUI({ args }) {
    return (
      <div className="mb-4 flex flex-col items-center">
        <pre className="whitespace-pre-wrap break-all text-center">
          price_snapshot({JSON.stringify(args)})
        </pre>
      </div>
    );
  },
});
