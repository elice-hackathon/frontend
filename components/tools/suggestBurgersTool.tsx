"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";

type SuggestBurgersToolArgs = {};

export const SuggestBurgersTool = makeAssistantToolUI<
  SuggestBurgersToolArgs,
  string
>({
  toolName: "suggest_burgers",
  render: function SuggestBurgersUI({ args, _result }) {
    return (
      <div className="mb-4 flex flex-col items-center">
        <pre className="whitespace-pre-wrap break-all text-center">
          price_snapshot({JSON.stringify(args)})
        </pre>
      </div>
    );
  },
});
