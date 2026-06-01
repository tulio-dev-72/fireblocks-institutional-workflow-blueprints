import { Suspense } from "react";
import { EnterpriseLandingPage } from "@/components/home/enterprise-landing/enterprise-landing-page";
import { PageLoadingState } from "@/components/ui/page-loading-state";

export default function AccessPortalPage() {
  return (
    <Suspense fallback={<PageLoadingState label="Loading institutional access portal…" />}>
      <EnterpriseLandingPage />
    </Suspense>
  );
}
