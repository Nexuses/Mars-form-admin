import { Suspense } from "react";
import { ApplicationForm } from "@/components/application/ApplicationForm";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="card" style={{ margin: "48px auto", maxWidth: 720 }}>
          <p className="step-lead" style={{ margin: 0 }}>
            Loading application…
          </p>
        </div>
      }
    >
      <ApplicationForm />
    </Suspense>
  );
}
