import { Suspense } from "react";

import { CollectionPage } from "@/modules/collection/components/CollectionPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7faff]" />}>
      <CollectionPage />
    </Suspense>
  );
}
