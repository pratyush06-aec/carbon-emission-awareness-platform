import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "CarbonSense - Emission Awareness",
  description: "Track and reduce your carbon footprint with an interactive digital twin.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ marginLeft: '250px', flexGrow: 1, padding: '32px' }}>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
