import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata = {
  title: "Gimmi OS",
  description: "The fitness platform built for the future.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="overflow-x-hidden">
        <body className="antialiased min-h-screen overflow-x-hidden font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}