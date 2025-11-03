"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Menu, LogOut, Plus, Instagram } from "lucide-react"

const navLinks = [
  { href: "/", label: "Úvod" },
  { href: "/prostory", label: "Prostory" },
  { href: "/pridat-prostor", label: "Přidat prostor" },
  { href: "/event-board", label: "Event Board" },
  { href: "/rychla-poptavka", label: "Rychlá poptávka" },
  { href: "/organizace-akce", label: "Organizace akce" },
  { href: "/eventove-agentury", label: "Eventové agentury" },
  { href: "/blog", label: "Blog" },
  { href: "/ceny", label: "Ceník" },
  { href: "/faq", label: "FAQ" },
  { href: "/kontakt", label: "Kontakt" },
]

export function Header() {
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-black bg-white">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Logo variant="black" size="md" />

        <Link
          href="https://www.instagram.com/prostormatcz"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-black hover:bg-black hover:text-white md:hidden"
        >
          <Instagram className="h-5 w-5" />
          <span className="sr-only">Instagram</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-3 md:flex">
            <span className="text-xs font-semibold uppercase tracking-wide text-orange-600">Ušetři čas!</span>
            <Link href="/rychla-poptavka">
              <Button size="sm" className="rounded-full bg-orange-500 px-4 text-white transition hover:bg-orange-600">
                Rychlá poptávka
              </Button>
            </Link>
            <Link href="/pridat-prostor">
              <Button size="sm" className="rounded-full bg-black px-4 text-white transition hover:bg-gray-800">
                <Plus className="mr-1 h-4 w-4" />
                Přidat prostor
              </Button>
            </Link>
            {status === "loading" ? (
              <>
                <Button variant="ghost" size="sm" className="rounded-full text-gray-400" disabled>
                  Načítám…
                </Button>
                <Button size="sm" className="rounded-full bg-gray-200 text-gray-500" disabled>
                  …
                </Button>
              </>
            ) : session ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full p-2">
                      <User className="h-4 w-4" />
                      <span className="sr-only">Uživatelské menu</span>
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
                    <DropdownMenuItem onClick={() => signOut()} className="rounded-lg text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Odhlásit se
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/prihlaseni">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Přihlásit se
                  </Button>
                </Link>
                <Link href="/registrace">
                  <Button size="sm" className="rounded-full bg-black text-white transition hover:bg-gray-800">
                    Registrace
                  </Button>
                </Link>
              </>
            )}
            <Link
              href="https://www.instagram.com/prostormatcz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-black hover:bg-black hover:text-white"
            >
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="inline-flex h-11 w-11 items-center justify-center gap-2 rounded-full border-black/10 bg-white px-0 text-sm font-medium shadow-sm transition hover:border-black hover:bg-black hover:text-white sm:w-auto sm:px-5"
                >
                  <Menu className="h-5 w-5" />
                  <span className="hidden sm:inline">Menu</span>
                  <span className="sr-only">Otevřít navigaci</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-full max-w-xs flex-col rounded-l-3xl border-l border-gray-100 px-0 pb-0 pt-0 sm:max-w-sm">
                <div className="flex h-full flex-col">
                  <SheetHeader className="border-b border-gray-100 px-6 pb-6 pt-8 text-left">
                    <Link href="/" onClick={closeMenu} className="inline-flex items-center -ml-[3px]">
                      <Logo variant="black" size="sm" href={null} className="h-7 w-auto" />
                      <span className="sr-only">Prostormat domů</span>
                    </Link>
                    <SheetTitle className="sr-only">Navigace</SheetTitle>
                    <SheetDescription className="text-sm text-gray-500" />
                  </SheetHeader>

                  <nav className="flex-1 overflow-y-auto px-2 py-6">
                    <div className="space-y-1">
                      {navLinks.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMenu}
                          className="flex items-center justify-between rounded-2xl px-4 py-3 text-base font-medium text-gray-700 transition hover:bg-gray-100 hover:text-black"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="px-4 pt-4">
                      <Link
                        href="https://www.instagram.com/prostormatcz"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeMenu}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 transition hover:bg-black hover:text-white"
                      >
                        <Instagram className="h-5 w-5" />
                        <span className="sr-only">Instagram</span>
                      </Link>
                    </div>
                  </nav>

                  <div className="space-y-4 border-t border-gray-100 px-6 pb-8 pt-6">
                    {status === "loading" ? (
                      <Skeleton className="h-12 w-full rounded-xl" />
                    ) : session ? (
                      <>
                        <Link href="/dashboard" onClick={closeMenu}>
                          <Button variant="ghost" size="lg" className="flex w-full items-center justify-start gap-3 rounded-xl hover:bg-gray-100">
                            <User className="h-5 w-5" />
                            {session.user?.name || session.user?.email}
                          </Button>
                        </Link>
                        <Link href="/pridat-prostor" onClick={closeMenu}>
                          <Button size="lg" className="w-full rounded-xl bg-black text-white transition hover:bg-gray-800">
                            <Plus className="mr-2 h-5 w-5" />
                            Přidat prostor
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="lg"
                          className="flex w-full items-center justify-start gap-3 rounded-xl text-red-600 transition hover:bg-red-50"
                          onClick={() => {
                            signOut()
                            closeMenu()
                          }}
                        >
                          <LogOut className="h-5 w-5" />
                          Odhlásit se
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/prihlaseni" onClick={closeMenu} className="block">
                          <Button variant="outline" size="lg" className="w-full rounded-xl border-gray-200">
                            Přihlásit se
                          </Button>
                        </Link>
                        <Link href="/registrace" onClick={closeMenu} className="block">
                          <Button size="lg" className="w-full rounded-xl bg-black text-white transition hover:bg-gray-800">
                            Registrace
                          </Button>
                        </Link>
                        <Link href="/pridat-prostor" onClick={closeMenu} className="block">
                          <Button variant="outline" size="lg" className="w-full rounded-xl border-gray-200">
                            <Plus className="mr-2 h-5 w-5" />
                            Přidat prostor
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
