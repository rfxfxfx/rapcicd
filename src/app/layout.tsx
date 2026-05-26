import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "rapcicd — Next.js + Firebase CI/CD",
  description:
    "A modern Next.js starter with GitHub Actions CI/CD and Firebase Hosting. Ship faster with a production-ready pipeline.",
  keywords: ["Next.js", "Firebase", "GitHub Actions", "CI/CD", "TypeScript"],
  openGraph: {
    title: "rapcicd — Next.js + Firebase CI/CD",
    description:
      "A modern Next.js starter with GitHub Actions CI/CD and Firebase Hosting.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
