import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Frontend Chat",
  description: "Chat interface using server components and server actions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
