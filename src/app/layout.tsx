import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jacob Martinez's Portfolio",
  description: "Coursework and personal projects by Jacob Martinez: C++, Assembly, Java and web.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
