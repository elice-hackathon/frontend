// import { MyAssistant } from "@/components/MyAssistant";

// import { NewMyAssistant } from "@/components/NewMyAssistant";
import { OrderAssistant } from "@/components/OrderAssistant";

export default function Home() {
  return (
    <main className="h-dvh">
      {/* <NewMyAssistant /> */}
      <OrderAssistant />
    </main>
  );
}
