"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Menu, LogOut, Plus } from "lucide-react"

export function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="bg-white border-b border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo variant="black" size="md" />
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="space-x-1">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/prostory" className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-2 rounded-md">
                    Prostory
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/pozadavky" className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-2 rounded-md">
                    Požadavky
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/rychla-poptavka" className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-2 rounded-md">
                    Rychlá poptávka
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-2 rounded-md">
                    Blog
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/kontakt" className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-2 rounded-md">
                    Kontakt
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop Auth & CTA */}
          <div className="hidden md:flex items-center space-x-2">
            {status === "loading" ? (
              <Skeleton className="w-8 h-8 rounded-full" />
            ) : session ? (
              <div className="flex items-center space-x-2">
                <Link href="/pridat-prostor">
                  <Button size="sm" className="bg-black text-white hover:bg-gray-800 rounded-full px-4">
                    <Plus className="h-4 w-4 mr-1" />
                    Přidat prostor
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full p-2">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl border-gray-100">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center rounded-lg">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="text-red-600 rounded-lg">
                      <LogOut className="mr-2 h-4 w-4" />
                      Odhlásit se
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/prihlaseni">
                  <Button variant="ghost" size="sm" className="rounded-full">Přihlásit se</Button>
                </Link>
                <Link href="/registrace">
                  <Button size="sm" className="bg-black text-white hover:bg-gray-800 rounded-full">Registrace</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center space-x-2 md:hidden">
            {session && (
              <Link href="/pridat-prostor">
                <Button size="sm" className="bg-black text-white hover:bg-gray-800 rounded-full p-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 rounded-full">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 rounded-l-2xl">
                <nav className="flex flex-col space-y-1 mt-8">
                  <Link 
                    href="/prostory" 
                    className="text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors px-4 py-3 rounded-xl"
                  >
                    Prostory
                  </Link>
                  <Link 
                    href="/pozadavky" 
                    className="text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors px-4 py-3 rounded-xl"
                  >
                    Požadavky na akce
                  </Link>
                  <Link 
                    href="/rychla-poptavka" 
                    className="text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors px-4 py-3 rounded-xl"
                  >
                    Rychlá poptávka
                  </Link>
                  <Link 
                    href="/blog" 
                    className="text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors px-4 py-3 rounded-xl"
                  >
                    Blog
                  </Link>
                  <Link 
                    href="/ceny" 
                    className="text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors px-4 py-3 rounded-xl"
                  >
                    Ceny
                  </Link>
                  <Link 
                    href="/kontakt" 
                    className="text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors px-4 py-3 rounded-xl"
                  >
                    Kontakt
                  </Link>
                  
                  {/* Mobile Auth */}
                  <div className="pt-6 mt-6 border-t border-gray-100 space-y-3">
                    {status === "loading" ? (
                      <Skeleton className="w-full h-12 rounded-xl" />
                    ) : session ? (
                      <>
                        <Link href="/dashboard">
                          <Button variant="ghost" size="lg" className="w-full justify-start rounded-xl hover:bg-gray-50">
                            <User className="h-5 w-5 mr-3" />
                            {session.user?.name || session.user?.email}
                          </Button>
                        </Link>
                        <Link href="/pridat-prostor">
                          <Button size="lg" className="w-full bg-black text-white hover:bg-gray-800 rounded-xl">
                            <Plus className="h-5 w-5 mr-2" />
                            Přidat prostor
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="lg" 
                          className="w-full justify-start text-red-600 hover:bg-red-50 rounded-xl" 
                          onClick={() => signOut()}
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          Odhlásit se
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/prihlaseni">
                          <Button variant="outline" size="lg" className="w-full rounded-xl border-gray-200">
                            Přihlásit se
                          </Button>
                        </Link>
                        <Link href="/registrace">
                          <Button size="lg" className="w-full bg-black text-white hover:bg-gray-800 rounded-xl">
                            Registrace
                          </Button>
                        </Link>
                        <Link href="/pridat-prostor">
                          <Button variant="outline" size="lg" className="w-full rounded-xl border-gray-200 mt-2">
                            <Plus className="h-5 w-5 mr-2" />
                            Přidat prostor
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
      </div>
    </header>
  )
}