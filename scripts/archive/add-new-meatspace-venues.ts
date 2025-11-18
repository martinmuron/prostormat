#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set in environment variables')
}

// Use DATABASE_URL directly - it should already have correct parameters
const prisma = new PrismaClient()

type VenueSeed = {
  name: string
  slug: string
  address: string
  district: string
  description: string
  capacityStanding: number | null
  capacitySeated: number | null
  venueType: string | null
  amenities: string[]
  contactEmail: string | null
  contactPhone: string | null
  websiteUrl: string | null
  instagramUrl: string | null
  musicAfter10?: boolean | null
  parentSlug?: string | null
  status?: string
}

const venues: VenueSeed[] = [
  // ============================================
  // STANDALONE VENUES
  // ============================================
  {
    name: 'Kaunický palác',
    slug: 'kaunicky-palac',
    address: 'Praha 1',
    district: 'Praha 1',
    description: [
      'Barokní Kaunický palác vznikl kolem roku 1725 podle návrhů předních stavitelů Františka Maxmiliána Kaňky a Giovanniho Alliprandiho.',
      'Jeho interiéry zdobí romantická výmalba z první poloviny 19. století, zejména v reprezentačním sále, který vytváří jedinečnou atmosféru pro slavnostní události.',
      'Prostory paláce nabízejí kompletní zázemí pro konference, školení, firemní večírky i svatby s historickou elegancí v samém centru Prahy.'
    ].join('\n\n'),
    capacityStanding: 150,
    capacitySeated: 150,
    venueType: 'conference',
    amenities: [
      'Wi-Fi',
      'Bezbariérový přístup',
      'Parkování',
      'Historický interiér',
      'Dobové vybavení'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    status: 'published'
  },
  {
    name: 'academy HUB Vary',
    slug: 'academy-hub-karlovy-vary',
    address: 'Karlovy Vary',
    district: 'Karlovy Vary',
    description: [
      'Školící prostor academy HUB Vary se nachází v historickém centru Karlových Varů a poskytuje kreativní prostředí pro malé pracovní skupiny.',
      'Místnost je vybavena moderní zobrazovací technikou, kvalitním kávovarom a flexibilním nábytkem, který lze uspořádat do různých konfigurací podle typu akce.',
      'Prostor je ideální pro workshopy, školení, coworkingová setkání nebo prezentace až pro 15 účastníků s možností zajištění cateringu.'
    ].join('\n\n'),
    capacityStanding: 15,
    capacitySeated: 15,
    venueType: 'conference',
    amenities: [
      'Wi-Fi',
      'Kávovar',
      'Zobrazovací technika',
      'Flexibilní uspořádání nábytku'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    status: 'published'
  },
  {
    name: 'Alforno Pizza & Pasta',
    slug: 'alforno-pizza-pasta',
    address: 'U Zlaté olivy, Praha 1',
    district: 'Praha 1',
    description: [
      'Restaurace Alforno Pizza & Pasta sídlí v historickém domě U Zlaté olivy z roku 1412 a přináší do centra Prahy autentickou italskou atmosféru.',
      'K dispozici jsou čtyři podlaží s oddělenými prostory pro soukromé oslavy, firemní večírky nebo svatby, včetně příjemné zahrádky a privátní místnosti až pro 20 hostů.',
      'Celková kapacita dosahuje 84 míst k sezení s možností exkluzivního cateringu a vlastní italskou pecí pro přípravu pravé pizzy.'
    ].join('\n\n'),
    capacityStanding: null,
    capacitySeated: 84,
    venueType: 'restaurant',
    amenities: [
      'Wi-Fi',
      'Italská pec',
      'Exkluzivní catering',
      'Venkovní zahrádka',
      'Privátní místnosti'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    status: 'published'
  },
  {
    name: 'Demänová Rezort',
    slug: 'demanova-rezort',
    address: 'Nízké Tatry',
    district: 'Nízké Tatry',
    description: [
      'Konferenční resort v srdci Nízkých Tater nabízí několik profesionálně vybavených sálů pro akce od komorních setkání až po velké konference.',
      'Kongresový sál Crocus pojme až 200 lidí v kinostylu, sály Pinus a Robinia jsou určené pro střední akce a koktejlový bar Panorama poskytuje neformální prostředí s výhledem.',
      'Resort disponuje klimatizací, kompletním technickým zázemím, venkovním stanem a možností kombinace konferenčního programu s wellness a horskými aktivitami.'
    ].join('\n\n'),
    capacityStanding: 60,
    capacitySeated: 200,
    venueType: 'hotel',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Parkování',
      'Projekce',
      'Profesionální ozvučení',
      'Flipchart',
      'DJ pult'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    status: 'published'
  },
  {
    name: 'Aparthotel Na Klenici',
    slug: 'aparthotel-na-klenici',
    address: 'Střední Čechy',
    district: 'Střední Čechy',
    description: [
      'Aparthotel v areálu bývalé továrny pod historickým hradem nabízí moderní klimatizované prostory pro firemní akce i soukromé oslavy.',
      'Vybavení zahrnuje zobrazovací techniku, ozvučení, kávovar a nabíjecí stanice pro elektromobily, prostor pojme až 30 účastníků.',
      'Objekt je bezbariérový s vlastním parkováním a flexibilními možnostmi uspořádání pro prezentace, workshopy, teambuilding nebo svatby.'
    ].join('\n\n'),
    capacityStanding: 30,
    capacitySeated: 30,
    venueType: 'hotel',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Parkování',
      'Zobrazovací technika',
      'Profesionální ozvučení',
      'Kávovar',
      'Nabíjecí stanice pro elektromobily',
      'Flipchart'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    status: 'published'
  },
  {
    name: 'Stodola Únětického pivovaru',
    slug: 'stodola-unetickeho-pivovaru',
    address: 'Praha - západ',
    district: 'Praha - západ',
    description: [
      'Pivovarská stodola v areálu Únětického pivovaru spojuje rustikální prostředí s čerstvým pivem přímo ze zdroje a specialitami z grilu a udírny.',
      'Prostor je vhodný pro letní akce s kapacitou až 100 osob, k dispozici je možnost hudby, technická podpora a catering včetně pečení celého vepře.',
      'Stodola nabízí stylové zázemí v přírodě nedaleko Prahy s parkováním, Wi-Fi a pódiem pro živou hudbu nebo prezentace.'
    ].join('\n\n'),
    capacityStanding: 100,
    capacitySeated: 100,
    venueType: 'restaurant',
    amenities: [
      'Wi-Fi',
      'Parkování',
      'Pódium',
      'Profesionální ozvučení',
      'Gril a udírna',
      'Pivnice'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    status: 'published'
  },
  {
    name: 'Malá síň Galerie Mánes',
    slug: 'mala-sin-galerie-manes',
    address: 'Praha 1',
    district: 'Praha 1',
    description: [
      'Intimní prostor v proslulé funkcionalistické budově Galerie Mánes nabízí jedinečný výhled na Vltavu a panorama Prahy.',
      'Malá síň je ideální pro menší akce až do 60 osob vestoje nebo svatby do 25 hostů, zahrnuje vyvýšené pódium, projektor a kuchyňku s kávovarem.',
      'Galerie poskytuje produkční a kurátorskou podporu, propagaci na sociálních sítích a možnost pronájmu doplňkového vybavení pro vaše akce.'
    ].join('\n\n'),
    capacityStanding: 60,
    capacitySeated: 45,
    venueType: 'gallery',
    amenities: [
      'Wi-Fi',
      'Projekce',
      'Vyvýšené pódium',
      'Kuchyňka s kávovarem',
      'Výhled na Vltavu'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    status: 'published'
  },
  {
    name: 'Sporthotel Slavia',
    slug: 'sporthotel-slavia',
    address: 'Vladivostocká 1530/12, Praha 10 - Vršovice',
    district: 'Praha 10',
    description: [
      'Moderně vybavené konferenční prostory v areálu SK Slavia Praha poskytují flexibilní zázemí pro firemní akce i školení.',
      'Modrý salonek pojme až 90 účastníků, Červený salonek 30-40 osob, oba prostory disponují Wi-Fi, televizí, flipchartem a možností zajištění cateringu.',
      'Výhodná poloha ve Vršovicích s dobrou dostupností a příznivé hodinové sazby od 500 Kč činí z hotelu praktickou volbu pro menší i větší akce.'
    ].join('\n\n'),
    capacityStanding: 90,
    capacitySeated: 90,
    venueType: 'hotel',
    amenities: [
      'Wi-Fi',
      'Televize',
      'Flipchart',
      'Catering na vyžádání'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    status: 'published'
  },
  {
    name: 'LL Gallery',
    slug: 'll-gallery',
    address: 'Karlín, Praha 8',
    district: 'Praha 8',
    description: [
      'Prostorná industriální galerie v pečlivě zrestaurované hale bývalé loděnice nabízí přes 500 m² pro výstavy, akce a odvážné koncepty.',
      'Vysoké stropy, cihlové zdi a velká okna zajišťují dostatek přirozeného světla, prostor je klimatizovaný a vybavený moderní technikou.',
      'Galerie v Karlíně zvládne akce až pro 250 lidí s parkováním, Wi-Fi a kompletním technickým zázemím vhodným i pro produkce nebo pop-upové obchody.'
    ].join('\n\n'),
    capacityStanding: 250,
    capacitySeated: null,
    venueType: 'gallery',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Parkování',
      'Vysoké stropy',
      'Přirozené světlo',
      'Moderní technika'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    status: 'published'
  },

  // ============================================
  // PARENT VENUE: Majaland Praha
  // ============================================
  {
    name: 'Majaland Praha',
    slug: 'majaland-praha',
    address: 'Praha - západ',
    district: 'Praha - západ',
    description: [
      'Největší krytý zábavní park v Česku s celkovou rozlohou 13 000 m² inspirovaný světem včelky Máji nabízí jedinečné prostředí pro firemní a rodinné akce.',
      'Park zahrnuje 9 000 m² vnitřních atrakcí a 4 000 m² venkovních prostor s horskou dráhou dlouhou 220 metrů, 30metrovým skluzavkem a karuselovými atrakcemi.',
      'Objekt je klimatizovaný, bezbariérový, s Wi-Fi, projekcí, ozvučením, pódiem, restaurací a parkováním pro 2 400 vozů včetně nabíjecích stanic.'
    ].join('\n\n'),
    capacityStanding: 2000,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Parkování',
      'Projekce',
      'Pódium',
      'Profesionální ozvučení',
      'Nabíjecí stanice pro elektromobily',
      'Restaurace',
      'Atrakce'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    status: 'published'
  },
  {
    name: 'Firemní akce v Majalandu',
    slug: 'majaland-praha-firemni-akce',
    address: 'Praha - západ',
    district: 'Praha - západ',
    description: [
      'Originální teambuilding nebo zábava pro zaměstnance a jejich děti v pohádkovém světě včelky Máji na ploše 13 000 m².',
      'Park nabízí divadelní prostor pro workshopy a prezentace, restauraci a parkování až pro 2 400 vozů.',
      'Maximální kapacita 2 000 osob s kompletním technickým vybavením, klimatizací, Wi-Fi a bezbariérovým přístupem pro firemní dny nebo teambuilding.'
    ].join('\n\n'),
    capacityStanding: 2000,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Parkování',
      'Projekce',
      'Pódium',
      'Profesionální ozvučení',
      'Nabíjecí stanice pro elektromobily',
      'Divadelní prostor',
      'Restaurace'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'majaland-praha',
    status: 'published'
  },
  {
    name: 'Majaland Family Day',
    slug: 'majaland-praha-family-day',
    address: 'Praha - západ',
    district: 'Praha - západ',
    description: [
      'Exkluzivní dětský den pro zaměstnance a jejich rodiny v největším krytém zábavním parku v Česku.',
      'Komplexní balíček zahrnuje vstup, atrakce, divadelní prostor, restauraci a možnost setkání s postavičkami z pohádkového světa.',
      'Prostor pro 2 000 osob s parkováním, klimatizací, Wi-Fi a kompletním technickým zázemím vhodný pro nezapomenutelný rodinný firemní den.'
    ].join('\n\n'),
    capacityStanding: 2000,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Parkování',
      'Projekce',
      'Pódium',
      'Profesionální ozvučení',
      'Nabíjecí stanice pro elektromobily',
      'Restaurace',
      'Atrakce'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'majaland-praha',
    status: 'published'
  },
  {
    name: 'Pronájem celého Majalandu pro event',
    slug: 'majaland-praha-pronajem-cely',
    address: 'Praha - západ',
    district: 'Praha - západ',
    description: [
      'Exkluzivní pronájem celého zábavního parku Majaland pro vaši akci s kapacitou až 2 000 osob.',
      'Kompletní areál zahrnuje všechny atrakce, divadelní prostor, restauraci, parkování pro 2 400 aut a technické zázemí.',
      'Cena od 330 000 Kč zahrnuje bezbariérový přístup, klimatizaci, Wi-Fi, projekci, ozvučení a nabíjecí stanice.'
    ].join('\n\n'),
    capacityStanding: 2000,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Parkování',
      'Projekce',
      'Pódium',
      'Profesionální ozvučení',
      'Nabíjecí stanice pro elektromobily',
      'Restaurace',
      'Atrakce'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'majaland-praha',
    status: 'published'
  },
  {
    name: 'Narozeninová oslava s včelkou Májou',
    slug: 'majaland-praha-narozeninova-oslava',
    address: 'Praha - západ',
    district: 'Praha - západ',
    description: [
      'Jedinečná dětská narozeninová oslava v největším krytém zábavním parku s možností setkání s postavičkami z pohádkového světa včelky Máji.',
      'Balíček pro maximálně 30 osob zahrnuje vstup, atrakce, klimatizované prostory a možnost občerstvení.',
      'Cena od 4 041 Kč pro deset dětí a deset dospělých s parkováním, Wi-Fi, bezbariérovým přístupem a kompletním technickým zázemím.'
    ].join('\n\n'),
    capacityStanding: 30,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Parkování',
      'Projekce',
      'Pódium',
      'Profesionální ozvučení',
      'Nabíjecí stanice pro elektromobily',
      'Atrakce'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'majaland-praha',
    status: 'published'
  },

  // ============================================
  // PARENT VENUE: POP Airport
  // ============================================
  {
    name: 'POP Airport',
    slug: 'pop-airport',
    address: 'Tuchoměřice, Praha - západ',
    district: 'Praha - západ',
    description: [
      'Nákupní a zábavní centrum POP Airport s 80 obchody, restauracemi a flexibilními event prostory až pro 10 000 osob na ploše 32 000 m².',
      'Areál zahrnuje outletové centrum, konferenční místnosti, vyhlídkovou terasu, VIP lounge, venkovní prostory a přilehlé atrakce Dinosauria a Majaland.',
      'K dispozici je parkování pro 2 000 aut s 25 nabíjecími stanicemi, Wi-Fi, klimatizace, bezbariérový přístup a kompletní technické zázemí.'
    ].join('\n\n'),
    capacityStanding: 10000,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Parkování',
      'Projekce',
      'Profesionální ozvučení',
      'Nabíjecí stanice pro elektromobily'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    status: 'published'
  },
  {
    name: 'POP Outlet',
    slug: 'pop-airport-pop-outlet',
    address: 'Tuchoměřice, Praha - západ',
    district: 'Praha - západ',
    description: [
      'Outletové centrum stylizované do uliček a bulvárů ve stylu Staré Prahy s flexibilními prostory pro akce až 2 500 osob.',
      'K dispozici jsou obchodní jednotky, VIP lounge, konferenční prostory a vyhlídková terasa s výhledem na letadla.',
      'Kompletní vybavení zahrnuje klimatizaci, Wi-Fi, projekci, pódium, ozvučení, flipchart a parkování s nabíjecími stanicemi.'
    ].join('\n\n'),
    capacityStanding: 2500,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Parkování',
      'Projekce',
      'Pódium',
      'Profesionální ozvučení',
      'Nabíjecí stanice pro elektromobily',
      'Flipchart',
      'Vyhlídková terasa'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'pop-airport',
    status: 'published'
  },
  {
    name: 'POP Private Shopping',
    slug: 'pop-airport-pop-private-shopping',
    address: 'Tuchoměřice, Praha - západ',
    district: 'Praha - západ',
    description: [
      'Exkluzivní privátní nákupní akce v outletovém centru s možností firemního programu, cateringu a tematických aktivit až pro 10 000 osob.',
      'Prostor lze přizpůsobit prezentacím, módním přehlídkám, teambuildingovým aktivitám nebo produktovým demonstracím.',
      'Komplexní zázemí zahrnuje klimatizaci, Wi-Fi, projekci, pódium, ozvučení a parkování s nabíjecími stanicemi.'
    ].join('\n\n'),
    capacityStanding: 10000,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Parkování',
      'Projekce',
      'Pódium',
      'Profesionální ozvučení',
      'Nabíjecí stanice pro elektromobily'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'pop-airport',
    status: 'published'
  },
  {
    name: 'Speciální eventy na klíč',
    slug: 'pop-airport-specialni-eventy-na-klic',
    address: 'Tuchoměřice, Praha - západ',
    district: 'Praha - západ',
    description: [
      'Kompletní servis eventů na klíč v POP Airport od workshopů pro 10 osob až po konference pro 10 000 účastníků.',
      'Flexibilní prostory zahrnují outletové centrum, konferenční místnosti, venkovní plochy a možnost kombinace s přilehlými atrakcemi.',
      'K dispozici je klimatizace, Wi-Fi, bezbariérový přístup, projekce, ozvučení, parkování a nabíjecí stanice.'
    ].join('\n\n'),
    capacityStanding: 10000,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Parkování',
      'Projekce',
      'Profesionální ozvučení',
      'Nabíjecí stanice pro elektromobily'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'pop-airport',
    status: 'published'
  },
  {
    name: 'Venkovní prostory POP Airport',
    slug: 'pop-airport-venkovni-prostory',
    address: 'Tuchoměřice, Praha - západ',
    district: 'Praha - západ',
    description: [
      'Venkovní plochy POP Airport vhodné pro open-air akce, motoristické show, prezentace nebo doprovodné programy až pro 10 000 osob.',
      'Zahrnují terasu, kolonádu před hlavním vchodem, venkovní parkoviště, travnaté plochy, multi-golf a skatepark.',
      'Prostory jsou ideální pro autosalony, testovací jízdy, focení nebo filmování s možností kompletního technického zázemí.'
    ].join('\n\n'),
    capacityStanding: 10000,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Parkování',
      'Bezbariérový přístup',
      'Terasa',
      'Multi-golf',
      'Skatepark'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'pop-airport',
    status: 'published'
  },
  {
    name: 'Parkoviště POP Airport',
    slug: 'pop-airport-parkoviste',
    address: 'Tuchoměřice, Praha - západ',
    district: 'Praha - západ',
    description: [
      'Prostorné parkoviště s kapacitou 2 400 míst, z nichž většina je krytá, nabízí 124 wallboxů pro nabíjení elektromobilů.',
      'Prostor lze využít pro prezentace automobilů, testovací jízdy, focení nebo filmování.',
      'Parkoviště je bezbariérové s možností zajištění kompletního zázemí pro akce spojené s automobilovou tématikou.'
    ].join('\n\n'),
    capacityStanding: 2400,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Parkování',
      'Nabíjecí stanice pro elektromobily',
      'Bezbariérový přístup'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'pop-airport',
    status: 'published'
  },
  {
    name: 'POP Night Shopping Partner',
    slug: 'pop-airport-pop-night-shopping-partner',
    address: 'Tuchoměřice, Praha - západ',
    district: 'Praha - západ',
    description: [
      'Večerní nákupní akce pro partnery a obchodní zákazníky v outletovém centru s kapacitou až 2 000 osob.',
      'Prostor stylizovaný do uliček Staré Prahy nabízí jedinečnou atmosféru pro firemní večírky nebo exkluzivní prodejní akce.',
      'K dispozici je klimatizace, Wi-Fi, projekce, pódium, ozvučení, bezbariérový přístup a parkování s nabíjecími stanicemi.'
    ].join('\n\n'),
    capacityStanding: 2000,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Parkování',
      'Projekce',
      'Pódium',
      'Profesionální ozvučení',
      'Nabíjecí stanice pro elektromobily'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'pop-airport',
    status: 'published'
  },
  {
    name: 'Firemní workshop se stylistkou',
    slug: 'pop-airport-firemni-workshop-se-stylistkou',
    address: 'Tuchoměřice, Praha - západ',
    district: 'Praha - západ',
    description: [
      'Atraktivní firemní workshop spojený s přednáškou a radami profesionální stylistky v outletovém centru s více než 200 světovými značkami.',
      'Program pro maximálně 10 osob zahrnuje styling poradenství, nákupní průvodce a možnost cateringu.',
      'K dispozici je klimatizace, Wi-Fi, projekce, ozvučení a možnost využití privátní lounge s konferenční technikou.'
    ].join('\n\n'),
    capacityStanding: 10,
    capacitySeated: 10,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Parkování',
      'Projekce',
      'Pódium',
      'Profesionální ozvučení',
      'Nabíjecí stanice pro elektromobily'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'pop-airport',
    status: 'published'
  },
  {
    name: 'VIP Lounge POP Airport',
    slug: 'pop-airport-vip-lounge',
    address: 'Tuchoměřice, Praha - západ',
    district: 'Praha - západ',
    description: [
      'Exkluzivní VIP lounge v POP Airport pro konference, workshopy, meetingy nebo módní přehlídky až pro 50 osob.',
      'Prostor lze kombinovat s outletovým nakupováním, návštěvou Dinosaurie, Majalandu nebo Engine Classic Cars Gallery.',
      'K dispozici je klimatizace, Wi-Fi, projekce, ozvučení, parkování s nabíjecími stanicemi a kompletní konferenční technika.'
    ].join('\n\n'),
    capacityStanding: 50,
    capacitySeated: 50,
    venueType: 'conference',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Parkování',
      'Projekce',
      'Profesionální ozvučení',
      'Nabíjecí stanice pro elektromobily'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'pop-airport',
    status: 'published'
  },

  // ============================================
  // PARENT VENUE: Dancing House Hotel
  // ============================================
  {
    name: 'Dancing House Hotel',
    slug: 'dancing-house-hotel',
    address: 'Praha 2',
    district: 'Praha 2',
    description: [
      'Ikonická architektonická stavba Tančícího domu plná umění s luxusní restaurací, terasou a panoramatickým výhledem na Prahu.',
      'Hotel nabízí čtyři oddělené prostory pro akce až do 120 osob včetně restaurace Ginger & Fred, Dancing House Café a dvou konferenčních místností.',
      'Všechny prostory disponují klimatizací, Wi-Fi, zobrazovací technikou, ozvučením a možností zajištění cateringu.'
    ].join('\n\n'),
    capacityStanding: 120,
    capacitySeated: null,
    venueType: 'hotel',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Zobrazovací technika',
      'Profesionální ozvučení',
      'Flipchart',
      'Restaurace',
      'Terasa'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    status: 'published'
  },
  {
    name: 'Restaurace Ginger & Fred',
    slug: 'dancing-house-hotel-restaurace-ginger-fred',
    address: 'Praha 2',
    district: 'Praha 2',
    description: [
      'Prestižní restaurace v Tančícím domě s nádherným výhledem na Pražský hrad a Vltavu, ideální pro firemní večírky nebo svatby.',
      'Kapacita 130 osob vestoje nebo 88 k sezení, k dispozici jsou dvě oddělené části Fred (68 míst) a Ginger (20 míst) plus venkovní terasa.',
      'Prostory lze uspořádat do kinostylu, školní třídy, U nebo I tvaru, zahrnují dataprojektor, Wi-Fi a možnost cateringu od kávy až po grilování.'
    ].join('\n\n'),
    capacityStanding: 130,
    capacitySeated: 88,
    venueType: 'restaurant',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Projekce',
      'Profesionální ozvučení',
      'Výhled na Pražský hrad',
      'Venkovní terasa'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'dancing-house-hotel',
    status: 'published'
  },
  {
    name: 'Dancing House Café',
    slug: 'dancing-house-hotel-dancing-house-cafe',
    address: 'Praha 2',
    district: 'Praha 2',
    description: [
      'Stylová kavárna v srdci Tančícího domu nabízí klimatizovaný konferenční prostor s výhledem na Pražský hrad a Hradčany.',
      'Kapacita 50 osob vestoje nebo 40 k sezení, vybavení zahrnuje Wi-Fi, dataprojektor, LCD TV, flipchart a profesionální ozvučení.',
      'Prostor je vhodný pro business meetingy, semináře, prezentace, tiskové konference nebo oslavy s možností cateringu a front cookingu.'
    ].join('\n\n'),
    capacityStanding: 50,
    capacitySeated: 40,
    venueType: 'restaurant',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'Projekce',
      'LCD televize',
      'Flipchart',
      'Profesionální ozvučení',
      'Výhled na Pražský hrad'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'dancing-house-hotel',
    status: 'published'
  },
  {
    name: 'Zasedací místnost Dancing House',
    slug: 'dancing-house-hotel-zasedaci-mistnost',
    address: 'Praha 2',
    district: 'Praha 2',
    description: [
      'Business Lounge v přízemí Tančícího domu ideální pro menší konference, školení nebo pracovní setkání až pro 22 osob.',
      'Uzavřený salonek nabízí kinostylem 22 míst, u stolů 18 míst, vybavení zahrnuje LCD TV, dataprojektor, flipchart a Wi-Fi.',
      'K dispozici je klimatizace, bezbariérový přístup, profesionální organizační podpora a možnost cateringu od kávy po servírované menu.'
    ].join('\n\n'),
    capacityStanding: null,
    capacitySeated: 22,
    venueType: 'conference',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Bezbariérový přístup',
      'LCD televize',
      'Projekce',
      'Flipchart',
      'Profesionální ozvučení'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'dancing-house-hotel',
    status: 'published'
  },
  {
    name: 'Meeting Room Dancing House',
    slug: 'dancing-house-hotel-meeting-room',
    address: 'Praha 2',
    district: 'Praha 2',
    description: [
      'Elegantní a moderní meeting room v prvním patře Tančícího domu s panoramatickým výhledem na Pražský hrad a Hradčany pro 12 osob.',
      'Prostor nabízí Wi-Fi, LCD televizi, dataprojektor, flipchart a flexibilní uspořádání stolů podle typu akce.',
      'K dispozici je možnost cateringu od kávy a snacků po bufetové či servírované menu s profesionální event podporou.'
    ].join('\n\n'),
    capacityStanding: null,
    capacitySeated: 12,
    venueType: 'conference',
    amenities: [
      'Wi-Fi',
      'LCD televize',
      'Projekce',
      'Flipchart',
      'Výhled na Pražský hrad'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'dancing-house-hotel',
    status: 'published'
  },

  // ============================================
  // PARENT VENUE: Chateau St. Havel
  // ============================================
  {
    name: 'Chateau St. Havel',
    slug: 'chateau-st-havel',
    address: 'Praha 4 - Krč',
    district: 'Praha 4',
    description: [
      'Novogotický pražský zámek uprostřed stylového anglického zámeckého parku s idylickými rybníky, golfovým driving range a wellness centrem.',
      'Čtyřhvězdičkový hotel nabízí osm oddělených prostor včetně zámeckého sálu, venkovního stanu, restaurace, kaple a golfových prostor s kapacitou až 400 osob.',
      'Restauraci vede televizní kuchař Ondřej Slanina, k dispozici je Wi-Fi, parkování, projekce, ozvučení, profesionální golfová akademie a wellness zázemí.'
    ].join('\n\n'),
    capacityStanding: 400,
    capacitySeated: 72,
    venueType: 'hotel',
    amenities: [
      'Wi-Fi',
      'Parkování',
      'Projekce',
      'Profesionální ozvučení',
      'Golf driving range',
      'Wellness centrum',
      'Restaurace',
      'Terasa',
      'Anglický park'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    status: 'published'
  },
  {
    name: 'Zámecký sál',
    slug: 'chateau-st-havel-zamecky-sal',
    address: 'Praha 4 - Krč',
    district: 'Praha 4',
    description: [
      'Reprezentační sál v Chateau St. Havel pro akce až 72 osob s možností flexibilního uspořádání do tvaru U (42 osob), E (66 osob) nebo kombinace hlavního stolu a kulatých stolů.',
      'Prostor lze propojit s kaplí, stanem nebo terasou, k dispozici je Wi-Fi, parkování, projekce, ozvučení a možnost speciální výzdoby.',
      'Nabízíme kompletní catering od bufetu přes banket až po koktejly a front cooking s profesionálním event managementem.'
    ].join('\n\n'),
    capacityStanding: null,
    capacitySeated: 72,
    venueType: 'conference',
    amenities: [
      'Wi-Fi',
      'Parkování',
      'Projekce',
      'Profesionální ozvučení',
      'Catering',
      'Flexibilní uspořádání'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'chateau-st-havel',
    status: 'published'
  },
  {
    name: 'Venkovní stan',
    slug: 'chateau-st-havel-venkovni-stan',
    address: 'Praha 4 - Krč',
    district: 'Praha 4',
    description: [
      'Vytápěný celoroční stan v zámeckém parku pro akce až 400 osob s možností propojení s terasou, parkem, sálem nebo kaplí.',
      'K dispozici je Wi-Fi, parkování, projekce, ozvučení, kompletní technické zázemí a možnost speciální výzdoby.',
      'Nabízíme catering od bufetu přes banket až po koktejly s front cookingem a profesionální event management pro firemní akce, svatby nebo soukromé oslavy.'
    ].join('\n\n'),
    capacityStanding: 400,
    capacitySeated: 400,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Parkování',
      'Projekce',
      'Profesionální ozvučení',
      'Vytápění',
      'Catering'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'chateau-st-havel',
    status: 'published'
  },
  {
    name: 'Restaurace Chateau St. Havel',
    slug: 'chateau-st-havel-restaurace',
    address: 'Praha 4 - Krč',
    district: 'Praha 4',
    description: [
      'Stylová zámecká restaurace pro akce až 40 osob s možností využití vnitřních prostor i venkovní terasy.',
      'K dispozici je technické vybavení dle požadavků, parkování a možnost speciální výzdoby podle charakteru akce.',
      'Nabízíme kompletní catering od banketu přes bufet až po koktejly s front cookingem a profesionální organizaci eventu.'
    ].join('\n\n'),
    capacityStanding: null,
    capacitySeated: 40,
    venueType: 'restaurant',
    amenities: [
      'Parkování',
      'Catering',
      'Venkovní terasa',
      'Front cooking'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'chateau-st-havel',
    status: 'published'
  },
  {
    name: 'Kaple Sv. Havla',
    slug: 'chateau-st-havel-kaple-sv-havla',
    address: 'Praha 4 - Krč',
    district: 'Praha 4',
    description: [
      'Historická kaple o rozloze 78 m² pro akce až 51 osob s možností různých uspořádání od školního sezení přes tvar U až po formální tabuli.',
      'Prostor lze propojit se zámeckým sálem a terasou, k dispozici je Wi-Fi, parkování, projekce a ozvučení.',
      'Nabízíme catering od bufetu přes banket až po koktejly s front cookingem, speciální výzdobu a doprovodný program na míru.'
    ].join('\n\n'),
    capacityStanding: null,
    capacitySeated: 51,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Parkování',
      'Projekce',
      'Profesionální ozvučení',
      'Catering',
      'Historický prostor'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'chateau-st-havel',
    status: 'published'
  },
  {
    name: 'Salonek I. & Salonek II.',
    slug: 'chateau-st-havel-salonek-i-salonek-ii',
    address: 'Praha 4 - Krč',
    district: 'Praha 4',
    description: [
      'Stylové salónky s kapacitou až 20 osob (2x10) pro menší firemní setkání, školení nebo workshopy v historickém prostředí zámku.',
      'K dispozici je Wi-Fi, parkování, technické vybavení, možnost cateringu a speciální výzdoby.',
      'Prostory nabízejí vysokou flexibilitu uspořádání s profesionálním event managementem a doprovodným programem podle charakteru akce.'
    ].join('\n\n'),
    capacityStanding: null,
    capacitySeated: 20,
    venueType: 'conference',
    amenities: [
      'Wi-Fi',
      'Parkování',
      'Catering',
      'Historický prostor'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'chateau-st-havel',
    status: 'published'
  },
  {
    name: 'Zámecký park',
    slug: 'chateau-st-havel-zamecky-park',
    address: 'Praha 4 - Krč',
    district: 'Praha 4',
    description: [
      'Stylový anglický zámecký park s idylickými rybníky pro venkovní akce až 400 osob s možností propojení s kaplí, stanem, sálem nebo terasou.',
      'K dispozici je Wi-Fi, parkování a kompletní technické vybavení dle požadavků klienta.',
      'Nabízíme catering od bufetu přes banket a koktejly až po servírované menu s front cookingem, speciální výzdobu a doprovodný program.'
    ].join('\n\n'),
    capacityStanding: 400,
    capacitySeated: 400,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Parkování',
      'Anglický park',
      'Rybníky',
      'Catering'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'chateau-st-havel',
    status: 'published'
  },
  {
    name: 'Golf Chateau St. Havel',
    slug: 'chateau-st-havel-golf',
    address: 'Praha 4 - Krč',
    district: 'Praha 4',
    description: [
      'Golfový driving range AQUA s 17 odpališti (6 krytých), putting green o rozloze 700 m² a chipping green s pískovým bunkerem pro akce až 200 osob.',
      'Ideální prostor pro teambuildingy, golfové turnaje nebo firemní akce s možností využití profesionálních golfových trenérů.',
      'K dispozici je parkování a možnost kombinace s dalšími prostory zámku včetně restaurace nebo venkovního stanu.'
    ].join('\n\n'),
    capacityStanding: 200,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Parkování',
      'Golf driving range',
      'Putting green',
      'Chipping green',
      'Profesionální trenéři'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'chateau-st-havel',
    status: 'published'
  },
  {
    name: 'Wellness Chateau St. Havel',
    slug: 'chateau-st-havel-wellness',
    address: 'Praha 4 - Krč',
    district: 'Praha 4',
    description: [
      'Privátní wellness zóna v Chateau St. Havel s privátní saunou, vířivkou, ochlazovacím bazénem a relaxační zónou pro maximálně 10 osob.',
      'K dispozici jsou masážní služby, aromaterapie a relaxační hudba v klidném prostředí historického zámku.',
      'Ideální volba pro menší relaxační programy, teambuildingy nebo jako doplněk konferenčních pobytů.'
    ].join('\n\n'),
    capacityStanding: null,
    capacitySeated: 10,
    venueType: 'other',
    amenities: [
      'Sauna',
      'Vířivka',
      'Ochlazovací bazén',
      'Masáže',
      'Aromaterapie'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    musicAfter10: null,
    parentSlug: 'chateau-st-havel',
    status: 'published'
  }
]

async function main() {
  const manager = await prisma.user.findUnique({
    where: { email: 'newvenues@prostormat.cz' }
  })

  if (!manager) {
    throw new Error('Venue manager newvenues@prostormat.cz not found in database')
  }

  for (const entry of venues) {
    const existing = await prisma.venue.findUnique({
      where: { slug: entry.slug }
    })

    const baseData = {
      name: entry.name,
      description: entry.description,
      address: entry.address,
      district: entry.district,
      capacityStanding: entry.capacityStanding,
      capacitySeated: entry.capacitySeated,
      venueType: entry.venueType,
      amenities: entry.amenities,
      contactEmail: entry.contactEmail,
      contactPhone: entry.contactPhone,
      websiteUrl: entry.websiteUrl,
      instagramUrl: entry.instagramUrl,
      musicAfter10: entry.musicAfter10 ?? null,
      status: entry.status ?? 'published',
      isRecommended: false
    }

    let parentId: string | null = null
    if (entry.parentSlug) {
      const parentVenue = await prisma.venue.findUnique({ where: { slug: entry.parentSlug } })
      if (!parentVenue) {
        console.log(`⚠️  Parent venue with slug "${entry.parentSlug}" not found for ${entry.name}, creating without parent`)
      } else {
        parentId = parentVenue.id
      }
    }

    await prisma.venue.upsert({
      where: { slug: entry.slug },
      update: {
        ...baseData,
        images: existing?.images ?? [],
        parentId,
      },
      create: {
        ...baseData,
        slug: entry.slug,
        managerId: manager.id,
        images: [],
        parentId,
      }
    })

    console.log(`${existing ? '✅ Updated' : '✨ Created'} venue: ${entry.name}`)
  }

  console.log(`\n🎉 Successfully processed ${venues.length} venues!`)
}

main()
  .catch((error) => {
    console.error('❌ Failed to add venues:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
