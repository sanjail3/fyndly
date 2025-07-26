import { Suspense } from "react";
import ChatPage from "./ChatPageClient";

export default function Page() {
  return (
    <Suspense>
      <ChatPage />
    </Suspense>
  );
}