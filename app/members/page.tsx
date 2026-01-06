import { Suspense } from "react";
import MembersClient from "./members-client";

export default function MembersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading members…</div>}>
      <MembersClient />
    </Suspense>
  );
}
