"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { TransactionConfirmationPending } from "./transaction-confirmation-pending";
import { TransactionConfirmationFinal } from "./transaction-confirmation-final";

type PurchaseBurgerItemsArgs = {
  ticker: string;
  companyName: string;
  quantity: number;
  maxPurchasePrice: number;
};

type PurchaseBurgerItemsResult = {
  approve?: boolean;
  cancelled?: boolean;
  error?: string;
};

export const PurchaseBurgerItemsTool = makeAssistantToolUI<
  PurchaseBurgerItemsArgs,
  string
>({
  toolName: "purchase_burger_items",
  render: function PurchaseBurgerItemsUI({ args, result, status, addResult }) {
    let resultObj: PurchaseBurgerItemsResult;
    try {
      resultObj = result ? JSON.parse(result) : {};
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      resultObj = { error: result! };
    }

    const handleReject = () => {
      addResult({ cancelled: true });
    };

    const handleConfirm = async () => {
      addResult({ approve: true });
    };

    return (
      <div className="mb-4 flex flex-col items-center gap-2">
        <div>
          <pre className="whitespace-pre-wrap break-all text-center">
            purchase_burger_items({JSON.stringify(args)})
          </pre>
        </div>
        {!result && status.type !== "running" && (
          <TransactionConfirmationPending
            {...args}
            onConfirm={handleConfirm}
            onReject={handleReject}
          />
        )}
        {resultObj.approve && <TransactionConfirmationFinal {...args} />}
        {resultObj.approve === false && (
          <pre className="font-bold text-red-600">User rejected purchase</pre>
        )}
        {resultObj.cancelled && (
          <pre className="font-bold text-red-600">Cancelled</pre>
        )}
      </div>
    );
  },
});
