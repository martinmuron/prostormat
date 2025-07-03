"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
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
          <Logo variant="black" size="md" />

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
            <Link href="/ceny" className="text-body text-gray-700 hover:text-black transition-colors">
              Ceny
            </Link>
            <Link href="/pridat-prostor" className="text-body text-gray-700 hover:text-black transition-colors">
              Přidat prostor
            </Link>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "loading" ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : session ? (
              <div className="flex items-center space-x-3">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{session.user?.name || session.user?.email}</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Odhlásit se
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/prihlaseni">
                  <Button variant="ghost" size="sm">Přihlásit se</Button>
                </Link>
                <Link href="/registrace">
                  <Button size="sm" className="bg-black text-white hover:bg-gray-800">Registrace</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
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
                href="/ceny" 
                className="block text-body text-gray-700 hover:text-black transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ceny
              </Link>
              <Link 
                href="/pridat-prostor" 
                className="block text-body text-gray-700 hover:text-black transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Přidat prostor
              </Link>
              
              {/* Mobile Auth */}
              <div className="pt-4 border-t border-gray-200">
                {status === "loading" ? (
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                ) : session ? (
                  <div className="space-y-2">
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        {session.user?.name || session.user?.email}
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
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/prihlaseni" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Přihlásit se
                      </Button>
                    </Link>
                    <Link href="/registrace" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full justify-start bg-black text-white hover:bg-gray-800">
                        Registrace
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}