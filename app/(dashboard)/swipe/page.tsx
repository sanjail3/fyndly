
import { Suspense } from "react";
import SwipePage from "./SwipePageClient";

export default function Page() {
  return (
    <Suspense>
      <SwipePage />
    </Suspense>
  );
}