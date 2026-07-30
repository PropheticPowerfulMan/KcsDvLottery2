import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KCS Opportunity Program",
  description: "Private academic opportunity program for Kinshasa Christian School graduates."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
