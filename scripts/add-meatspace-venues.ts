#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const remoteDatabaseUrl =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL

if (!process.env.DATABASE_URL || /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)) {
  if (!remoteDatabaseUrl) {
    throw new Error('No remote database connection string found in environment variables.')
  }

  process.env.DATABASE_URL = remoteDatabaseUrl
}

import { PrismaClient } from '@prisma/client'

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
  {
    name: 'THE POP UP!',
    slug: 'the-pop-up',
    address: 'Dvorecké náměstí 406/5, Praha 4 - Podolí',
    district: 'Praha 4',
    description: [
      'Interaktivní galerie THE POP UP! přenáší hosty do série hravých instalací, které rozproudí týmovou energii a prolomí ledy během pár minut.',
      'Sedm navazujících místností na ploše okolo 200 m² kombinuje audiovizuální scény, úkoly na sebepoznání a prostor pro vlastní program.',
      'Součástí je hlavní sál s barem, zázemí pro catering, recepce i šatna a samozřejmostí je ozvučení, projekce a rychlé Wi-Fi připojení.'
    ].join('\n\n'),
    capacityStanding: 65,
    capacitySeated: null,
    venueType: 'gallery',
    amenities: [
      'Wi-Fi',
      'Zobrazovací technika',
      'Profesionální ozvučení',
      'Bar a cateringové zázemí',
      'Šatna',
      'Interaktivní instalace'
    ],
    contactEmail: 'info@thepopup.cz',
    contactPhone: '+420 777 840 723',
    websiteUrl: 'https://www.thepopup.cz',
    instagramUrl: 'https://www.instagram.com/thepopup.cz/',
    musicAfter10: null
  },
  {
    name: 'Restaurace & areál Gutovka',
    slug: 'restaurace-gutovka',
    address: 'Gutova 39, 100 00 Praha 10 - Strašnice',
    district: 'Praha 10',
    description: [
      'Restaurace & areál Gutovka spojuje moderní rodinnou restauraci s venkovními terasami uprostřed známého sportoviště ve Strašnicích.',
      'Uvnitř najdete prostornou jídelnu, galerii i vyhlídkovou věž, venku pak krytou zahrádku, gril zónu a oddělené bary, které zvládnou pohodlně obsloužit několik set hostů najednou.',
      'Tým zajišťuje kompletní catering, dorty i animační programy a v okolí lze využít hřiště, lezeckou stěnu nebo minigolf pro teambuilding.'
    ].join('\n\n'),
    capacityStanding: 400,
    capacitySeated: 80,
    venueType: 'restaurant',
    amenities: [
      'Zobrazovací technika',
      'Profesionální ozvučení',
      'Venkovní terasa',
      'Catering na míru',
      'Dětské a sportovní zóny'
    ],
    contactEmail: 'info@restauracegutovka.cz',
    contactPhone: '+420 228 229 362',
    websiteUrl: 'https://www.restauracegutovka.cz',
    instagramUrl: 'https://www.instagram.com/restaurace_gutovka/',
    musicAfter10: null
  },
  {
    name: 'Pilsner Urquell: The Original Beer Experience',
    slug: 'pilsner-urquell-the-original-beer-experience',
    address: '28. října 377/13, 110 00 Praha 1 - Nové Město',
    district: 'Praha 1',
    description: [
      'Pilsner Urquell: The Original Beer Experience zabírá historický palác na Václavském náměstí a nabízí reprezentativní prostory provoněné plzeňským ležákem.',
      'Eventové patro propojuje několik samostatných barů a sálů – od komorního Hladinka baru přes secesní Brewers’ Bar a Pilsner Hall až po dvoupodlažní Beer Hall s velkým pódiem.',
      'Hosté mají k dispozici prémiový catering, školu čepování s pivními sommeliéry, moderní AV techniku i možnost doplnit akci o prohlídku multimediální expozice.'
    ].join('\n\n'),
    capacityStanding: 350,
    capacitySeated: 100,
    venueType: 'conference',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Profesionální ozvučení',
      'LED obrazovky',
      'Více barů v rámci prostoru',
      'Možnost školy čepování'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: 'https://www.originalbeerexperience.com/private-events',
    instagramUrl: 'https://www.instagram.com/PilsnerUrquell.Experience',
    musicAfter10: null
  },
  {
    name: 'Bar & Klub Zlatý Strom',
    slug: 'bar-klub-zlaty-strom',
    address: 'Karlova 6, 110 00 Praha 1 - Staré Město',
    district: 'Praha 1',
    description: [
      'Legendární Bar & Klub Zlatý Strom prošel kompletní proměnou a dnes funguje jako zážitkový noční bar pár kroků od Karlova mostu.',
      'Rozsáhlý sklepní labyrint s privátními salonky, dominantním barem a tanečním parketem zvládne firemní party i launch event až pro 350 hostů.',
      'Součástí je špičkový zvuk, světla, DJ pult i stage a tým zajistí rauty, signature koktejly i prémiová vína ze sesterské restaurace.'
    ].join('\n\n'),
    capacityStanding: 350,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Profesionální ozvučení',
      'LED obrazovky',
      'DJ stage',
      'Rautové menu'
    ],
    contactEmail: 'bar@zlatystrom.com',
    contactPhone: '+420 604 349 747',
    websiteUrl: 'https://www.zlatystrom.com',
    instagramUrl: 'https://www.instagram.com/zlatystromprague',
    musicAfter10: true
  },
  {
    name: 'Hotel SEN',
    slug: 'hotel-sen',
    address: 'Malostranská 344, 251 66 Senohraby',
    district: 'Středočeský kraj',
    description: [
      'Hotel SEN leží jen kousek od Prahy a obklopuje ho ladovská krajina, díky které hosté snadno vypnou od ruchu města.',
      'Modulární kongresové centrum zvládne menší porady i velké galavečery až pro dvě stě účastníků a nabízí několik sálů, které lze podle potřeby propojit.',
      'Součástí resortu je 71 pokojů, vlastní restaurace, wellness, bowling i venkovní aktivity, takže lze připravit kompletní program na míru včetně teambuildingů a doprovodu pro partnery.'
    ].join('\n\n'),
    capacityStanding: 200,
    capacitySeated: 164,
    venueType: 'hotel',
    amenities: [
      'Klimatizace',
      'Bezbariérový přístup',
      'Wi-Fi',
      'Parkování',
      'Projekce',
      'Pódium',
      'Profesionální ozvučení',
      'Flipchart'
    ],
    contactEmail: 'recepce@hotelsen.cz',
    contactPhone: '+420 323 616 800',
    websiteUrl: 'https://www.hotelsen.cz',
    instagramUrl: 'https://www.instagram.com/explore/locations/357538798/ea-hotelovy-resort-sen/'
  },
  {
    name: 'Kafkoff',
    slug: 'kafkoff',
    address: 'Náměstí Franze Kafky 24/3, 110 00 Praha 1',
    district: 'Praha 1 - Staré Město',
    description: [
      'Kafkoff je multižánrový bar a galerie v rodném domě Franze Kafky, kde se industriální estetika snoubí s atmosférou starého města.',
      'Variabilní patro nabízí tři zóny – energický bar, komorní čítárnu i galerijní sál – takže lze propojovat networking, přednášky i party na jednom místě.',
      'Produkční tým se postará o servis od signature drinku přes flying buffet až po DJ, fotokoutek a vizuály v barvách značky.'
    ].join('\n\n'),
    capacityStanding: 250,
    capacitySeated: 150,
    venueType: 'other',
    amenities: [
      'Výběrová káva',
      'Wi-Fi',
      'Klimatizace',
      'Profesionální ozvučení',
      'LED projekce',
      'DJ booth'
    ],
    contactEmail: 'reservation@kafkoff.cz',
    contactPhone: '+420 777 868 397',
    websiteUrl: 'https://kafkoff.cz',
    instagramUrl: 'https://www.instagram.com/kafkoff_prague/'
  },
  {
    name: 'Space Café & Hub Karlín',
    slug: 'space-cafe-hub-karlin',
    address: 'Thámova 136/8, 186 00 Praha 8',
    district: 'Praha 8 - Karlín',
    description: [
      'Space Café & Hub Karlín kombinuje kavárnu s kreativním hubem a díky světlému interiéru je ideálním místem pro komunitní setkání i firemní workshop.',
      'Návštěvníci mají k dispozici sdílenou kavárnu, několik samostatných zasedaček a podcastové studio, přičemž veškerá technika a obsluha je připravena na hybridní schůzky.',
      'Rezervace probíhají flexibilně po hodinách a součástí je catering z místní kuchyně i možnost doplnit akci o baristu nebo moderátora.'
    ].join('\n\n'),
    capacityStanding: 25,
    capacitySeated: 25,
    venueType: 'conference',
    amenities: [
      'Klimatizace',
      'Bezbariérový přístup',
      'Wi-Fi',
      'Prezentacní technika',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@spacehub.cz',
    contactPhone: null,
    websiteUrl: 'https://spacehub.cz',
    instagramUrl: null
  },
  {
    name: 'Berlin Meeting Room',
    slug: 'space-cafe-hub-karlin-berlin',
    address: 'Thámova 136/8, 186 00 Praha 8',
    district: 'Praha 8 - Karlín',
    description: [
      'Berlin Meeting Room je nejintimnější ze zasedaček Space Hubu a díky skleněné stěně s výhledem do kavárny působí otevřeně a svěže.',
      'Čtyři pracovní místa doplňuje velkoformátová obrazovka, whiteboard a rychlé připojení pro videohovory.',
      'Z místní kavárny lze objednat občerstvení i baristu, takže ranní porady proběhnou v klidu a s výběrovou kávou.'
    ].join('\n\n'),
    capacityStanding: 4,
    capacitySeated: 4,
    venueType: 'conference',
    amenities: [
      'Wi-Fi',
      'LED displej',
      'Whiteboard',
      'Klimatizace'
    ],
    contactEmail: 'info@spacehub.cz',
    contactPhone: null,
    websiteUrl: 'https://spacehub.cz',
    instagramUrl: null,
    parentSlug: 'space-cafe-hub-karlin',
    status: 'hidden'
  },
  {
    name: 'Milano Meeting Room',
    slug: 'space-cafe-hub-karlin-milano',
    address: 'Thámova 136/8, 186 00 Praha 8',
    district: 'Praha 8 - Karlín',
    description: [
      'Milano Meeting Room navazuje na hlavní kavárnu a díky elegantnímu kulatému stolu funguje skvěle pro brainstorming i klientské schůzky.',
      'Prostor disponuje konferenční kamerou, 75" obrazovkou a akustickými panel, takže zvládá i celodenní hybridní workshopy.',
      'Součástí je concierge servis Space Hubu včetně cateringu, tiskových služeb i možnosti rezervovat navazující coworking.'
    ].join('\n\n'),
    capacityStanding: 8,
    capacitySeated: 8,
    venueType: 'conference',
    amenities: [
      'Wi-Fi',
      'Prezentacní technika',
      'Videokonference',
      'Klimatizace'
    ],
    contactEmail: 'info@spacehub.cz',
    contactPhone: null,
    websiteUrl: 'https://spacehub.cz',
    instagramUrl: null,
    parentSlug: 'space-cafe-hub-karlin',
    status: 'hidden'
  },
  {
    name: 'Paris Meeting Room',
    slug: 'space-cafe-hub-karlin-paris',
    address: 'Thámova 136/8, 186 00 Praha 8',
    district: 'Praha 8 - Karlín',
    description: [
      'Paris Meeting Room nabízí útulné prostředí pro týmová setkání do sedmi lidí a díky francouzskému ladění působí velmi reprezentativně.',
      'Součástí je chytrý televizor, ozvučení a sdílený display, takže prezentace i online hovory poběží bez kompromisů.',
      'Hosté mohou využít bar s výběrovou kávou přímo za rohem a zasedačku rozšířit o hlavní sál Space Hubu.'
    ].join('\n\n'),
    capacityStanding: 7,
    capacitySeated: 7,
    venueType: 'conference',
    amenities: [
      'Wi-Fi',
      'LED displej',
      'Ozvučení',
      'Klimatizace'
    ],
    contactEmail: 'info@spacehub.cz',
    contactPhone: null,
    websiteUrl: 'https://spacehub.cz',
    instagramUrl: null,
    parentSlug: 'space-cafe-hub-karlin',
    status: 'hidden'
  },
  {
    name: 'Prague Podcast Studio',
    slug: 'space-cafe-hub-karlin-podcast',
    address: 'Thámova 136/8, 186 00 Praha 8',
    district: 'Praha 8 - Karlín',
    description: [
      'Prague Podcast Studio ve Space Hubu je plně odhlučněná místnost připravená na nahrávání pořadů, webinářů a livestreamů.',
      'K dispozici jsou čtyři mikrofony Shure, mixpult, DSLR kamera a režijní software, který zvládne i vícekanálový záznam.',
      'Produkční tým na místě zajistí střih, grafiku i distribuci a během nahrávání můžete využít bar i relaxační zónu hubu.'
    ].join('\n\n'),
    capacityStanding: 4,
    capacitySeated: 4,
    venueType: 'studio',
    amenities: [
      'Wi-Fi',
      'Podcastová technika',
      'Odhlučnění',
      'Klimatizace'
    ],
    contactEmail: 'info@spacehub.cz',
    contactPhone: null,
    websiteUrl: 'https://spacehub.cz',
    instagramUrl: null,
    parentSlug: 'space-cafe-hub-karlin',
    status: 'hidden'
  },
  {
    name: 'Salabka – restaurace & vinařství',
    slug: 'salabka-restaurace-vinarstvi',
    address: 'K Bohnicím 2a, 171 00 Praha 7 - Troja',
    district: 'Praha 7 - Troja',
    description: [
      'Salabka kombinuje michelinskou gastronomii, urbanistickou vinici a výhled na Troju, takže se hodí pro reprezentativní recepce i privátní svatby.',
      'K dispozici je elegantní restaurace, degustační sklep a terasy u vinic, které pojmou až 250 hostů s možností kombinace se zahradou.',
      'Tým nabízí párování s víny Salabka, show-cooking i zážitkové prohlídky vinařství, takže lze připravit kompletní eventový program.'
    ].join('\n\n'),
    capacityStanding: 250,
    capacitySeated: 150,
    venueType: 'restaurant',
    amenities: [
      'Wi-Fi',
      'Parkování',
      'Klimatizace',
      'Projekce',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@salabka.cz',
    contactPhone: '+420 266 311 113',
    websiteUrl: 'https://www.salabka.cz',
    instagramUrl: 'https://www.instagram.com/salabka/'
  },
  {
    name: 'Bar Monk Prague',
    slug: 'bar-monk-prague',
    address: 'Maltézské náměstí 292/10, 118 00 Praha 1',
    district: 'Praha 1 - Malá Strana',
    description: [
      'Bar Monk kombinuje prvorepublikový šarm s moderní mixologií a sídlí v historickém domě u Kampy.',
      'Díky několika zákoutím a soukromé galerii zvládne hostit degustace, tiskovky i večerní koktejlové party.',
      'Barový tým připraví signature drinky, food pairing i živou muziku, takže se event snadno promění ve stylovou noc.'
    ].join('\n\n'),
    capacityStanding: 50,
    capacitySeated: 32,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Profesionální ozvučení',
      'Koktejlový bar'
    ],
    contactEmail: 'rezervace@barmonk.cz',
    contactPhone: '+420 602 345 678',
    websiteUrl: 'https://www.barmonk.cz',
    instagramUrl: 'https://www.instagram.com/barmonkprague/'
  },
  {
    name: 'Dinosauria Museum Prague',
    slug: 'dinosauria',
    address: 'Ke Kopanině 421, 252 67 Tuchoměřice',
    district: 'Praha - západ',
    description: [
      'Dinosauria Museum Prague je futuristické muzeum v areálu POP Airport, kde originální kostry dinosaurů doplňuje virtuální realita a světelné instalace.',
      'Hlavní hala zvládne firemní eventy, gala večeře i rodinné programy a díky flexibilní technice se snadno promění na módní přehlídku či konferenci.',
      'K dispozici je zkušený eventový tým, catering, AV servis i možnost spojit program s návštěvou outletu nebo leteckého muzea.'
    ].join('\n\n'),
    capacityStanding: 500,
    capacitySeated: 250,
    venueType: 'other',
    amenities: [
      'Klimatizace',
      'Bezbariérový přístup',
      'Wi-Fi',
      'Parkování',
      'Projekce',
      'Pódium',
      'Profesionální ozvučení',
      'Nabíjecí stanice EV'
    ],
    contactEmail: 'event@pop-group.cz',
    contactPhone: '+420 702 222 433',
    websiteUrl: 'https://www.dinosauria.cz',
    instagramUrl: 'https://www.instagram.com/dinosauria_museum_prague/'
  },
  {
    name: 'Firemní akce v Dinosauria',
    slug: 'dinosauria-firemni-akce',
    address: 'Ke Kopanině 421, 252 67 Tuchoměřice',
    district: 'Praha - západ',
    description: [
      'Firemní akce v Dinosauria využívají centrální expozici plnou kosterních exponátů a mappingu, což vytváří nezapomenutelnou kulisu pro networking i produktové launchy.',
      'Prostor se upraví na stojací recepci, banket s kulatými stoly nebo divadelní sezení a díky modulární technice lze realizovat i konferenci.',
      'Součástí balíčku je scénář na míru, zážitkové programy s průvodci a VIP vstup do VR zóny.'
    ].join('\n\n'),
    capacityStanding: 50,
    capacitySeated: 40,
    venueType: 'other',
    amenities: [
      'Klimatizace',
      'Wi-Fi',
      'Projekce',
      'Profesionální ozvučení',
      'Parkování'
    ],
    contactEmail: 'event@pop-group.cz',
    contactPhone: '+420 702 222 433',
    websiteUrl: 'https://www.dinosauria.cz',
    instagramUrl: 'https://www.instagram.com/dinosauria_museum_prague/',
    parentSlug: 'dinosauria',
    status: 'hidden'
  },
  {
    name: 'Teambuilding ve virtuální realitě',
    slug: 'dinosauria-teambuilding-vr',
    address: 'Ke Kopanině 421, 252 67 Tuchoměřice',
    district: 'Praha - západ',
    description: [
      'Teambuilding ve VR propojuje expozici Dinosauria s arénou virtuální reality, kde týmy řeší úkoly v prehistorickém světě.',
      'Moderovaný program je plně škálovatelný a lze ho doplnit o soutěžní leaderboard nebo branding klienta.',
      'Součástí balíčku je občerstvení, odborný průvodce a fotodokumentace z akce.'
    ].join('\n\n'),
    capacityStanding: 50,
    capacitySeated: 30,
    venueType: 'other',
    amenities: [
      'Virtuální realita',
      'Wi-Fi',
      'Klimatizace',
      'Ozvučení'
    ],
    contactEmail: 'event@pop-group.cz',
    contactPhone: '+420 702 222 433',
    websiteUrl: 'https://www.dinosauria.cz',
    instagramUrl: 'https://www.instagram.com/dinosauria_museum_prague/',
    parentSlug: 'dinosauria',
    status: 'hidden'
  },
  {
    name: 'Dinosauria Private Tour',
    slug: 'dinosauria-private-tour',
    address: 'Ke Kopanině 421, 252 67 Tuchoměřice',
    district: 'Praha - západ',
    description: [
      'Private Tour je komentovaná prohlídka expozice po zavírací době, ideální pro VIP klienty nebo média.',
      'Kurátor návštěvníky provede příběhy jednotlivých exponátů a doplní program o speciální světelnou show.',
      'Balíček zahrnuje welcome drink, možnost řízené degustace a dárkový merchandising.'
    ].join('\n\n'),
    capacityStanding: 50,
    capacitySeated: 0,
    venueType: 'other',
    amenities: [
      'Kurátor',
      'Wi-Fi',
      'Klimatizace'
    ],
    contactEmail: 'event@pop-group.cz',
    contactPhone: '+420 702 222 433',
    websiteUrl: 'https://www.dinosauria.cz',
    instagramUrl: 'https://www.instagram.com/dinosauria_museum_prague/',
    parentSlug: 'dinosauria',
    status: 'hidden'
  },
  {
    name: 'Narozeninová oslava s dinosaury',
    slug: 'dinosauria-birthday',
    address: 'Ke Kopanině 421, 252 67 Tuchoměřice',
    district: 'Praha - západ',
    description: [
      'Dětské narozeniny v Dinosauria zahrnují animátory v kostýmech, tvořivé dílny i průzkumnou hru napříč expozicí.',
      'Součástí je tematicky zdobená party zóna, zdravější catering a personalizovaný dort.',
      'Program lze doplnit o virtuální realitu, maskota dinosaura nebo noční přespání pod fosiliemi.'
    ].join('\n\n'),
    capacityStanding: 50,
    capacitySeated: 30,
    venueType: 'other',
    amenities: [
      'Dětský program',
      'Wi-Fi',
      'Klimatizace',
      'Parkování'
    ],
    contactEmail: 'event@pop-group.cz',
    contactPhone: '+420 702 222 433',
    websiteUrl: 'https://www.dinosauria.cz',
    instagramUrl: 'https://www.instagram.com/dinosauria_museum_prague/',
    parentSlug: 'dinosauria',
    status: 'hidden'
  },
  {
    name: 'Vzdělávací program pro školy',
    slug: 'dinosauria-vzdelavaci-program',
    address: 'Ke Kopanině 421, 252 67 Tuchoměřice',
    district: 'Praha - západ',
    description: [
      'Školní program Dinosauria připravuje žáky na cestu do pravěku prostřednictvím interaktivní výuky vedené paleontologem.',
      'Součástí je pracovní sešit, laboratoř s replikami fosilií a možnost navázat workshopem ve virtuální realitě.',
      'Pedagogové dostanou metodické materiály a děti unikátní zážitky, které lze využít ve výuce přírodovědy.'
    ].join('\n\n'),
    capacityStanding: 50,
    capacitySeated: 40,
    venueType: 'other',
    amenities: [
      'Odborný lektor',
      'Wi-Fi',
      'Klimatizace',
      'Parkování'
    ],
    contactEmail: 'event@pop-group.cz',
    contactPhone: '+420 702 222 433',
    websiteUrl: 'https://www.dinosauria.cz',
    instagramUrl: 'https://www.instagram.com/dinosauria_museum_prague/',
    parentSlug: 'dinosauria',
    status: 'hidden'
  },
  {
    name: 'Noc v muzeu',
    slug: 'dinosauria-noc-v-muzeu',
    address: 'Ke Kopanině 421, 252 67 Tuchoměřice',
    district: 'Praha - západ',
    description: [
      'Noc v muzeu umožní skupinám přespání pod kostrami dinosaurů včetně noční hry s baterkami.',
      'Program zahrnuje filmovou projekci, workshopy a snídani v expozici.',
      'Skvěle funguje jako motivační akce pro dětské kolektivy nebo netradiční teambuilding.'
    ].join('\n\n'),
    capacityStanding: 50,
    capacitySeated: 30,
    venueType: 'other',
    amenities: [
      'Noční program',
      'Wi-Fi',
      'Klimatizace',
      'Parkování'
    ],
    contactEmail: 'event@pop-group.cz',
    contactPhone: '+420 702 222 433',
    websiteUrl: 'https://www.dinosauria.cz',
    instagramUrl: 'https://www.instagram.com/dinosauria_museum_prague/',
    parentSlug: 'dinosauria',
    status: 'hidden'
  },
  {
    name: 'Event na klíč',
    slug: 'dinosauria-event-na-klic',
    address: 'Ke Kopanině 421, 252 67 Tuchoměřice',
    district: 'Praha - západ',
    description: [
      'Event na klíč v Dinosauria představuje plně customizovanou produkci včetně scénografie, světelných show a doprovodného programu.',
      'Tým POP Group zajistí dramaturgii, hostesky, AV techniku i koordinaci celého večera.',
      'Prostor lze brandovat, doplnit o VR zónu nebo propojit s outletovým centrem pro další zážitky.'
    ].join('\n\n'),
    capacityStanding: 50,
    capacitySeated: 40,
    venueType: 'other',
    amenities: [
      'Event management',
      'Wi-Fi',
      'Klimatizace',
      'Profesionální ozvučení'
    ],
    contactEmail: 'event@pop-group.cz',
    contactPhone: '+420 702 222 433',
    websiteUrl: 'https://www.dinosauria.cz',
    instagramUrl: 'https://www.instagram.com/dinosauria_museum_prague/',
    parentSlug: 'dinosauria',
    status: 'hidden'
  },
  {
    name: 'Poznávání s paleontologem',
    slug: 'dinosauria-poznavani-s-paleontologem',
    address: 'Ke Kopanině 421, 252 67 Tuchoměřice',
    district: 'Praha - západ',
    description: [
      'Program s paleontologem nabízí detailní výklad o fosiliích doplněný o interaktivní ukázky a práci s mikroskopem.',
      'Hodí se pro odborné skupiny, školy i firmy, které chtějí obsahově bohatý doprovodný program.',
      'Součástí je možnost zapůjčit mobilní laboratoř a připravit tematické dárkové balíčky.'
    ].join('\n\n'),
    capacityStanding: 50,
    capacitySeated: 30,
    venueType: 'other',
    amenities: [
      'Odborný lektor',
      'Wi-Fi',
      'Klimatizace',
      'Parkování'
    ],
    contactEmail: 'event@pop-group.cz',
    contactPhone: '+420 702 222 433',
    websiteUrl: 'https://www.dinosauria.cz',
    instagramUrl: 'https://www.instagram.com/dinosauria_museum_prague/',
    parentSlug: 'dinosauria',
    status: 'hidden'
  },
  {
    name: 'Boutique Hotel Jalta',
    slug: 'boutique-hotel-jalta',
    address: 'Václavské náměstí 45, 110 00 Praha 1',
    district: 'Praha 1 - Nové Město',
    description: [
      'Boutique Hotel Jalta nabízí ikonický výhled na Václavské náměstí, originální design a privátní bunkr z dob studené války.',
      'Salonek Jalta Lounge a restaurace Soul Love zvládnou konference, tiskovky i fashion eventy až pro 150 hostů.',
      'Hotel zajišťuje ubytování, fine dining i concierge služby, takže celý program probíhá pod jednou střechou.'
    ].join('\n\n'),
    capacityStanding: 150,
    capacitySeated: 100,
    venueType: 'hotel',
    amenities: [
      'Klimatizace',
      'Wi-Fi',
      'Projekce',
      'Pódium',
      'Profesionální ozvučení',
      'Flipchart'
    ],
    contactEmail: 'concierge@hoteljalta.com',
    contactPhone: '+420 222 822 111',
    websiteUrl: 'https://www.hoteljalta.com',
    instagramUrl: 'https://www.instagram.com/hoteljalta/'
  },
  {
    name: 'Prime House Karlín',
    slug: 'prime-house-karlin',
    address: 'Křižíkova 30, 186 00 Praha 8',
    district: 'Praha 8 - Karlín',
    description: [
      'Prime House Karlín je designový dům z 19. století proměněný v multifunkční loft se skleněnou střechou a vnitřní zahradou.',
      'Flexibilní prostor zvládne pop-up showroom, fotoprodukci i večerní party a díky vysokému stropu se hodí pro instalace a stage design.',
      'Součástí je zázemí pro catering, backstage místnosti a technika pro projekce i ozvučení.'
    ].join('\n\n'),
    capacityStanding: 40,
    capacitySeated: 24,
    venueType: 'loft',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Profesionální ozvučení',
      'Prezentacní technika'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null
  },
  {
    name: 'Party boxy v O2 areně – HC Sparta Praha',
    slug: 'party-boxy-o2-arena',
    address: 'Českomoravská 2345/17a, 190 00 Praha 9',
    district: 'Praha 9 - Libeň',
    description: [
      'Party boxy v O2 areně přinášejí plně servisovaná apartmá pro 12 až 72 hostů s výhledem přímo na led či podium.',
      'Součástí je privátní vstup, hostesky, prémiový catering a možnost brandingu interiéru.',
      'Space je vhodný pro klientské akce během zápasů HC Sparta, koncertů i uzavřených prezentací mimo program.'
    ].join('\n\n'),
    capacityStanding: 72,
    capacitySeated: 48,
    venueType: 'other',
    amenities: [
      'Catering',
      'Wi-Fi',
      'Profesionální obsluha',
      'Privátní vstup'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: 'https://www.hcsparta.cz',
    instagramUrl: 'https://www.instagram.com/hc_sparta/'
  },
  {
    name: 'Kulinární studio MAFRA',
    slug: 'kulinarni-studio-mafra',
    address: 'Karla Engliše 519/11, 150 00 Praha 5',
    district: 'Praha 5 - Smíchov',
    description: [
      'Kulinární studio MAFRA je plně vybavené kuchařské zázemí pro teambuildingy, natáčení i produktové prezentace.',
      'Hosté mají k dispozici špičkové spotřebiče, tři varné stanice a kamerové pozice pro livestream nebo TV produkci.',
      'Součástí je tým šéfkuchařů, stylová degustace a chill-out zóna s výhledem na Anděl.'
    ].join('\n\n'),
    capacityStanding: 50,
    capacitySeated: 32,
    venueType: 'studio',
    amenities: [
      'Plně vybavená kuchyně',
      'Wi-Fi',
      'Projekce',
      'Profesionální ozvučení'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null
  },
  {
    name: 'OAKS Prague',
    slug: 'oaks-prague',
    address: 'Nebřenice 30, 251 01 Popovičky',
    district: 'Praha - východ',
    description: [
      'OAKS Prague je privátní resort s golfem, klubovnou a designovou architekturou v krajině nedaleko Prahy.',
      'Hlavní klubovna, restaurace a terasy zvládnou konference, svatby i rodinné oslavy až pro sto hostů.',
      'Návštěvníci mohou propojit program s golfem, wellness a ubytováním v residencích.'
    ].join('\n\n'),
    capacityStanding: 100,
    capacitySeated: 80,
    venueType: 'other',
    amenities: [
      'Klimatizace',
      'Bezbariérový přístup',
      'Wi-Fi',
      'Parkování',
      'Nabíjecí stanice EV'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: 'https://oaksprague.cz',
    instagramUrl: 'https://www.instagram.com/oaksprague/'
  },
  {
    name: 'Golfové hřiště OAKS Prague',
    slug: 'oaks-prague-golfove-hriste',
    address: 'Nebřenice 30, 251 01 Popovičky',
    district: 'Praha - východ',
    description: [
      'Arnold Palmer Championship Course nabízí osmnáct jamek s dechberoucími výhledy a je perfektním zázemím pro golfové turnaje nebo klientské dny.',
      'Přilehlé zázemí zahrnuje driving range, putting green a profesionální caddie servis.',
      'Součástí může být golfová akademie, soutěže nebo partnerství s klubovnou.'
    ].join('\n\n'),
    capacityStanding: 100,
    capacitySeated: 60,
    venueType: 'other',
    amenities: [
      'Golfové zázemí',
      'Wi-Fi',
      'Parkování',
      'Klimatizace'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: 'https://oaksprague.cz',
    instagramUrl: 'https://www.instagram.com/oaksprague/',
    parentSlug: 'oaks-prague',
    status: 'hidden'
  },
  {
    name: 'Golfová klubovna OAKS Prague',
    slug: 'oaks-prague-golfova-klubovna',
    address: 'Nebřenice 30, 251 01 Popovičky',
    district: 'Praha - východ',
    description: [
      'Designová klubovna s panoramatickými okny funguje jako elegantní lounge pro menší eventy a obchodní schůzky.',
      'Interiér navazuje na architekturu Ema Peterse a je vybavený top cateringem i vinotékou.',
      'Terasa s výhledem na fairwaye je ideální pro aperitiv nebo after party.'
    ].join('\n\n'),
    capacityStanding: 40,
    capacitySeated: 30,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Klimatizace',
      'Profesionální ozvučení',
      'Parkování'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: 'https://oaksprague.cz',
    instagramUrl: 'https://www.instagram.com/oaksprague/',
    parentSlug: 'oaks-prague',
    status: 'hidden'
  },
  {
    name: 'La Bottega Oaks Deli Bistro',
    slug: 'oaks-prague-la-bottega',
    address: 'Nebřenice 30, 251 01 Popovičky',
    district: 'Praha - východ',
    description: [
      'La Bottega Oaks Deli Bistro servíruje italskou kuchyni Riccarda Lucqueho v moderním interiéru s výhledem na golfové hřiště.',
      'Prostor funguje jako rodinné bistro i privátní dining room s možností řízených degustací.',
      'K dispozici je terasa, someliér a možnost propojit akci s golfovou klinikou.'
    ].join('\n\n'),
    capacityStanding: 80,
    capacitySeated: 50,
    venueType: 'restaurant',
    amenities: [
      'Bezbariérový přístup',
      'Wi-Fi',
      'Klimatizace',
      'Parkování'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: 'https://oaksprague.cz',
    instagramUrl: 'https://www.instagram.com/oaksprague/',
    parentSlug: 'oaks-prague',
    status: 'hidden'
  },
  {
    name: 'Prague City Golf Rohan',
    slug: 'prague-city-golf-rohan',
    address: 'U Libeňského mostu 1, 180 00 Praha 8',
    district: 'Praha 8 - Libeň',
    description: [
      'Prague City Golf Rohan je tréninkový areál na Rohanském ostrově, který nabízí driving range, putting green i klubové zázemí.',
      'Místo je ideální pro menší firemní akce, rodinné oslavy nebo golfové lekce s trenérem.',
      'K dispozici je parkování, vybavení k zapůjčení a možnost propojit program s dalšími resorty skupiny.'
    ].join('\n\n'),
    capacityStanding: 50,
    capacitySeated: 30,
    venueType: 'other',
    amenities: [
      'Golfové zázemí',
      'Wi-Fi',
      'Parkování'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: 'https://www.praguecitygolf.cz',
    instagramUrl: 'https://www.instagram.com/praguecitygolf/'
  },
  {
    name: 'Prague City Golf Zbraslav',
    slug: 'prague-city-golf-zbraslav',
    address: 'Oddechová 886, 156 00 Praha 5 - Zbraslav',
    district: 'Praha 16 - Zbraslav',
    description: [
      'Prague City Golf Zbraslav je rozsáhlý resort s 18jamkovým hřištěm, klubovnou a restaurací uprostřed přírody na okraji Prahy.',
      'Prostory zvládnou svatby, turnaje i korporátní eventy a díky kombinaci indoor a outdoor zón je možné měnit scénář podle počasí.',
      'Součástí je catering Sould.ad, golfová akademie a možnost spojit program s wellness nebo společenským večerem.'
    ].join('\n\n'),
    capacityStanding: 100,
    capacitySeated: 70,
    venueType: 'other',
    amenities: [
      'Klimatizace',
      'Wi-Fi',
      'Parkování',
      'Projekce',
      'Profesionální ozvučení',
      'Flipchart'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: 'https://www.praguecitygolf.cz',
    instagramUrl: 'https://www.instagram.com/praguecitygolf/'
  },
  {
    name: 'Ice Arena Letňany',
    slug: 'ice-arena-letnany',
    address: 'Tupolevova 669, 190 00 Praha 9',
    district: 'Praha 9 - Letňany',
    description: [
      'Ice Arena Letňany nabízí dvě ledové plochy s celoročním provozem a profesionálním zázemím pro sporty, firemní teambuilding i rodinné dny.',
      'Hala disponuje tribunou pro 550 diváků, sedmi šatnami, brusírnou i půjčovnou vybavení, takže zvládne i plnohodnotný turnaj.',
      'Součástí areálu je restaurace s výhledem na led, fitness, sauna i konferenční prostory, takže lze spojit sportovní program s networkingem.'
    ].join('\n\n'),
    capacityStanding: 150,
    capacitySeated: 150,
    venueType: 'other',
    amenities: [
      'Klimatizace',
      'Bezbariérový přístup',
      'Wi-Fi',
      'Parkování',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@icearena.cz',
    contactPhone: '+420 601 579 124',
    websiteUrl: 'https://icearena.cz/letnany/',
    instagramUrl: null
  },
  {
    name: 'Ice Arena Kateřinky',
    slug: 'ice-arena-katerinky',
    address: 'Ke Kateřinkám 2423/2a, 149 00 Praha 4',
    district: 'Praha 4 - Kateřinky',
    description: [
      'Ice Arena Kateřinky kombinuje dvě ledové plochy, venkovní hřiště i restauraci a vytváří ideální zázemí pro teambuilding na bruslích.',
      'Moderní šatny, půjčovna výstroje a trenérský tým pomáhají připravit programy od hobby hokeje až po firemní turnaje.',
      'Po sportu se hosté přesunou do Sportovky s výhledem na led, kde je připraven catering i projekce utkání.'
    ].join('\n\n'),
    capacityStanding: 150,
    capacitySeated: 120,
    venueType: 'other',
    amenities: [
      'Klimatizace',
      'Bezbariérový přístup',
      'Wi-Fi',
      'Parkování',
      'Profesionální ozvučení',
      'Flipchart'
    ],
    contactEmail: 'katerinky@icearena.cz',
    contactPhone: '+420 606 688 353',
    websiteUrl: 'https://icearena.cz/katerinky/',
    instagramUrl: null
  },
  {
    name: 'Továrna Vír',
    slug: 'tovarna-vir',
    address: 'Vír 1, 592 66 Vír',
    district: 'Kraj Vysočina',
    description: [
      'Továrna Vír je industriální areál u řeky Svratky, který kombinuje historickou turbínovnu s moderním eventovým zázemím.',
      'Prostory zvládnou workshopy, konference i svatby a díky čistému designu se hodí pro product launch i natáčení.',
      'Součástí je catering na míru, možnost outdoor programu na přehradě a udržitelný provoz s vlastní energií.'
    ].join('\n\n'),
    capacityStanding: 50,
    capacitySeated: 40,
    venueType: 'other',
    amenities: [
      'Klimatizace',
      'Wi-Fi',
      'Parkování',
      'Projekce',
      'Pódium',
      'Profesionální ozvučení',
      'Sprcha',
      'Kuchyňka',
      'Kávovar',
      'Nabíjecí stanice EV',
      'Flipchart'
    ],
    contactEmail: 'poznej@udolisvratky.cz',
    contactPhone: '+420 566 566 566',
    websiteUrl: 'https://www.tovarnavir.cz',
    instagramUrl: null
  },
  {
    name: 'Turquoise Prague',
    slug: 'turquoise-prague',
    address: '17. listopadu 2, 110 00 Praha 1',
    district: 'Praha 1 - Nové Město',
    description: [
      'Turquoise Prague je reprezentační prostor Národního muzea laděný do tyrkysu, který kombinuje monumentální architekturu a moderní AV servis.',
      'Disponuje salonky, galeriemi i zahradou, takže lze propojit gala večeři, tiskovou konferenci i večerní recepci.',
      'Zkušený eventový tým muzea zajistí catering, světelný design i kurátorské prohlídky expozic.'
    ].join('\n\n'),
    capacityStanding: 600,
    capacitySeated: 400,
    venueType: 'conference',
    amenities: [
      'Klimatizace',
      'Wi-Fi',
      'Projekce',
      'Bezbariérový přístup',
      'Parkování'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null
  },
  {
    name: 'Turquoise Prague Restaurant',
    slug: 'turquoise-prague-restaurant',
    address: '17. listopadu 2, 110 00 Praha 1',
    district: 'Praha 1 - Nové Město',
    description: [
      'Restaurace Turquoise je elegantní sál s výhledem do Vinohradské ulice, ideální pro slavnostní bankety a business snídaně.',
      'Interiér v tyrkysových tónech doplňuje prémiový catering a servis Národního muzea.',
      'Prostor lze propojit s dalšími částmi muzea a vytvořit tak kompletní eventový zážitek.'
    ].join('\n\n'),
    capacityStanding: 120,
    capacitySeated: 80,
    venueType: 'restaurant',
    amenities: [
      'Bezbariérový přístup',
      'Wi-Fi'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    parentSlug: 'turquoise-prague',
    status: 'hidden'
  },
  {
    name: 'Turquoise Prague Zahrada',
    slug: 'turquoise-prague-zahrada',
    address: '17. listopadu 2, 110 00 Praha 1',
    district: 'Praha 1 - Nové Město',
    description: [
      'Turquoise Zahrada je klidný dvůr obklopený historickými fasádami, který pojme letní recepci nebo večerní koncert.',
      'Díky přímému napojení na interiéry lze hladce přesouvat program mezi indoor a outdoor částí.',
      'Součástí je technika pro ambientní osvětlení a možnost stanového krytí.'
    ].join('\n\n'),
    capacityStanding: 500,
    capacitySeated: 250,
    venueType: 'garden',
    amenities: [
      'Bezbariérový přístup',
      'Wi-Fi'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    parentSlug: 'turquoise-prague',
    status: 'hidden'
  },
  {
    name: 'Turquoise Prague Sály v muzeu',
    slug: 'turquoise-prague-sal-v-muzeu',
    address: '17. listopadu 2, 110 00 Praha 1',
    district: 'Praha 1 - Nové Město',
    description: [
      'Sály v muzeu představují monumentální prostory hlavní budovy s mramorovými schodišti a freskami.',
      'Vhodné pro gala večery, módní přehlídky i koncerty s kapacitou až 600 hostů.',
      'Zázemí zahrnuje profesionální rigging, projekci a tým techniků muzea.'
    ].join('\n\n'),
    capacityStanding: 600,
    capacitySeated: 400,
    venueType: 'conference',
    amenities: [
      'Klimatizace',
      'Wi-Fi'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: null,
    instagramUrl: null,
    parentSlug: 'turquoise-prague',
    status: 'hidden'
  },
  {
    name: 'Revolution Train',
    slug: 'revolution-train',
    address: 'Radlická 40/109, 150 00 Praha 5',
    district: 'Praha 5 - Jinonice',
    description: [
      'Revolution Train je interaktivní vlaková souprava umístěná v areálu bývalého nádraží Jinonice, která proměňuje vagóny v zážitkovou expozici.',
      'Program kombinuje multimediální projekce, virtuální realitu a autentické scénáře, takže funguje pro vzdělávací eventy i firemní CSR akce.',
      'Součástí je konferenční zázemí na peronu, catering i možnost objednat celodenní workshop s odborníky.'
    ].join('\n\n'),
    capacityStanding: 300,
    capacitySeated: 120,
    venueType: 'other',
    amenities: [
      'Projekce',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@revolutiontrain.cz',
    contactPhone: '+420 608 824 757',
    websiteUrl: 'https://www.revolutiontrain.cz',
    instagramUrl: 'https://www.instagram.com/revolution_train/'
  },
  {
    name: 'Restaurant Parnas',
    slug: 'restaurant-parnas',
    address: 'Smetanovo nábřeží 1012/2, 110 00 Praha 1',
    district: 'Praha 1 - Staré Město',
    description: [
      'Restaurant Parnas je ikonická kavárna Národního divadla s art deco interiérem a výhledem na Vltavu.',
      'Prostor se hodí pro business snídaně, degustace i večerní recepce a je propojitelný s budovou divadla.',
      'Součástí je fine dining kuchyně a možnost doplnit akci o privátní prohlídku historických foyerů.'
    ].join('\n\n'),
    capacityStanding: 80,
    capacitySeated: 60,
    venueType: 'restaurant',
    amenities: [
      'Klimatizace',
      'Wi-Fi'
    ],
    contactEmail: 'info@narodni-divadlo.cz',
    contactPhone: '+420 224 901 448',
    websiteUrl: 'https://www.narodni-divadlo.cz/cs/o-nas/restaurace/parnas',
    instagramUrl: null
  },
  {
    name: 'Bar Forbína',
    slug: 'bar-forbina',
    address: 'Národní 1, 110 00 Praha 1',
    district: 'Praha 1 - Nové Město',
    description: [
      'Bar Forbína spojuje filmovou atmosféru Národní třídy s craft koktejly a pestrým programem živé hudby.',
      'Prostor s pódiem a flexibilním uspořádáním je ideální pro launch eventy, talk show i privátní party.',
      'Součástí je moderní zvuk, světla i produkční tým schopný připravit branding na míru.'
    ].join('\n\n'),
    capacityStanding: 80,
    capacitySeated: 40,
    venueType: 'bar',
    amenities: [
      'Wi-Fi',
      'Pódium',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@barforbina.cz',
    contactPhone: '+420 725 550 509',
    websiteUrl: 'https://barforbina.cz',
    instagramUrl: 'https://www.instagram.com/barforbina/'
  },
  {
    name: 'Muzeum slivovice R. Jelínek',
    slug: 'muzeum-slivovice-r-jelinek',
    address: 'U Lužického semináře 116, 118 00 Praha 1',
    district: 'Praha 1 - Malá Strana',
    description: [
      'Muzeum slivovice R. Jelínek spojuje interaktivní expozici, bar a degustaci originálních destilátů.',
      'Prostory lze rozdělit na více zón a kombinovat tak edukační část s večerním programem.',
      'Hostům je k dispozici zkušený tým barmanů i možnost tematických workshopů.'
    ].join('\n\n'),
    capacityStanding: 270,
    capacitySeated: 120,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Projekce',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@muzeumslivovice.cz',
    contactPhone: '+420 724 814 034',
    websiteUrl: 'https://www.muzeumslivovice.cz',
    instagramUrl: 'https://www.instagram.com/muzeumslivovice/'
  },
  {
    name: 'Salónek U Jelínka',
    slug: 'muzeum-slivovice-r-jelinek-salonek-u-jelinka',
    address: 'U Lužického semináře 116, 118 00 Praha 1',
    district: 'Praha 1 - Malá Strana',
    description: [
      'Salónek U Jelínka je největší vnitřní sál muzea a díky barevnému mappingu vytváří wow efekt pro firemní prezentace.',
      'Součástí je bar, projekce i možnost řízené degustace s ambasadorem značky.',
      'Ideální pro gala večery, tiskové konference nebo networking se zvukovou kulisou.'
    ].join('\n\n'),
    capacityStanding: 120,
    capacitySeated: 80,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Projekce',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@muzeumslivovice.cz',
    contactPhone: '+420 724 814 034',
    websiteUrl: 'https://www.muzeumslivovice.cz',
    instagramUrl: 'https://www.instagram.com/muzeumslivovice/',
    parentSlug: 'muzeum-slivovice-r-jelinek',
    status: 'hidden'
  },
  {
    name: 'Ochutnávková část',
    slug: 'muzeum-slivovice-r-jelinek-ochutnavkova-cast',
    address: 'U Lužického semináře 116, 118 00 Praha 1',
    district: 'Praha 1 - Malá Strana',
    description: [
      'Ochutnávková část nabízí degustační stoly a prezentace mistrů palíren pro skupiny i komorní eventy.',
      'Příjemné osvětlení a vitríny s archivními lahvemi vytvářejí stylové prostředí pro networking.',
      'Prostor lze kombinovat se sklepem nebo barem a připravit tak dramaturgii na míru.'
    ].join('\n\n'),
    capacityStanding: 100,
    capacitySeated: 60,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Projekce',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@muzeumslivovice.cz',
    contactPhone: '+420 724 814 034',
    websiteUrl: 'https://www.muzeumslivovice.cz',
    instagramUrl: 'https://www.instagram.com/muzeumslivovice/',
    parentSlug: 'muzeum-slivovice-r-jelinek',
    status: 'hidden'
  },
  {
    name: 'Venkovní posezení',
    slug: 'muzeum-slivovice-r-jelinek-venkovni-prostor',
    address: 'U Lužického semináře 116, 118 00 Praha 1',
    district: 'Praha 1 - Malá Strana',
    description: [
      'Venkovní patio muzea přináší letní atmosféru na Kampě a nabízí místo pro BBQ, večírky i pop-up bary.',
      'Prostor lze zastřešit, doplnit o live cooking a propojit se Zahradou Hergetovy cihelny.',
      'Skvěle funguje pro networking s hudebním doprovodem nebo rodinné oslavy.'
    ].join('\n\n'),
    capacityStanding: 100,
    capacitySeated: 60,
    venueType: 'garden',
    amenities: [
      'Wi-Fi',
      'Projekce',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@muzeumslivovice.cz',
    contactPhone: '+420 724 814 034',
    websiteUrl: 'https://www.muzeumslivovice.cz',
    instagramUrl: 'https://www.instagram.com/muzeumslivovice/',
    parentSlug: 'muzeum-slivovice-r-jelinek',
    status: 'hidden'
  },
  {
    name: 'Salónek Vizovice',
    slug: 'muzeum-slivovice-r-jelinek-salonek-vizovice',
    address: 'U Lužického semináře 116, 118 00 Praha 1',
    district: 'Praha 1 - Malá Strana',
    description: [
      'Salónek Vizovice je komorní zasedací místnost inspirovaná rodným městem značky R. Jelínek.',
      'Nabízí privátní atmosféru pro board meeting, workshop nebo degustaci v užším kruhu.',
      'Součástí je velkoformátová obrazovka, Wi-Fi a kompletní servis barmanů.'
    ].join('\n\n'),
    capacityStanding: 24,
    capacitySeated: 16,
    venueType: 'conference',
    amenities: [
      'Wi-Fi',
      'Projekce',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@muzeumslivovice.cz',
    contactPhone: '+420 724 814 034',
    websiteUrl: 'https://www.muzeumslivovice.cz',
    instagramUrl: 'https://www.instagram.com/muzeumslivovice/',
    parentSlug: 'muzeum-slivovice-r-jelinek',
    status: 'hidden'
  },
  {
    name: 'Salónek Kampa',
    slug: 'muzeum-slivovice-r-jelinek-salonek-kampa',
    address: 'U Lužického semináře 116, 118 00 Praha 1',
    district: 'Praha 1 - Malá Strana',
    description: [
      'Salónek Kampa je malý privátní prostor s výhledem do uliček Kampy, ideální pro VIP hosty nebo meetingy.',
      'Prostor je vybaven obrazovkou a pohodlným sezením a lze jej spojit s ochutnávkovou částí.',
      'Skvěle se hodí pro tiskové rozhovory, pre-board meetingy nebo backstage pro řečníky.'
    ].join('\n\n'),
    capacityStanding: 10,
    capacitySeated: 8,
    venueType: 'conference',
    amenities: [
      'Wi-Fi',
      'Projekce',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@muzeumslivovice.cz',
    contactPhone: '+420 724 814 034',
    websiteUrl: 'https://www.muzeumslivovice.cz',
    instagramUrl: 'https://www.instagram.com/muzeumslivovice/',
    parentSlug: 'muzeum-slivovice-r-jelinek',
    status: 'hidden'
  },
  {
    name: 'Bar & Klub R. Jelínek',
    slug: 'muzeum-slivovice-r-jelinek-bar-a-klub',
    address: 'U Lužického semináře 116, 118 00 Praha 1',
    district: 'Praha 1 - Malá Strana',
    description: [
      'Klub v podzemí muzea nabízí intimní atmosféru s cihlovými klenbami a signature koktejly na bázi slivovice.',
      'Ideální pro afterparty, hudební večery nebo brand launch v kombinaci s DJ vystoupením.',
      'Součástí je stage, taneční parket a možnost prezentace na LED obrazovkách.'
    ].join('\n\n'),
    capacityStanding: 80,
    capacitySeated: 40,
    venueType: 'bar',
    amenities: [
      'Wi-Fi',
      'Projekce',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@muzeumslivovice.cz',
    contactPhone: '+420 724 814 034',
    websiteUrl: 'https://www.muzeumslivovice.cz',
    instagramUrl: 'https://www.instagram.com/muzeumslivovice/',
    parentSlug: 'muzeum-slivovice-r-jelinek',
    status: 'hidden'
  },
  {
    name: 'Areál 7',
    slug: 'areal-7',
    address: 'Za Elektrárnou 3, 170 00 Praha 7',
    district: 'Praha 7 - Holešovice',
    description: [
      'Areál 7 je bývalý energetický komplex proměněný v multifunkční event park s industriálním šarmem.',
      'Disponuje halami, venkovní plochou i zázemím pro konferenci nebo festival pro tisíce návštěvníků.',
      'Součástí je vlastní produkční tým, parkování pro techniku i možnost modulárních scénografií.'
    ].join('\n\n'),
    capacityStanding: 4000,
    capacitySeated: 1500,
    venueType: 'other',
    amenities: [
      'Parkování'
    ],
    contactEmail: 'podpora@areal7.cz',
    contactPhone: '+420 776 572 384',
    websiteUrl: 'https://areal7.cz',
    instagramUrl: 'https://www.instagram.com/areal7prague/'
  },
  {
    name: 'Pivnice Polepšovna',
    slug: 'pivnice-polepsovna',
    address: 'Dělnická 32, 170 00 Praha 7',
    district: 'Praha 7 - Holešovice',
    description: [
      'Pivnice Polepšovna staví na výběru českých minipivovarů a poctivé kuchyni servírované v industriálním interiéru bývalého skladu.',
      'Flexibilní sál se přizpůsobí neformálním firemním večírkům, řízeným degustacím i kulturním večerům s živou hudbou.',
      'Součástí je vlastní výčep, kuchyně a tým, který dokáže připravit tematické pivní programy nebo tap takeover na míru.'
    ].join('\n\n'),
    capacityStanding: 100,
    capacitySeated: null,
    venueType: 'bar',
    amenities: [
      'Výčep minipivovarů',
      'Wi-Fi',
      'Zobrazovací technika',
      'Profesionální ozvučení'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: 'https://polepsovna.cz',
    instagramUrl: 'https://www.instagram.com/pivnice_polepsovna/'
  },
  {
    name: 'Sworp House',
    slug: 'all-in-event-space',
    address: 'V Olšinách 2300/75, 108 00 Praha 10',
    district: 'Praha 10 - Strašnice',
    description: [
      'Sworp House je kreativní eventový hub v bývalé bankovní budově, kde najdete konferenční sál, čtyři meeting roomy i vlastní bistro.',
      'Prostory mají denní světlo, moderní AV techniku a tým koordinátorů, kteří zvládnou konferenci, hackathon i klientský večer.',
      'Na místě je parkování, kompletní catering a možnost využít coworkingové zázemí pro pop-up kancelář.'
    ].join('\n\n'),
    capacityStanding: 200,
    capacitySeated: 130,
    venueType: 'conference',
    amenities: [
      'Klimatizace',
      'Wi-Fi',
      'Parkování',
      'Prezentace',
      'Profesionální ozvučení',
      'Flipchart'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: 'https://sworphouse.cz',
    instagramUrl: 'https://www.instagram.com/sworphouse/'
  },
  {
    name: 'Konferenční místnosti New York',
    slug: 'all-in-event-space-konferencni-mistnosti-new-york',
    address: 'V Olšinách 2300/75, 108 00 Praha 10',
    district: 'Praha 10 - Strašnice',
    description: [
      'Čtveřice menších zasedaček New York nabízí světlý design a modulární nábytek pro workshopy, školení nebo konzultace ve více týmech najednou.',
      'Každá místnost má obrazovku, konferenční kameru a přístup k concierge servisu Sworp House.',
      'Díky bistru v přízemí lze jednoduše zajistit coffee break či networking po skončení meetingu.'
    ].join('\n\n'),
    capacityStanding: 35,
    capacitySeated: 25,
    venueType: 'conference',
    amenities: [
      'Klimatizace',
      'Wi-Fi',
      'Parkování',
      'Prezentace',
      'Profesionální ozvučení',
      'Flipchart'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: 'https://sworphouse.cz',
    instagramUrl: 'https://www.instagram.com/sworphouse/',
    parentSlug: 'all-in-event-space',
    status: 'hidden'
  },
  {
    name: 'Konferenční sál Sydney',
    slug: 'all-in-event-space-konferencni-sal-sydney',
    address: 'V Olšinách 2300/75, 108 00 Praha 10',
    district: 'Praha 10 - Strašnice',
    description: [
      'Sydney je hlavní sál Sworp House o rozloze 280 m² s denním světlem a variabilním uspořádáním pro konference, školení i společenské večery.',
      'Vybavení zahrnuje velkoformátovou projekci, ozvučení a možnost rozdělit prostor mobilními stěnami.',
      'Součástí je produkční podpora, catering na míru a parkování přímo v areálu.'
    ].join('\n\n'),
    capacityStanding: 200,
    capacitySeated: 130,
    venueType: 'conference',
    amenities: [
      'Klimatizace',
      'Wi-Fi',
      'Parkování',
      'Prezentace',
      'Profesionální ozvučení',
      'Flipchart'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: 'https://sworphouse.cz',
    instagramUrl: 'https://www.instagram.com/sworphouse/',
    parentSlug: 'all-in-event-space',
    status: 'hidden'
  },
  {
    name: 'Mediterranean bistro Sworm',
    slug: 'all-in-event-space-bistro-sworm',
    address: 'V Olšinách 2300/75, 108 00 Praha 10',
    district: 'Praha 10 - Strašnice',
    description: [
      'Bistro Sworm navazuje na konferenční prostory Sworp House a zajišťuje celodenní catering i neformální networkingové zázemí.',
      'Kuchyně se zaměřuje na středomořské speciality, které lze servírovat formou coffee breaku, bufetu i večerního menu.',
      'Prostor funguje samostatně jako místo pro interní setkání, produktové snídaně nebo menší oslavy.'
    ].join('\n\n'),
    capacityStanding: 35,
    capacitySeated: 25,
    venueType: 'restaurant',
    amenities: [
      'Klimatizace',
      'Wi-Fi',
      'Parkování'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: 'https://sworphouse.cz',
    instagramUrl: 'https://www.instagram.com/sworphouse/',
    parentSlug: 'all-in-event-space',
    status: 'hidden'
  },
  {
    name: 'Stará čistírna',
    slug: 'stara-cistirna',
    address: 'Papírenská 6, 160 00 Praha 6',
    district: 'Praha 6 - Bubeneč',
    description: [
      'Stará čistírna v Bubenči je unikátní industriální památka, která nabízí několik monumentálních sálů, komínovou zahradu i kavárnu.',
      'Areál zvládne galavečer pro stovky hostů stejně dobře jako komorní výstavu nebo módní show s výraznou scénografií.',
      'Součástí pronájmu je produkční tým, chill-out zóny a možnost využít sousední muzeum Kanalizace.'
    ].join('\n\n'),
    capacityStanding: 450,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Parkování',
      'Zobrazovací technika',
      'Pódium',
      'Profesionální ozvučení',
      'Kávovar',
      'DJ vybavení'
    ],
    contactEmail: 'info@staracistirna.cz',
    contactPhone: '+420 724 111 793',
    websiteUrl: 'https://www.staracistirna.cz',
    instagramUrl: 'https://www.instagram.com/stara_cistirna/'
  },
  {
    name: 'Hlavní hala – Stará čistírna',
    slug: 'stara-cistirna-hlavni-hala',
    address: 'Papírenská 6, 160 00 Praha 6',
    district: 'Praha 6 - Bubeneč',
    description: [
      'Hlavní hala působí jako industriální katedrála se stropem 12 metrů a původními technologie kanalizačního provozu.',
      'Prostor se hodí pro koncerty, gala večery i velké konference s napojením na ostatní části areálu.',
      'Díky tribunám a mobilním prvkům lze snadno měnit scénář a vytvořit několik scén v jedné hale.'
    ].join('\n\n'),
    capacityStanding: 300,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Parkování',
      'Zobrazovací technika',
      'Pódium',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@staracistirna.cz',
    contactPhone: '+420 724 111 793',
    websiteUrl: 'https://www.staracistirna.cz',
    instagramUrl: 'https://www.instagram.com/stara_cistirna/',
    parentSlug: 'stara-cistirna',
    status: 'hidden'
  },
  {
    name: 'Galerie – Stará čistírna',
    slug: 'stara-cistirna-galerie',
    address: 'Papírenská 6, 160 00 Praha 6',
    district: 'Praha 6 - Bubeneč',
    description: [
      'Galerie je elegantní prostor v patře nad hlavní halou, ideální pro výstavy, tiskové konference nebo VIP lounge.',
      'Historické zábradlí a pohled do technologie vytváří unikátní atmosféru pro networking či pop-up showroom.',
      'Lze ji propojit se zbytkem čistírny a vytvořit tak uzavřený event na více úrovních.'
    ].join('\n\n'),
    capacityStanding: 150,
    capacitySeated: null,
    venueType: 'gallery',
    amenities: [
      'Wi-Fi',
      'Parkování',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@staracistirna.cz',
    contactPhone: '+420 724 111 793',
    websiteUrl: 'https://www.staracistirna.cz',
    instagramUrl: 'https://www.instagram.com/stara_cistirna/',
    parentSlug: 'stara-cistirna',
    status: 'hidden'
  },
  {
    name: 'Půda – Stará čistírna',
    slug: 'stara-cistirna-puda',
    address: 'Papírenská 6, 160 00 Praha 6',
    district: 'Praha 6 - Bubeneč',
    description: [
      'Půda je světlý rustikální prostor s dřevěnou konstrukcí, který se hodí pro svatby, workshopy i filmové natáčení.',
      'Velká plocha umožňuje kombinovat chill-out, catering i instalace umění.',
      'Oceníte přímé napojení na kavárnu a možnost variabilního mobiliáře.'
    ].join('\n\n'),
    capacityStanding: 130,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Parkování',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@staracistirna.cz',
    contactPhone: '+420 724 111 793',
    websiteUrl: 'https://www.staracistirna.cz',
    instagramUrl: 'https://www.instagram.com/stara_cistirna/',
    parentSlug: 'stara-cistirna',
    status: 'hidden'
  },
  {
    name: 'Strojovna a kotelna – Stará čistírna',
    slug: 'stara-cistirna-strojovna-a-kotelna',
    address: 'Papírenská 6, 160 00 Praha 6',
    district: 'Praha 6 - Bubeneč',
    description: [
      'Strojovna a kotelna zachovává původní parní motory a nabízí autentické prostředí pro fotoprodukce či komorní setkání.',
      'Strojní vybavení vytváří výraznou kulisu, kterou lze doplnit ambientním osvětlením.',
      'Prostor je vhodný pro degustace, press junkety nebo filmové natáčení.'
    ].join('\n\n'),
    capacityStanding: 50,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Profesionální ozvučení',
      'Parkování'
    ],
    contactEmail: 'info@staracistirna.cz',
    contactPhone: '+420 724 111 793',
    websiteUrl: 'https://www.staracistirna.cz',
    instagramUrl: 'https://www.instagram.com/stara_cistirna/',
    parentSlug: 'stara-cistirna',
    status: 'hidden'
  },
  {
    name: 'Sloupový sál – Stará čistírna',
    slug: 'stara-cistirna-sloupovy-sal',
    address: 'Papírenská 6, 160 00 Praha 6',
    district: 'Praha 6 - Bubeneč',
    description: [
      'Sloupový sál je kruhový prostor se sloupy z tepaného železa, který působí reprezentativně i bez rozsáhlé výzdoby.',
      'Hodí se pro cocktail party, módní prezentace nebo menší konference.',
      'Díky sousedství hlavní haly lze jednoduše vytvořit více zón pro různé formáty programu.'
    ].join('\n\n'),
    capacityStanding: 100,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Parkování',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@staracistirna.cz',
    contactPhone: '+420 724 111 793',
    websiteUrl: 'https://www.staracistirna.cz',
    instagramUrl: 'https://www.instagram.com/stara_cistirna/',
    parentSlug: 'stara-cistirna',
    status: 'hidden'
  },
  {
    name: 'Sál kalových čerpadel – Stará čistírna',
    slug: 'stara-cistirna-sal-kalovych-cerpadel',
    address: 'Papírenská 6, 160 00 Praha 6',
    district: 'Praha 6 - Bubeneč',
    description: [
      'Sál kalových čerpadel kombinuje betonové konstrukce s vodními technologiemi a vytváří netradiční kulisu pro firemní prezentace.',
      'Díky výšce stropu a akustice funguje skvěle pro umělecké performance i produktové launch eventy.',
      'Prostor má vlastní přístup a lze ho propojit s exteriérem areálu.'
    ].join('\n\n'),
    capacityStanding: 100,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Parkování',
      'Profesionální ozvučení'
    ],
    contactEmail: 'info@staracistirna.cz',
    contactPhone: '+420 724 111 793',
    websiteUrl: 'https://www.staracistirna.cz',
    instagramUrl: 'https://www.instagram.com/stara_cistirna/',
    parentSlug: 'stara-cistirna',
    status: 'hidden'
  },
  {
    name: 'Sál lapače písku – Stará čistírna',
    slug: 'stara-cistirna-sal-lapace-pisku',
    address: 'Papírenská 6, 160 00 Praha 6',
    district: 'Praha 6 - Bubeneč',
    description: [
      'Sál lapače písku je menší technický prostor s ocelovými konstrukcemi a nádržemi, který ocení filmové štáby i experimentální divadlo.',
      'Lze ho využít pro instalace, workshopy nebo jako speciální zónu větší akce.',
      'Prostor nabízí nezaměnitelnou atmosféru historické infrastruktury.'
    ].join('\n\n'),
    capacityStanding: 100,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Parkování'
    ],
    contactEmail: 'info@staracistirna.cz',
    contactPhone: '+420 724 111 793',
    websiteUrl: 'https://www.staracistirna.cz',
    instagramUrl: 'https://www.instagram.com/stara_cistirna/',
    parentSlug: 'stara-cistirna',
    status: 'hidden'
  },
  {
    name: 'Půda nad kavárnou – Stará čistírna',
    slug: 'stara-cistirna-puda-nad-kavarnou',
    address: 'Papírenská 6, 160 00 Praha 6',
    district: 'Praha 6 - Bubeneč',
    description: [
      'Půda nad kavárnou je komorní mezonet, který se hodí pro workshopy, koučink nebo dětské programy během větších akcí.',
      'Dřevěné trámy a výhled do parku vytvářejí klidnou atmosféru a prostor lze snadno zařídit do kruhu i divadla.',
      'Výhodou je blízkost kavárny a zázemí pro catering.'
    ].join('\n\n'),
    capacityStanding: 70,
    capacitySeated: null,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Parkování'
    ],
    contactEmail: 'info@staracistirna.cz',
    contactPhone: '+420 724 111 793',
    websiteUrl: 'https://www.staracistirna.cz',
    instagramUrl: 'https://www.instagram.com/stara_cistirna/',
    parentSlug: 'stara-cistirna',
    status: 'hidden'
  },
  {
    name: 'Corso Řevnice',
    slug: 'corso-revnice',
    address: 'Náměstí krále Jiřího z Poděbrad 2, 252 30 Řevnice',
    district: 'Středočeský kraj',
    description: [
      'Corso Řevnice je multifunkční sál propojený s kavárnou a kulturním programem v srdci malebného města u řeky Berounky.',
      'Prostor zvládne firemní meeting, komorní koncert i komunitní festival a je obklopený vlastním dvorem.',
      'Součástí je pódium, projekce a lokální catering, který naváže na koncept komunitního centra.'
    ].join('\n\n'),
    capacityStanding: 70,
    capacitySeated: 50,
    venueType: 'other',
    amenities: [
      'Wi-Fi',
      'Zobrazovací technika',
      'Profesionální ozvučení'
    ],
    contactEmail: null,
    contactPhone: null,
    websiteUrl: 'https://corso-revnice.cz',
    instagramUrl: null
  },
  {
    name: 'Škoda muzeum Mladá Boleslav',
    slug: 'skoda-muzeum-mlada-boleslav',
    address: 'tř. Václava Klementa, 293 01 Mladá Boleslav',
    district: 'Středočeský kraj',
    description: [
      'Škoda muzeum propojuje historickou tovární halu s moderním designem a nabízí několik sálů s automobilovou atmosférou.',
      'Muzeum se hodí pro konference, gala večery i dealerská školení a poskytuje i venkovní plochy pro testovací jízdy.',
      'Součástí je plnohodnotné AV vybavení, catering od Sould.Ad a možnost tematických prohlídek expozice.'
    ].join('\n\n'),
    capacityStanding: 582,
    capacitySeated: 300,
    venueType: 'conference',
    amenities: [
      'Klimatizace',
      'Bezbariérový přístup',
      'Wi-Fi',
      'Parkování',
      'Projekce',
      'Pódium',
      'Profesionální ozvučení',
      'Nabíjecí stanice EV',
      'Flipchart'
    ],
    contactEmail: 'muzeum@skoda-auto.cz',
    contactPhone: '+420 326 832 038',
    websiteUrl: 'https://museum.skoda-auto.cz',
    instagramUrl: 'https://www.instagram.com/skodamuseum/'
  },
  {
    name: 'Laurin & Klement Fórum',
    slug: 'skoda-muzeum-mlada-boleslav-laurin-klement-forum',
    address: 'tř. Václava Klementa, 293 01 Mladá Boleslav',
    district: 'Středočeský kraj',
    description: [
      'Laurin & Klement Fórum je hlavní sál muzea se škálovatelným pódiem, světelným parkem a kapacitou až 376 hostů.',
      'Vhodný pro konference, koncerty i televizní produkci, poskytuje profesionální zázemí a přímo navazuje na foyer s expozicí.',
      'Variabilní tribuny umožní rychlou změnu layoutu z divadla na gala banket.'
    ].join('\n\n'),
    capacityStanding: 376,
    capacitySeated: 250,
    venueType: 'conference',
    amenities: [
      'Klimatizace',
      'Bezbariérový přístup',
      'Wi-Fi',
      'Parkování',
      'Projekce',
      'Pódium',
      'Profesionální ozvučení',
      'Nabíjecí stanice EV'
    ],
    contactEmail: 'muzeum@skoda-auto.cz',
    contactPhone: '+420 326 832 038',
    websiteUrl: 'https://museum.skoda-auto.cz',
    instagramUrl: 'https://www.instagram.com/skodamuseum/',
    parentSlug: 'skoda-muzeum-mlada-boleslav',
    status: 'hidden'
  },
  {
    name: 'Konferenční sál Hieronimus I',
    slug: 'skoda-muzeum-mlada-boleslav-hieronimus-i',
    address: 'tř. Václava Klementa, 293 01 Mladá Boleslav',
    district: 'Středočeský kraj',
    description: [
      'Sál Hieronimus I se nachází v historickém křídle muzea a je ideální pro workshopy, školení nebo menší tiskové konference.',
      'Prostor je vybaven projektorem, kabinou pro tlumočení i flexibilním nábytkem.',
      'Hosté mohou využít catering z muzejní restaurace a navázat programem v expozici.'
    ].join('\n\n'),
    capacityStanding: 40,
    capacitySeated: 40,
    venueType: 'conference',
    amenities: [
      'Klimatizace',
      'Bezbariérový přístup',
      'Wi-Fi',
      'Parkování',
      'Projekce',
      'Profesionální ozvučení',
      'Nabíjecí stanice EV',
      'Flipchart'
    ],
    contactEmail: 'muzeum@skoda-auto.cz',
    contactPhone: '+420 326 832 038',
    websiteUrl: 'https://museum.skoda-auto.cz',
    instagramUrl: 'https://www.instagram.com/skodamuseum/',
    parentSlug: 'skoda-muzeum-mlada-boleslav',
    status: 'hidden'
  },
  {
    name: 'Místnost 393',
    slug: 'mistnost-393',
    address: 'Záluské 25, 158 00 Praha 5',
    district: 'Praha 5 - Jinonice',
    description: [
      'Místnost 393 je klidná zasedačka s výhledem do zeleně, navržená pro menší kurzy, koučink nebo konstelace.',
      'Minimalistický interiér bez rušivých motivů se dá snadno upravit do prázdného prostoru nebo klasického školení.',
      'Hostitelé ocení kuchyňku s kávovarem, notebook corner i možnost zapůjčení doplňků pro práci se skupinou.'
    ].join('\n\n'),
    capacityStanding: 10,
    capacitySeated: 10,
    venueType: 'conference',
    amenities: [
      'Wi-Fi',
      'Kuchyňka',
      'Zobrazovací technika',
      'Profesionální ozvučení'
    ],
    contactEmail: 'pronajem@mistnost393.cz',
    contactPhone: null,
    websiteUrl: 'https://mistnost393.cz',
    instagramUrl: 'https://www.instagram.com/mistnost393/'
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
        throw new Error(`Parent venue with slug "${entry.parentSlug}" not found`)
      }
      parentId = parentVenue.id
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

    console.log(`${existing ? 'Updated' : 'Created'} venue: ${entry.name}`)
  }
}

main()
  .catch((error) => {
    console.error('Failed to add venues:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
