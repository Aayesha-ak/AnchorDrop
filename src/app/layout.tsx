import type { Metadata } from "next";
import "@/styles/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: "AnchorDrop — Your Place on the Water!",
  description: "Discover. Dock. Unwind. Temporary and overnight boat docking marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Providers>
          {/* Public App Header with responsive drawer & sticky navigation */}
          <Header />

          {/* Primary Page Content */}
          <div style={{ flex: 1 }}>{children}</div>

          {/* Global Harbor Night Footer */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
