"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type SuggestBurgersToolArgs = {};

export type BurgerItem = {
  id: number;
  name: string;
  price_krw: number;
};

type SuggestBurgersToolResult = {
  burgerItems: BurgerItem[];
};

export function SuggestBurgers({
  burgerItems,
}: SuggestBurgersToolArgs & SuggestBurgersToolResult) {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <ScrollArea className="w-full whitespace-nowrap rounded-md ">
        <div className="flex w-max space-x-4 p-4">
          {burgerItems.map((burger, index) => (
            <Card key={index} className="w-[250px] h-[200px] flex-shrink-0">
              <CardHeader>
                <CardTitle className="text-lg">{burger.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-md">
                    {burger.price_krw}원
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
