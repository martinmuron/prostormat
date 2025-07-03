import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { AnimatedBackground, FloatingShapes } from "@/components/ui/animated-background"
import { Users, Target, Heart, Award, Mail, Linkedin, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Hero Section */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <FloatingShapes />
        <div className="max-w-4xl mx-auto text-center relative z-20">
          <div className="animate-slide-up">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 hover-lift">
              <Users className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-display text-white mb-6 font-black tracking-tight drop-shadow-lg">
              O nás
            </h1>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-title-3 text-gray-200 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Jsme tým profesionálů, kteří věří, že každá akce si zaslouží perfektní prostor. 
              Naším posláním je spojovat organizátory s nejlepšími prostory v Praze.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <ScrollReveal>
              <div className="text-center p-8 bg-gray-50 rounded-3xl hover-lift transition-all duration-300">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-title-3 font-bold text-black mb-4">Naše mise</h3>
                <p className="text-body text-gray-600 leading-relaxed">
                  Usnadnit organizátorům akcí hledání perfektního prostoru a majitelům prostorů 
                  pomoci najít správné klienty. Bez provizí, transparentně a efektivně.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="text-center p-8 bg-gray-50 rounded-3xl hover-lift transition-all duration-300">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-title-3 font-bold text-black mb-4">Naše hodnoty</h3>
                <p className="text-body text-gray-600 leading-relaxed">
                  Věříme v transparentnost, kvalitu a osobní přístup. Každý klient je pro nás 
                  důležitý a snažíme se mu poskytnout nejlepší možný servis.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="text-center p-8 bg-gray-50 rounded-3xl hover-lift transition-all duration-300">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-title-3 font-bold text-black mb-4">Naše vize</h3>
                <p className="text-body text-gray-600 leading-relaxed">
                  Stát se největší a nejdůvěryhodnější platformou pro event prostory v České republice 
                  a expandovat do dalších evropských měst.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6 bg-gray-50 relative">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-title-1 text-black mb-6 font-bold">
                Náš příběh
              </h2>
              <p className="text-body text-gray-600 max-w-3xl mx-auto text-lg font-medium leading-relaxed">
                Prostormat vznikl z osobní potřeby našich zakladatelů najít perfektní prostor 
                pro firemní akci, což se ukázalo být neočekávaně složité.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <ScrollReveal delay={100}>
              <div>
                <h3 className="text-title-2 font-bold text-black mb-6">
                  Jak to všechno začalo
                </h3>
                <div className="space-y-4 text-body text-gray-700 leading-relaxed">
                  <p>
                    V roce 2023 jsme hledali prostor pro významnou firemní akci v Praze. 
                    Po týdnech neúspěšného hledání přes různé kanály jsme si uvědomili, 
                    že chybí centrální místo, kde by se organizátoři mohli jednoduše 
                    spojit s majiteli prostorů.
                  </p>
                  <p>
                    Rozhodli jsme se tento problém vyřešit nejen pro sebe, ale pro všechny 
                    organizátory akcí v Praze. Vznikla tak myšlenka Prostormatu - platformy, 
                    která by spojovala dva světy bez zbytečných komplikací.
                  </p>
                  <p>
                    Dnes jsme pyšní na to, že pomáháme stovkám organizátorů najít své 
                    ideální prostory a desítkám majitelů prostorů získávat nové klienty.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="bg-white p-8 rounded-3xl shadow-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-black mb-2">2023</div>
                  <div className="text-callout text-gray-600 mb-6">Rok založení</div>
                </div>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-black">50+</div>
                    <div className="text-callout text-gray-600">Prostorů</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-black">200+</div>
                    <div className="text-callout text-gray-600">Akcí</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-black">500+</div>
                    <div className="text-callout text-gray-600">Uživatelů</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-black">0%</div>
                    <div className="text-callout text-gray-600">Provize</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-title-1 text-black mb-6 font-bold">
                Náš tým
              </h2>
              <p className="text-body text-gray-600 max-w-3xl mx-auto text-lg font-medium leading-relaxed">
                Jsme skupina profesionálů s bohatými zkušenostmi v technologiích, 
                event managementu a podnikání.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <ScrollReveal delay={100}>
              <div className="text-center group">
                <div className="relative mb-6 mx-auto w-48 h-48 overflow-hidden rounded-3xl hover-lift transition-all duration-300 group-hover:scale-105">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <Users className="w-16 h-16 text-gray-500" />
                  </div>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-title-3 font-bold text-black mb-2">Martin Novák</h3>
                <p className="text-callout text-gray-600 mb-4">Zakladatel & CEO</p>
                <p className="text-body text-gray-600 mb-6 leading-relaxed">
                  10+ let zkušeností v event managementu a technologickém sektoru. 
                  Vede strategii a rozvoj platformy.
                </p>
                <div className="flex justify-center gap-3">
                  <a href="mailto:martin@prostormat.cz" className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="text-center group">
                <div className="relative mb-6 mx-auto w-48 h-48 overflow-hidden rounded-3xl hover-lift transition-all duration-300 group-hover:scale-105">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <Users className="w-16 h-16 text-gray-500" />
                  </div>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-title-3 font-bold text-black mb-2">Jana Svobodová</h3>
                <p className="text-callout text-gray-600 mb-4">CTO & Spoluzakladatelka</p>
                <p className="text-body text-gray-600 mb-6 leading-relaxed">
                  Expertka na vývoj software a UX design. Zodpovídá za technickou stránku 
                  platformy a uživatelský zážitek.
                </p>
                <div className="flex justify-center gap-3">
                  <a href="mailto:jana@prostormat.cz" className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="text-center group">
                <div className="relative mb-6 mx-auto w-48 h-48 overflow-hidden rounded-3xl hover-lift transition-all duration-300 group-hover:scale-105">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <Users className="w-16 h-16 text-gray-500" />
                  </div>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-title-3 font-bold text-black mb-2">Tomáš Dvořák</h3>
                <p className="text-callout text-gray-600 mb-4">Head of Sales</p>
                <p className="text-body text-gray-600 mb-6 leading-relaxed">
                  Specialista na business development a partnerství. Stará se o vztahy 
                  s majiteli prostorů a rozvoj obchodních aktivit.
                </p>
                <div className="flex justify-center gap-3">
                  <a href="mailto:tomas@prostormat.cz" className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-gray-50 relative">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-title-1 text-black mb-6 font-bold">
                Proč nás vybrat
              </h2>
              <p className="text-body text-gray-600 max-w-3xl mx-auto text-lg font-medium leading-relaxed">
                Naše hodnoty a přístup nás odlišují od konkurence
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollReveal delay={100}>
              <div className="bg-white p-8 rounded-3xl shadow-lg">
                <h3 className="text-title-3 font-bold text-black mb-4">Žádné provize</h3>
                <p className="text-body text-gray-600 leading-relaxed">
                  Na rozdíl od ostatních platforem neúčtujeme provize z rezervací. 
                  Majitelé prostorů platí pouze roční předplatné, organizátoři nic.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="bg-white p-8 rounded-3xl shadow-lg">
                <h3 className="text-title-3 font-bold text-black mb-4">Osobní přístup</h3>
                <p className="text-body text-gray-600 leading-relaxed">
                  Každému klientovi věnujeme osobní pozornost. Nejsme jen další tech platforma, 
                  ale partner, který vám pomůže najít to pravé.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="bg-white p-8 rounded-3xl shadow-lg">
                <h3 className="text-title-3 font-bold text-black mb-4">Lokální znalosti</h3>
                <p className="text-body text-gray-600 leading-relaxed">
                  Známe pražskou event scénu jako nikdo jiný. Každý prostor osobně navštěvujeme 
                  a ověřujeme kvalitu před zařazením do katalogu.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="bg-white p-8 rounded-3xl shadow-lg">
                <h3 className="text-title-3 font-bold text-black mb-4">Rychlá komunikace</h3>
                <p className="text-body text-gray-600 leading-relaxed">
                  Odpovídáme na dotazy do 24 hodin a aktivně pomáháme s řešením problémů. 
                  Náš tým je vždycky připraven pomoci.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white relative">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-title-1 text-black mb-6 font-bold">
              Chcete se k nám připojit?
            </h2>
            <p className="text-body text-gray-600 mb-12 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
              Hledáme talentované lidi, kteří chtějí změnit způsob, jakým se organizují akce v Praze.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a href="/kontakt">
                <Button 
                  size="lg" 
                  className="px-12 py-4 bg-black text-white hover:bg-gray-800 rounded-2xl text-headline font-semibold hover-lift transition-all duration-300"
                >
                  Kontaktujte nás
                </Button>
              </a>
              <a href="/prostory">
                <Button 
                  variant="secondary"
                  size="lg" 
                  className="px-12 py-4 border-2 border-black text-black hover:bg-black hover:text-white rounded-2xl text-headline font-semibold hover-lift transition-all duration-300"
                >
                  Prohlédnout prostory
                </Button>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
} 