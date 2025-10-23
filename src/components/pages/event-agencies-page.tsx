'use client'

import { Mail } from 'lucide-react'
import { PageHero } from '@/components/layout/page-hero'
import { Button } from '@/components/ui/button'

export function EventAgenciesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow="Spolupráce"
        title="Eventové agentury"
        subtitle="ProstorMat propojuje pečlivě vybrané eventové agentury s firmami a značkami, které chtějí připravit výjimečné akce. Společně tvoříme síť partnerů, kteří sdílí důraz na kvalitu a profesionální servis."
        tone="rose"
        variant="plain"
        className="bg-gradient-to-br from-rose-50 via-white to-fuchsia-100"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-rose-100 bg-white/80 p-6 text-base text-gray-700 shadow-lg backdrop-blur">
          <p className="text-lg font-semibold text-gray-900">
            Připravujeme novou sekci pro naše partnerské agentury.
          </p>
          <p>
            Pokud jste eventová agentura a máte zájem o spolupráci, napište nám prosím na&nbsp;
            <a href="mailto:info@prostormat.cz" className="font-semibold text-rose-600 hover:text-rose-700">
              info@prostormat.cz
            </a>
            . Ozveme se vám co nejdříve.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="magnetic-button hover-lift rounded-2xl border-2 border-rose-500 bg-rose-500 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-rose-600 hover:text-white"
            >
              <a href="mailto:info@prostormat.cz">
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Ozvat se
                </span>
              </a>
            </Button>
          </div>
        </div>
      </PageHero>
    </div>
  )
}
