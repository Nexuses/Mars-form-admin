"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "./LogoutButton";

const LOGO =
  "https://mars-solutions.s3.us-east-2.amazonaws.com/MARS-logo-color.png";

function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 4h7v7H4V4Zm9 0h7v5h-7V4ZM4 13h7v7H4v-7Zm9 3h7v4h-7v-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconApplications() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3.75h7.5L19 8.25v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 3.75V8h4.5M9 12h6M9 15.5h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NAV: {
  href: string;
  label: string;
  exact?: boolean;
  icon: "dashboard" | "applications";
}[] = [
  { href: "/admin/dashboard", label: "Dashboard", exact: true, icon: "dashboard" },
  {
    href: "/admin/dashboard/applications",
    label: "Applications",
    icon: "applications",
  },
];

export function AdminSidebar({
  adminName,
  adminEmail,
}: {
  adminName: string;
  adminEmail: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header className="dash-mobile-bar">
        <button
          type="button"
          className="dash-hamburger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="admin-sidebar"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="MARS Solutions Group" className="dash-mobile-logo" />
        <LogoutButton />
      </header>

      <button
        type="button"
        className={`dash-drawer-backdrop${open ? " open" : ""}`}
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
      />

      <aside
        id="admin-sidebar"
        className={`dash-sidebar${open ? " open" : ""}`}
        aria-hidden={false}
      >
        <div className="dash-sidebar-top">
          <div className="dash-sidebar-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="MARS Solutions Group" />
            <span>Admin</span>
          </div>
          <button
            type="button"
            className="dash-drawer-close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>

        <nav className="dash-nav" aria-label="Admin">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`dash-nav-link${active ? " active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {item.icon === "dashboard" ? <IconDashboard /> : <IconApplications />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="dash-sidebar-foot">
          <div className="dash-admin-meta">
            <strong>{adminName}</strong>
            <span>{adminEmail}</span>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
