import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "react-hot-toast"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/components/auth-provider"

export const metadata: Metadata = {
  title: "MistriHub ",
  description:
    "Connect with trusted local helpers for all your everyday tasks - plumbing, repairs, furniture assembly, and more.",
  generator: "",
  icons: {
    icon: [
      {
        url: "/logo.png",
        sizes: "any",
      },
      
    ],
    apple: "/apple-icon.png",
    shortcut: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1a3a3a",
                color: "#f5f1e8",
                fontFamily: "Monument, sans-serif",
              },
              success: {
                iconTheme: {
                  primary: "#4a6363",
                  secondary: "#f5f1e8",
                },
              },
            }}
          />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
