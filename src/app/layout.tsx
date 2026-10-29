import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./mars-form.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Healthcare Candidate Application | MARS Solutions Group",
  description:
    "Submit your details securely to the MARS Solutions Group healthcare recruitment team.",
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ fontFamily: 'var(--font-inter), "Inter", system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
