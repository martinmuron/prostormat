import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config({ path: '.env.local' })

const prisma = new PrismaClient()

const enhancedDescriptions = [
  {
    id: 'cmg9fmr5k00r3ntu7mpxgfcgr',
    slug: 'midtown-meetings_apartma-saturn',
    description: 'Apartmá Saturn je exkluzivní prostor pro privátní setkání nebo obchodní jednání v Midtown Meetings, konferenčních místnostech ideálně umístěných v centru Prahy 2 - Vinohrady v blízkosti metra a tramvajových zastávek. Prostor nabízí kapacitu až 8 osob a disponuje soukromou terasou s výhledem na město, která poskytuje relaxační atmosféru pro VIP setkání nebo manažerská jednání. Apartmá je plně vybaveno moderním zařízením včetně WiFi, baru a terasy, přičemž vytváří komfortní prostředí s důrazem na soukromí a omezeným přístupem. Midtown Meetings nabízí různé možnosti pro uspořádání konferencí, schůzek a setkání v jedné budově, kde jsou k dispozici i další prostory včetně kongresového sálu s kapacitou až 80 osob. Díky centrální poloze a kompletnímu vybavení je Apartmá Saturn ideální volbou pro náročné obchodní jednání, kde je klíčové spojení profesionality s příjemnou atmosférou a exkluzivním výhledem na Prahu.'
  },
  {
    id: 'cmg9fl54y00ozntu7t12moaf1',
    slug: 'zenwork-praha_meeting-rooms-1',
    description: 'Zenwork Event Space je zasedací místnost s moderním a stylovým interiérem, pohodlným posezením a nejmodernějším audiovizuálním vybavením v coworkingovém centru Zenwork v Praze 1 s kapacitou až 200 osob ve stoje. Zenwork je více než jen pracovní prostor – je to komunita motivovaných, vášnivých a různorodých jednotlivců, kteří sdílejí společný cíl: budovat lepší budoucnost. Prostor se rozkládá na ploše 2 615 metrů čtverečních s více než 330 pracovními místy a nabízí kompletní vybavení včetně vysokorychlostního internetu, občerstvení (káva, čaj a ovoce), sprchy, klimatizace, projektoru, cateringu a baru. Zenwork poskytuje nejen moderní zasedací místnosti, ale také fully equipped meeting rooms ideální pro konference libovolné velikosti. Díky centrální poloze v srdci Prahy je Zenwork dostupný a inspirující prostor, kde se týmy i jednotlivci cítí jako doma. Dedikovaný management tým s dlouholetými zkušenostmi v komerčních nemovitostech a správě coworkingových prostor zajišťuje bezproblémový servis pro vaše akce, workshopy a týmová setkání.'
  },
  {
    id: 'cmg9f2smp001tntu70qbyite1',
    slug: 'bar-kobka-8',
    description: 'Bar Kobka 8 je stylový bar na Smíchovské náplavce v Praze 1 s kapacitou až 90 osob ve stoje, který nabízí skvělou náladu, hudbu a idylické prostředí. Jedná se o originální bar na unikátním místě – ideální volbu pro váš firemní večírek nebo soukromou akci. Bar nabízí vlastní drinky včetně ginu a toniku nejvyšší kvality, kvalitní vína, českou klasiku v podobě dobře načepovaného únětického piva a ručně praženou kávu z malé české pražírny Yemenites. Tapas si zde zamiluje každý – každý týden pro vás vybírají pestrou variaci sýrů, uzenin a dalších delikates. Přátelská obsluha, lahodné občerstvení a jedinečná atmosféra vám zaručí neopakovatelný zážitek. Díky vnitřnímu topení můžete prostory v baru využít i v zimních měsících. K dispozici je WiFi, catering na míru a plně vybavený bar. Pro informace o pronájmu celého prostoru na firemní akce nebo soukromé večírky s bezchybnou obsluhou a cateringem dopřejte svým přátelům a obchodním partnerům ta nejlepší piva, vína a míchané drinky v jedinečné atmosféře Smíchovské náplavky.'
  },
  {
    id: 'cmg9czro4000bntr6mechqn6d',
    slug: 'medusa-prague',
    description: 'Medusa Prague je multifunkční prostor na adrese Melantrichova 5 v srdci Starého Města, který kombinuje fine dining kuchyni šéfkuchaře Jakuba Hirsche s večerním cabaretem a živou hudbou. Od 8:00 do 16:00 se Medusa proměňuje v moderní bistro servírující čerstvé a chuťové brunchové pokrmy s řemeslnou kávou a živými talíři v relaxační atmosféře perfektní pro setkání s přáteli, business lunche nebo jednoduše správný start dne. Prostor nabízí signature koktejly, precizně sestavené evropské menu a večery s plnohodnotným programem na pódiu. Každý pátek a sobotu večer Medusa ožívá živými zpěváky a kapelami, které vytváří atmosféru plnou rytmu, energie a stylu. Kombinace skvělého zvuku, atmosféry a chuti dělá z Medusy jedno z nejzajímavějších víkendových míst v Praze. Speciální cabaret show přidává tento prostor do kategorie unikátních zážitků, kde život je o objetí každého okamžiku a nejvíc zábavy se stane, když se necháte unést a ponoříte do kouzla nečekaného. S kapacitou až 100 osob ve stoje je Medusa ideální pro firemní akce, večírky a soukromé oslavy.'
  },
  {
    id: 'cmg9fb2w900cbntu7mogce0uh',
    slug: 'hoax-meeting-room',
    description: 'HOAX Pub je moderní prostor v Praze 5 s kapacitou až 90 míst k sezení, který poskytuje zašívárnu pro kreativce, ale i místo pro obchodní schůzky a firemní setkání. Tento multifunkční prostor kombinuje uvolněnou atmosféru pubu s praktickým zázemím pro pracovní meetingy, což z něj činí ideální volbu pro týmy, které hledají netradiční prostředí pro brainstormingy, workshopy nebo jednoduše příjemné místo pro networking. K dispozici je bezplatné WiFi připojení, catering na míru a plně vybavený bar s širokým výběrem nápojů. Prostor je vhodný pro kreativní agentury, startupy a freelancery, kteří oceňují kombinaci pracovního prostředí s relaxační atmosférou. HOAX Pub nabízí flexibility v uspořádání prostoru podle potřeb vaší akce, od menších týmových schůzek po větší networking events. Díky poloze v Praze 5 je prostor snadno dostupný a poskytuje dostatečnou kapacitu pro středně velké akce. Ideální volba pro ty, kteří hledají alternativu k tradičním konferenčním místnostem a chtějí své setkání ozvláštnit příjemnou pubovou atmosférou spojenou s profesionálním zázemím.'
  },
  {
    id: 'cmg9f9icc00a9ntu7p4trt0p3',
    slug: 'academy-hub',
    description: 'academy HUB Praha je neotřelý a příjemný prostor pro firemní akce, školení a semináře v Praze 8 - Karlíně s kapacitou až 30 osob ve stoje. Jedná se o designové prostory se zázemím pro školení a setkávání, ideální pro workshopy, strategické sprinty, tiskové konference, prezentace, pracovní schůzky, firemní oslavy, degustace a společenské eventy. Koncept academy HUBu není pojat jako obvyklý prostor pro pořádání školení a seminářů, ale jako místo pro příjemné setkávání a trávení času. Inspirace byla hledána v kavárnách a HUBech po celém světě, což se odráží v přívětivé atmosféře s vlastní duší. Prostor je plně vybaven rychlým internetem, klimatizací, flipcharty, projekční technikou a možností cateringu. K dispozici je také pobočka v Karlových Varech. academy HUB odráží pulzující energii dynamického prostředí a vytváří inspirativní moderní zázemí s přívětivou atmosférou. Školicí místnosti jsou dostupné jako pronájem na hodiny (2 600 - 3 000 Kč/h) nebo na celý den (13 000 - 15 000 Kč/den), přičemž poskytují kompletní zázemí pro vaše akce v srdci Karlína.'
  },
  {
    id: 'cmg9fwdra013jntu76t0mng2e',
    slug: 'hotel-amarilis_jednaci-sal-cicero',
    description: 'Jednací sál Cicero je konferenční prostor v 4-hvězdičkovém boutikovém Hotelu Amarilis v Praze 1 v blízkosti Václavského náměstí s kapacitou až 56 osob ve stoje. Hotel Amarilis Prague se nachází v pulzujícím centru Prahy a je ideální základnou pro cestující za odpočinkem i obchodní hosty. Hotel nabízí 67 prostorných a komfortně zařízených pokojů, z nichž mnohé disponují balkonem, velkorysou terasou nebo obrovskými okny plnými denního světla. Pro firemní klienty jsou k dispozici rozsáhlé konferenční prostory s perfektním servisem pro všechny druhy akcí. Recepce je dostupná 24/7 pro asistenci. Bohaté a zdravé snídaně jsou denně pečlivě připravovány našimi šéfkuchaři. K dispozici je privátní wellness centrum s vířivkou, parní lázní, saunou a masážemi. Velká střešní veřejná terasa na 7. patře nabízí úžasný výhled na Prahu a je nekuřáckou zónou. Jednací sál Cicero je vybaven WiFi, klimatizací, cateringem a barem. Díky výhodné poloze jsou top-rated turistické atrakce, restaurace a nákupní centra v docházkové vzdálenosti, stejně jako veřejná doprava. Ideální prostor pro konference, školení a firemní setkání v centru Prahy.'
  },
  {
    id: 'cmg9f4g3a003tntu76eevlmj1',
    slug: 'the-factory-loft-prague',
    description: 'The Factory Loft Prague je plně vybavený apartmán pro nekonvenční setkání a akce v Praze 3 - Žižkově s kapacitou až 10 osob ve stoje. Tento moderní loftový prostor nabízí jedinečnou atmosféru industriálního designu spojeného s komfortním vybavením, ideální pro menší týmové schůzky, kreativní workshopy, focení nebo soukromé akce. K dispozici je bezplatné WiFi připojení, parkování a plně vybavený bar. Prostor je navržen s důrazem na flexibilitu a kreativitu, což z něj činí perfektní volbu pro startupy, kreativní agentury, fotografy a filmové produkce, které hledají autentické prostředí s charakterem. The Factory Loft Prague se vyznačuje vysokými stropy, velkými okny a otevřeným půdorysem, který lze snadno přizpůsobit různým typům akcí. Díky komorní velikosti a intimní atmosféře je ideální pro brainstormingy, prezentace nových produktů, focení nebo jednoduše jako unikátní místo pro setkání s klienty nebo obchodními partnery. Lokalita v Žižkově poskytuje skvělou dostupnost a zároveň zachovává atmosféru alternativního pražského čtvrti, která přitahuje kreativní komunitu.'
  },
  {
    id: 'cmg9f45va003hntu78k1jeoqk',
    slug: 'zero-latency-prague',
    description: 'Zero Latency Prague je inovativní prostor pro teambuildingové aktivity v Praze 7 - Holešovicích s kapacitou až 150 osob ve stoje, kde nudné teambuildingové aktivity, na které se chodí jen „aby se neřeklo", nemají šanci. Tento jedinečný zábavní koncept nabízí free-roam virtual reality zážitky, které revolucionalizují způsob, jakým týmy tráví čas společně. Účastníci se pohybují ve virtuálním prostoru bez kabelů a omezení, což vytváří zcela nový level teambuilding aktivit plných adrenalinu, spolupráce a zábavy. K dispozici je WiFi připojení a bar pro občerstvení po akci. Zero Latency je ideální pro firemní teambuildingy, oslavy, Bachelor/Bachelorette parties nebo jednoduše jako netradiční aktivita pro skupiny přátel. Prostor umožňuje vytvořit nezapomenutelný zážitek, který kombinuje moderní technologii s fyzickou aktivitou a týmovou spoluprací. Díky kapacitě až 150 osob je možné organizovat i větší firemní akce s rotací skupin. Zero Latency Prague prokazuje, že teambuilding může být vzrušující, zábavný a skutečně zapojující zážitek, na který se všichni těší a rádi se vrací.'
  },
  {
    id: 'cmg9fbrom00d5ntu77syzl51a',
    slug: 'action-park',
    description: 'Action Park je venkovní zábavní areál v Praze 2 - Vinohradech s kapacitou až 1000 osob ve stoje, ideální pro soukromé akce a teambuildingy. Areál nabízí širokou škálu aktivit včetně fotbalových šipek (kopání nebo házení na obří šipkový terč), bodyzorbingu (narážení do sebe a fotbal jako jste ho ještě nezažili), lidského stolního fotbalu (staňte se figurkami v nejzábavnějším stolním fotbale), gigantického beer pongu s pivem v ceně, vodní války (jedinečný letní zážitek), basket & golf connectu, lukohry (střelba lukem a středověké zbraně), venkovního paintballu na hřišti s věžemi, bunkry, pevností a kostelem (100 kuliček/os.), hodu sekerou (šipky v hrubším kabátu), Football Mania (balíček fotbalových aktivit), Blow Footballu (využijte kapacitu svých plic naplno) a pivní olympiády (čtyři disciplíny, které na klasické olympiádě chyběly). Většina aktivit je krytá, což umožňuje pořádání akcí i za nepříznivého počasí. K dispozici je WiFi, parkování a bar s občerstvením. Action Park je perfektní volbou pro firemní teambuildingy, narozeninové oslavy, Bachelor parties nebo jakoukoliv akci, kde hledáte zábavu, aktivní sport a nezapomenutelné zážitky pro velké skupiny.'
  },
  {
    id: 'cmg9fu4j1010jntu79apg52au',
    slug: 'mama-shelter-prague_atelier-2',
    description: 'Atelier 2 v Mama Shelter Prague je tvůrčí obchodní prostor v Praze 1 - Starém Městě s kapacitou až 60 osob ve stoje – ideální místo pro vytváření myšlenek a kreativní spolupráci. Mama Shelter Prague se nachází pouhých pět minut tramvají od Starého Města a nabízí 238 pokojů navržených Jalilem Amorem, které jsou stejně komfortní jako chytré. Hotel disponuje šesti Ateliéry (meeting rooms), sdíleným break-out prostorem s kulečníkovými stoly a stolním fotbalem a veškerou technologií, kterou potřebujete. Mama ví, že někdy cestujete za prací a někdy pracujete, abyste mohli cestovat – a má řešení pro obojí. Každý, od pracovitých podnikatelů po uvolněné univerzitní studenty, se zde schází k jídlu, pití a oslavám. Restaurant nabízí domácí jídla u velkých společných stolů, signature koktejly v baru a pokud svítí slunce, můžete relaxovat na terase s úžasným výhledem na Prahu z desátého patra. K dispozici je WiFi a terasa. Každý čtvrtek, pátek a sobotu je živý DJ set od 20:00 do půlnoci. Atelier 2 je perfektní pro prezentace, workshopy, týmové sprinty a kreativní setkání v jedinečné atmosféře Mama Shelter.'
  },
  {
    id: 'cmg9f68ll0061ntu7uww1nmn1',
    slug: 'krizikovy-pavilony',
    description: 'Křižíkovy pavilony jsou historické výstavní prostory na Výstavišti Praha v Praze 7 - Holešovicích s kapacitou až 1500 osob ve stoje, které skýtají ideální prostory pro firemní akce, reprezentativní a výstavní události všeho druhu. Pavilony se nacházejí na Výstavišti Holešovice, které je dostupné tramvají (od 1. října 2025 je obnovené tramvajové spojení), pěšky ze Strossmayerova náměstí nebo od Nádraží Holešovice. Parkování je možné mimo areál Výstaviště Praha v OC Stromovka nebo A-Z parking Argentinská (parkovací místa v areálu jsou velmi omezená). K dispozici je WiFi, parkování a bar. Křižíkovy pavilony nabízejí variabilní prostory s historickou architekturou ideální pro konference, veletrhy, výstavy, firemní akce, produktové prezentace, gala večery a další společenské události. Díky velkorysým prostorám a profesionálnímu zázemí je možné realizovat akce různého charakteru a velikosti. Výstaviště Praha je ikonickou lokalitou s dlouhou historií a poskytuje jedinečnou atmosféru pro vaše akce v kombinaci s moderním technickým vybavením a servisem. Ideální volba pro velké akce vyžadující reprezentativní prostory v Praze.'
  },
  {
    id: 'cmg9fe1d000fxntu7bxm05eeb',
    slug: 'just-home-srobarova',
    description: 'JUST-HOME Šrobárova je příjemný kreativní prostor pro setkávání lidí, školení, meetingy a komunitní vzdělávání v Praze 1 - Novém Městě s kapacitou až 50 osob ve stoje. Školící centrum se skládá ze dvou místností - Open space (kapacita 45 osob divadelně, 26 osob do U, 30 osob školní uspořádání) a Meeting space (kapacita 18 osob divadelně, 15 osob do U, 16 osob školní uspořádání). Obě místnosti mají vlastní vybavení, kuchyňku, vchod, sociální zázemí a jsou mezi nimi odhlučněné uzamykatelné dveře. Je na vás, zda-li obsáhnete celé centrum nebo využijete jen jeden z prostorů. Jedinečně řešený otevřený prostor s netradiční dispozicí umožňuje využít každou minutu naplno, pohybovat se, tvořit, relaxovat, komunikovat, prostě „být". Prostor má velkoryse řešené zázemí včetně relaxační zóny, posezení u kávy nebo společného vaření. V ceně je zahrnut flipchart, projektor s Full HD obrazem, plátno 200×180 cm, whiteboard, ozvučení s mikrofonem, Wi-Fi s optickým kabelem 2000/1000Mbps, voda pro účastníky, úklid, papíry, fixy a podpora personálu. Dostupnost: tramvají na zastávku Olšanské hřbitovy nebo metrem na zastávku Flora. V okolí je velký výběr restaurací (česká, vietnamská, italská kuchyně) s možností objednání denního menu a platby kartou přes centrum. JUST-HOME je ideální pro workshopy, prezentace, týmové meetingy a vzdělávací akce v příjemném prostředí.'
  },
  {
    id: 'cmg9f6vd2006vntu73ywbzxcs',
    slug: 'next-zone',
    description: 'Next Zone je moderní konferenční sál v Praze 2 - Vinohradech s kapacitou až 100 osob ve stoje, vybavený profesionální technikou a spravovaný talentovanými studenty SSPŠ na Smíchově. Tento unikátní prostor kombinuje špičkové technické vybavení s přístupem mladých odborníků, kteří zajišťují provoz a technickou podporu během akcí. K dispozici je bezplatné WiFi připojení a kompletní audiovizuální technika včetně projekce, ozvučení a prezentačních systémů. Next Zone je ideální pro konference, školení, workshopy, prezentace, firemní meetingy a vzdělávací akce, kde je klíčové kvalitní technické zázemí. Prostor nabízí flexibilní uspořádání, které lze přizpůsobit různým typům akcí od formálních prezentací po interaktivní workshopy. Díky spolupráci se studenty střední průmyslové školy získáváte nejen profesionální prostor, ale také podporu mladých technických talentů, kteří jsou obeznámeni s nejnovějšími technologiemi a trendy. Next Zone je skvělou volbou pro organizace, které hledají moderní konferenční prostor s technickým zázemím za rozumnou cenu v dobré dostupnosti v Praze 2. Ideální pro tech konference, startup meetupy a vzdělávací programy.'
  },
  {
    id: 'cmg9f6tpb006tntu789bzkee6',
    slug: 'spolupracovna-vokovice',
    description: 'Spolupracovna Vokovice je víceúčelový pracovní a eventový prostor v Praze 2 - Vinohradech s kapacitou až 20 osob ve stoje, ideální pro týmová setkání, workshopy, menší konference a komunitní akce. Tento komorní prostor nabízí příjemné prostředí pro spolupráci, kreativní práci a networking v uvolněné atmosféře. K dispozici je bezplatné WiFi připojení a plně vybavená kuchyň, která umožňuje přípravu občerstvení přímo na místě nebo organizaci kulinářských workshopů. Spolupracovna je navržena s důrazem na flexibilitu a komunitní charakter, což z ní činí ideální místo pro menší týmy, freelancery, startupy a neziskové organizace. Prostor lze využít pro pravidelné týmové schůzky, brainstormingy, prezentace, coworkingové setkání nebo jednoduše jako alternativu k domácí kanceláři či kavárně. Díky komorní velikosti vzniká intimní atmosféra podporující osobní interakce a produktivní spolupráci. Spolupracovna Vokovice je skvělou volbou pro ty, kteří hledají neformální prostor s rodinnou atmosférou a kompletním zázemím v Praze 2. Ideální pro malé týmy, které oceňují osobní přístup a komunitu podobně smýšlejících profesionálů.'
  },
  {
    id: 'd142f3ba-2b7f-4b90-ac03-4d3927f2190d',
    slug: 'alma-prague',
    description: 'Alma Prague je multifunkční prostor na adrese Široká 15 v Praze 1 – Josefově spojující restauraci, bar a eventové zázemí v historickém srdci města. Prostor nabízí moderní gastronomii s mezinárodními vlivy, originální koktejlové menu a stylový interiér, který vytváří příjemnou atmosféru pro různé typy akcí. Součástí je také galerie, která přidává kulturní rozměr tomuto unikátnímu prostoru. Alma Prague je ideální volbou pro firemní večírky, produktové prezentace, vernisáže, soukromé oslavy a networking events, kde hledáte kombinaci kvalitní gastronomie, koktejlů a stylového prostředí v centru Prahy. K dispozici je plně vybavený bar a galerie pro umělecké výstavy nebo prezentace. Prostor se nachází v prestižní lokalitě Josefova, historické Židovské čtvrti, která je součástí seznamu světového dědictví UNESCO a nabízí unikátní atmosféru pro vaše akce. Alma Prague kombinuje historický charakter lokality s moderním designem a kreativním přístupem ke gastro nomii a událostem. Ideální pro náročné klienty, kteří hledají autentický zážitek v srdci Prahy s důrazem na kvalitu jídla, nápojů a celkové atmosféry akce.'
  },
  {
    id: 'cmg9ffo5h00i1ntu7zcwxvc9u',
    slug: 'animika',
    description: 'Animika Meeting Studio je útulný a plně vybavený prostor pro školení, workshopy a firemní meetingy v Praze 5 - Smíchov (srdce Karlína) s kapacitou až 44 osob ve stoje. Prostor poskytuje klid, světlo a soukromí v klidném vnitrobloku se spoustou denního světla a atmosférou jako v obýváku – více než jen zasedací místnost, ale místo, kde se chcete zdržet a kde vznikají ta nejlepší rozhodnutí i nápady. Animika je určena výhradně pro váš tým bez sdílení a bez rozptýlení s maximálním soukromím. Kapacita: 30 osob do U, 30 školní uspořádání, 50 divadelní. K dispozici jsou 3 časové sloty od 8:00 do 22:00, venkovní terasa, kuchyňka a hlavní místnost. Prostor je vybaven Full HD projektorem, kvalitním ozvučením, samostatným velkým LCD displayem, vysokorychlostním internetem, tiskárnou, flipcharty, whiteboardem a pinboardem. Domácký catering je připravený s láskou a chutí – čerstvé, vymazlené a podávané jako u přátel doma, vhodné pro celodenní meeting i krátké školení. Lokalizace v Karlíně je ideální – pohodlně dostupná, ale klidná, v okolí kavárny, parky, bistra a přitom jen pár minut od vaší kanceláře. Rezervace prostoru: půldenní blok 590 Kč/hod bez DPH, celodenní 8-17h za 4 290 Kč, večerní blok 18-22h za 1 290 Kč. Animika je perfektní pro týmy, které chtějí být spolu a přitom mít klid na práci v prostředí, které podporuje kreativitu a spolupráci.'
  },
  {
    id: 'cmg9fiqow00m1ntu7xypo4rjq',
    slug: 'stara-cistirna_sal-kalovych-cerpadel',
    description: 'Sál kalových čerpadel je výrazný industriální prostor v unikátních prostorách Staré čistírny odpadních vod v Praze 2 - Novém Městě s kapacitou až 100 osob ve stoje. Tento autentický loftový prostor zachovává původní industriální charakter historické čistírny a nabízí jedinečnou atmosféru pro akce, které hledají netradiční prostředí s výrazným vizuálním dopadem. Sál je ideální pro produktové prezentace, vernisáže, módní přehlídky, filmové nebo fotografické produkce, firemní večírky, kulturní akce a další události, kde je klíčový výjimečný prostor s charakterem. K dispozici je bar pro občerstvení hostů. Stará čistírna odpadních vod je ikonická industriální lokalita v Praze, která byla revitalizována a slouží jako kulturní a eventový prostor zachovávající svůj původní ráz. Vysoké stropy, původní technologické prvky a surový industriální design vytváří atmosféru, která je ideální pro kreativní projekty a akce vyžadující vizuálně zajímavé prostředí. Sál kalových čerpadel je perfektní volbou pro ty, kteří hledají autentický industriální prostor s historií v Praze, kde spojení minulosti a současnosti vytváří nezapomenutelnou atmosféru pro vaše akce.'
  },
  {
    id: 'cmg9f4n1u0043ntu77fzgsh7q',
    slug: 'hotel-buchlov',
    description: 'Hotel Buchlov je konferenční a svatební zázemí v podhradí s kapacitou až 250 osob ve stoje, které nabízí kompletní služby pro firemní akce, konference, školení a svatby. Ačkoliv se nachází mimo Prahu (adresa uvádí Jižní Moravu), hotel poskytuje ideální prostředí pro vícedenní firemní akce, výjezdní zasedání nebo svatební oslavy s možností ubytování hostů. K dispozici je WiFi, parkování, projektor, catering, plně vybavený bar a terasa s výhledem na okolní krajinu. Hotel Buchlov kombinuje konferenční zázemí s rekreačním prostředím, což z něj činí perfektní volbu pro akce, kde chcete spojit práci s odpočinkem. Prostor je vhodný pro konference, školení, teambuildingové programy, výjezdní zasedání vedení firem, svatby a rodinné oslavy. Poloha v podhradí poskytuje inspirativní prostředí s historickou atmosférou a přírodním zázemím. Hotel nabízí kompletní servis včetně ubytování, stravování, technického vybavení a organizační podpory pro vaše akce. Ideální pro organizace, které hledají klidné místo mimo ruch města pro soustředěnou práci nebo nezapomenutelné svatební oslavy v romantickém prostředí hradu a přírody.'
  },
  {
    id: 'cmg9fx5qy014jntu72f4om5bw',
    slug: 'lobkowiczky-palac_balkonovy-sal',
    description: 'Balkonový sál je malebný sál v Lobkowiczkém paláci na Pražském hradě v Praze 1 - Malé Straně s kapacitou až 130 osob ve stoje, který nabízí jedinečný panoramatický výhled na Prahu. Lobkowiczký palác je elegantní palác z 16. století, který umožňuje pořádání akcí v jedenácti překrásných historických sálech s panoramatickým výhledem umocňujícím jedinečné zážitky. Palác je součástí rodiny Lobkowicz, která sdílí minulost a tvoří budoucnost, a nabízí nejen eventové prostory, ale také muzeum, koncerty klasické hudby, kavárnu a prodejní galerii. Balkonový sál je ideální pro firemní akce, produktové prezentace, gala večery, koncerty klasické hudby, svatby, vernisáže a další reprezentativní události, kde je klíčová historická atmosféra a výjimečný výhled. K dispozici je bar a kompletní servis. Lobkowiczký palác se nachází přímo na Pražském hradě, což z něj činí jednu z nejprestižnějších adres v Praze pro pořádání akcí. Rodina Lobkowicz spravuje také další památky včetně zámku Nelahozeves, zámku Roudnice, hradu Střekov a vinařství, což poskytuje možnosti pro různé typy akcí. Balkonový sál je perfektní volbou pro ty, kteří hledají historické prostředí nejvyšší úrovně s nezapomenutelným výhledem na Zlaté město Prahu.'
  }
]

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  console.log('🚀 Updating Enhanced Venue Descriptions (Batch 2)')
  console.log('='.repeat(60))
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE UPDATE'}`)
  console.log(`Total venues to update: ${enhancedDescriptions.length}`)
  console.log('='.repeat(60) + '\n')

  let successCount = 0
  let errorCount = 0

  for (const venue of enhancedDescriptions) {
    try {
      console.log(`📍 ${venue.slug}`)
      console.log(`   New length: ${venue.description.length} characters`)

      if (!dryRun) {
        await prisma.venue.update({
          where: { id: venue.id },
          data: { description: venue.description }
        })
        console.log(`   ✅ Updated in database`)
      } else {
        console.log(`   🔍 DRY RUN - would update`)
      }

      successCount++
    } catch (error) {
      console.error(`   ❌ Error updating venue: ${error}`)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully processed: ${successCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes made)' : 'LIVE UPDATE'}`)
  console.log('='.repeat(60))

  await prisma.$disconnect()
}

main().catch(console.error)
