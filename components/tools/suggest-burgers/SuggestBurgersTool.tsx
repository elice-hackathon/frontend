"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import {
  BurgerItem,
  SuggestBurgers,
  SuggestBurgersToolArgs,
} from "./suggest-burgers";

export type SuggestBurgersToolResult = {
  burgerItems?: BurgerItem[];
  error?: string;
};

export const SuggestBurgersTool = makeAssistantToolUI<
  SuggestBurgersToolArgs,
  string
>({
  toolName: "suggest_burgers",
  render: function PriceSnapshotUI({ result }) {
    let resultObj: SuggestBurgersToolResult;
    try {
      resultObj = result ? JSON.parse(result) : {};
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      resultObj = { error: result! };
    }

    console.log(resultObj);

    return (
      <div className="mb-4 flex flex-col items-center gap-2">
        <pre className="whitespace-pre-wrap break-all text-center">
          추천이닷!
        </pre>
        {resultObj.burgerItems && (
          <SuggestBurgers burgerItems={resultObj.burgerItems} />
        )}
        {"error" in resultObj && (
          <p className="text-red-500">{resultObj.error}</p>
        )}
      </div>
    );
  },
});
