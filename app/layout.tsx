import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASK TASK - Биржа заданий",
  description: "Worker cabinet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

export const metadata = {
  title: "ASK TASK - Биржа заданий",
  description: "Worker cabinet",
  robots: {
    index: false,
    follow: false,
  },
};