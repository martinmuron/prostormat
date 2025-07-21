"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { User, Menu, LogOut } from "lucide-react"

export function Header() {
  const { data: session, status } = useSession()

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
            <Link href="/kontakt" className="text-body text-gray-700 hover:text-black transition-colors">
              Kontakt
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{session.user?.name || session.user?.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Odhlásit se
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/prihlaseni">
                  <Button variant="ghost" size="sm">Přihlásit se</Button>
                </Link>
                <Link href="/registrace">
                  <Button size="sm">Registrace</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden p-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <nav className="flex flex-col space-y-4 mt-6">
                <Link 
                  href="/prostory" 
                  className="text-lg font-medium text-gray-700 hover:text-black transition-colors"
                >
                  Prostory
                </Link>
                <Link 
                  href="/pozadavky" 
                  className="text-lg font-medium text-gray-700 hover:text-black transition-colors"
                >
                  Požadavky na akce
                </Link>
                <Link 
                  href="/blog" 
                  className="text-lg font-medium text-gray-700 hover:text-black transition-colors"
                >
                  Blog
                </Link>
                <Link 
                  href="/ceny" 
                  className="text-lg font-medium text-gray-700 hover:text-black transition-colors"
                >
                  Ceny
                </Link>
                <Link 
                  href="/kontakt" 
                  className="text-lg font-medium text-gray-700 hover:text-black transition-colors"
                >
                  Kontakt
                </Link>
                <Link 
                  href="/pridat-prostor" 
                  className="text-lg font-medium text-gray-700 hover:text-black transition-colors"
                >
                  Přidat prostor
                </Link>
                
                {/* Mobile Auth */}
                <div className="pt-6 border-t border-gray-200 space-y-3">
                  {status === "loading" ? (
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  ) : session ? (
                    <>
                      <Link href="/dashboard">
                        <Button variant="ghost" size="lg" className="w-full justify-start">
                          <User className="h-5 w-5 mr-3" />
                          {session.user?.name || session.user?.email}
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="lg" 
                        className="w-full justify-start text-red-600" 
                        onClick={() => signOut()}
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Odhlásit se
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/prihlaseni">
                        <Button variant="outline" size="lg" className="w-full">
                          Přihlásit se
                        </Button>
                      </Link>
                      <Link href="/registrace">
                        <Button size="lg" className="w-full">
                          Registrace
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}