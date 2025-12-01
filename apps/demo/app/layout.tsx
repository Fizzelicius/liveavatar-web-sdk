import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../src/components/providers"; // Import the Providers component

export const metadata: Metadata = {
  title: "AI Data Narrator",
  description: "Interact with your data through an AI avatar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background-default text-text-default font-sans antialiased">
        <main className="flex flex-col h-screen w-screen overflow-hidden">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
