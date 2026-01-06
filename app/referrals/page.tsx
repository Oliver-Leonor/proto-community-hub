import { Suspense } from "react";
import ReferralsClient from "./referrals-client";

export default function ReferralsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading referrals…</div>}>
      <ReferralsClient />
    </Suspense>
  );
}
