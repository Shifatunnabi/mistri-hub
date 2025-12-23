"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, X, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { toast } from "react-hot-toast"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { AnnouncementDropdown } from "@/components/announcement-dropdown"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const isLoggedIn = status === "authenticated"

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 shadow-md backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-110">
              <Image src="/logo.png" alt="MistriHub Logo" fill className="object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight transition-colors duration-300 group-hover:text-primary lg:text-2xl">
              MistriHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            <Link href="/job-board" className="text-sm font-medium transition-colors duration-200 hover:text-primary">
              Job Board
            </Link>
            <Link href="/services" className="text-sm font-medium transition-colors duration-200 hover:text-primary">
              Services
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium transition-colors duration-200 hover:text-primary"
            >
              How It Works
            </Link>
          </div>

          {/* Auth Buttons / User Avatar */}
          <div className="hidden items-center space-x-4 md:flex">
            {isLoggedIn ? (
              <>
                <AnnouncementDropdown />
                <NotificationDropdown />
                <Link href="/profile">
                  <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-transparent transition-all duration-300 hover:ring-primary">
                    <AvatarImage
                      src={session?.user?.profilePhoto || "/placeholder.svg?height=40&width=40"}
                      alt={session?.user?.name || "User"}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    signOut({ callbackUrl: "/" })
                    toast.success("Logged out successfully")
                  }}
                  className="transition-all duration-300 hover:scale-105"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="transition-all duration-300 hover:scale-105">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 transition-transform duration-300" />
            ) : (
              <Menu className="h-6 w-6 transition-transform duration-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="animate-fade-in-up border-t border-border py-4 md:hidden">
            <div className="flex flex-col space-y-4">
              <Link
                href="/job-board"
                className="text-sm font-medium transition-colors duration-200 hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Job Board
              </Link>
              <Link
                href="/services"
                className="text-sm font-medium transition-colors duration-200 hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/how-it-works"
                className="text-sm font-medium transition-colors duration-200 hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              {isLoggedIn ? (
                <Link
                  href="/profile"
                  className="flex items-center space-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">Profile</span>
                </Link>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Button variant="ghost" asChild className="w-full">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
