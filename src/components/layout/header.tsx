"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { User, Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-title-3 font-bold text-black">
            Prostormat
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/prostory" className="text-body text-gray-700 hover:text-black transition-colors">
              Prostory
            </Link>
            <Link href="/pozadavky" className="text-body text-gray-700 hover:text-black transition-colors">
              Požadavky na akce
            </Link>
            <Link href="/blog" className="text-body text-gray-700 hover:text-black transition-colors">
              Blog
            </Link>
            <Link href="/pridat-prostor" className="text-body text-gray-700 hover:text-black transition-colors">
              Přidat prostor
            </Link>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "loading" ? (
              <div className="h-9 w-20 bg-gray-100 rounded-full animate-pulse" />
            ) : session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {session.user?.name || "Dashboard"}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Odhlásit se
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => signIn()}>
                  Přihlásit se
                </Button>
                <Link href="/registrace">
                  <Button size="sm">
                    Registrace
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="space-y-4">
              <Link 
                href="/prostory" 
                className="block text-body text-gray-700 hover:text-black transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Prostory
              </Link>
              <Link 
                href="/pozadavky" 
                className="block text-body text-gray-700 hover:text-black transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Požadavky na akce
              </Link>
              <Link 
                href="/blog" 
                className="block text-body text-gray-700 hover:text-black transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/pridat-prostor" 
                className="block text-body text-gray-700 hover:text-black transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Přidat prostor
              </Link>
              
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {session ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        signOut()
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      Odhlásit se
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        signIn()
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      Přihlásit se
                    </Button>
                    <Link href="/registrace" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full">
                        Registrace
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}