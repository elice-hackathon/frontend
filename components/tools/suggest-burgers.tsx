"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type SuggestBurgersToolArgs = {};

type BurgerItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  options: string[];
};

type SuggestBurgersToolResult = {
  burgerItems: BurgerItem[];
};

export function SuggestBurgers({
  burgerItems,
}: SuggestBurgersToolArgs & SuggestBurgersToolResult) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {burgerItems.map((burger, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>{burger.name}</CardTitle>
                <CardDescription>{burger.quantity}</CardDescription>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">
                      ${burger.price.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
