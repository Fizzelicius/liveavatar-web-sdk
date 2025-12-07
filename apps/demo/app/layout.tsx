import "./globals.css";
import ThemeRegistry from "../src/ThemeRegistry";

export const metadata = {
  title: "HeyGen Live Avatar Demo",
  description: "A demonstration of the HeyGen Live Avatar Web SDK.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
