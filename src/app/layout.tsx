import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { Activity } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Gimmi - The Premium Gym OS",
  description: "The ultimate modern platform for fitness communities.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gimmi",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-gray-100 selection:bg-indigo-500 selection:text-white">
        <ClerkProvider>
          {/* Floating Glass Header */}
          <header className="fixed top-0 w-full z-50 border-b border-white/[0.08] bg-black/60 backdrop-blur-xl transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">

              {/* Logo / Brand */}
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-500 group-hover:scale-105">
                  <Activity size={20} strokeWidth={2.5} />
                </div>
                <span className="font-extrabold text-2xl tracking-tighter text-white">Gimmi</span>
              </div>

              {/* Auth Navigation */}
              <div className="flex gap-4 items-center">
                <Show when="signed-out">
                  <div className="flex items-center gap-6">
                    <div className="text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer">
                      <SignInButton mode="modal" fallbackRedirectUrl="/admin" />
                    </div>
                    <div className="bg-white text-black text-sm font-bold px-5 py-2.5 rounded-full hover:scale-105 hover:bg-gray-100 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                      <SignUpButton mode="modal" fallbackRedirectUrl="/admin" />
                    </div>
                  </div>
                </Show>
                <Show when="signed-in">
                  <div className="hover:scale-105 transition-transform duration-300">
                    <UserButton userProfileMode="navigation" userProfileUrl="/profile" />
                  </div>
                </Show>
              </div>

            </div>
          </header>

          <main className="flex-1 w-full flex flex-col pt-20">
            {children}
          </main>
        </ClerkProvider>
      </body>
    </html>
  );
}
