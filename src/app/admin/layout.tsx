import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./admin.css";

const adminFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin | MARS Solutions Group",
  description: "MARS Solutions Group admin access",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`admin-root ${adminFont.variable}`}>{children}</div>;
}
