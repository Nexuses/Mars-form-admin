import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-shell">
          <div className="admin-card">
            <p className="admin-lead" style={{ margin: 0 }}>
              Loading…
            </p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
