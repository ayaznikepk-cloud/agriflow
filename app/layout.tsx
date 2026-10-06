import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "AgriFlow", description: "Farm management, from field to harvest." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
