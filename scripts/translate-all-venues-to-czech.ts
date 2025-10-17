import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

// All 57 venues with accurate Czech translations
const venueTranslations: Record<string, string> = {
  // Already translated - keep for reference (5 venues)
  'alforno-pizza-pasta': 'Alforno Pizza & Pasta spojuje historický šarm s autentickou italskou kuchyní v budově z roku 1412. Oddaný kulinářský tým připravuje tradiční pokrmy z různých italských regionů s použitím čerstvých sezónních surovin, domácích těstovin a autentické pizzy v římském stylu. S kapacitou 84 hostů na několika podlažích a zahradním prostorem tato restaurace nabízí vřelou, příjemnou atmosféru ideální pro soukromé večeře, oslavy a firemní akce hledající autentickou chuť Itálie v historickém centru Prahy.',

  'dancing-house-hotel': 'Ikonický Dancing House Hotel nabízí stylové konferenční prostory s moderním vybavením, poskytující výjimečné zázemí pro obchodní jednání, semináře a firemní akce. Tento architektonicky proslulý prostor disponuje několika konferenčními místnostmi s jedinečným panoramatickým výhledem a flexibilním uspořádáním míst s kapacitou až 120 hostů. Kombinace výrazného designu budovy, bezbariérového přístupu a komplexního technického vybavení vytváří působivé prostředí pro akce, které mají zanechat trvalý dojem.',

  'hong-kong-karlin': 'Moderní asijská restaurace nabízející prémiovou kantonskou fusion kuchyni v pulzující pražské čtvrti Karlín. Proslulá svou charakteristickou pekingskou kachnou, výběrem dim sum a stylovým interiérem, je ideální pro skupinové stolování a obchodní obědy.',

  'pop-up-bar': 'Pop Up Bar je moderní koktejlový prostor v srdci Prahy (Na Příkopě 3). Přes den je to útulná kavárna a v noci se proměňuje v živý bar s klubovou energií. Perfektní pro after-work setkání, soukromé večírky a firemní akce.',

  'u-malvaze': 'Okouzlující česká restaurace jen pár kroků od Karlova mostu, servírující tradiční vydatné pokrmy a denní snídaně v útulném historickém prostředí.',

  // New translations for remaining 52 venues
  'action-park': 'Action Park je venkovní zábavní areál v Praze ideální pro soukromé akce a teambuildingy. Nabízí adrenalinové aktivity, prostorné venkovní plochy a flexibilní zázemí pro firemní akce a oslavy.',

  'bar-behind-the-curtain': 'Bar Behind the Curtain je vintage koktejlový a kulturní bar na Žižkově s unikátní atmosférou. Ideální místo pro soukromé večírky, kulturní akce a intimní setkání v autentickém prostředí.',

  'brix-bar-and-hostel': 'Brix Bar and Hostel je bar a hostel eklektické komunity cestovatelů, umělců a snílků ideální pro netradiční a komunitní akce. Nabízí jedinečnou atmosféru a otevřené prostředí pro kreativní setkání.',

  'corso-revnice': 'Corso Řevnice je multifunkční prostor nabízející hotelové ubytování, restauraci a konferenční zázemí. Ideální pro firemní akce, teambuildingy, svatby a konference v klidném prostředí mimo Prahu s možností venkovních i vnitřních aktivit.',

  'dinosauria': 'Dinosauria Museum Prague je muzeum, kde dinosauři ožívají. Jedinečný prostor pro firemní teambuildingy, rodinné akce, narozeninové oslavy a netradiční eventy s technologickým zázemím a zážitkovou atmosférou.',

  'hotel-emblem_drawing-room': 'Drawing Room v The Emblem Hotel je výjimečný prostor v koloniálním stylu ideální pro důvěrná obchodní jednání, menší oslavy a komorní setkání v luxusním prostředí.',

  'dvur-hoffmeister': 'Dvůr Hoffmeister je rustikální statek ideální pro svatby, teambuildingy, jednání a offsite večírky. Nabízí autentické venkovské prostředí s moderním zázemím pro firemní a soukromé akce.',

  'majaland-praha-firemni-akce': 'Originální teambuilding nebo zábava pro zaměstnance a jejich děti v pohádkovém světě včelky Máji na ploše 13 000 m². Park nabízí divadelní prostor pro workshopy a prezentace, restauraci a parkování až pro 2 400 vozů. Maximální kapacita 2 000 osob s kompletním technickým vybavením, klimatizací, Wi-Fi a bezbariérovým přístupem pro firemní dny nebo teambuilding.',

  'hotel-emblem_games-room': 'Games Room v The Emblem Hotel je menší místnost ideální pro neformální setkání, herní večery a komorní teambuildingy v uvolněné atmosféře.',

  'chateau-st-havel-golf': 'Golfový driving range AQUA s 17 odpališti (6 krytých), putting green o rozloze 700 m² a chipping green s pískovým bunkerem pro akce až 200 osob. Ideální prostor pro teambuildingy, golfové turnaje nebo firemní akce s možností využití profesionálních golfových trenérů. K dispozici je parkování a možnost kombinace s dalšími prostory zámku včetně restaurace nebo venkovního stanu.',

  'hororovy-dum-v-centru-prahy': 'Hororový dům v centru Prahy nabízí nezapomenutelný zážitkový teambuilding v tématických hororových prostorech. Ideální pro odvážné týmy hledající netradiční adrenalinovou aktivitu.',

  'ice-arena-katerinky': 'Moderní multifunkční areál se špičkovými ledovými plochami pro firemní akce, teambuildingy, sportovní turnaje, rodinné oslavy a společenské události. Nabízí restauraci, bar a kompletní zázemí.',

  'ice-arena-letnany': 'Moderní víceúčelový areál s hokejovými halami ideální pro firemní akce, sportovní teambuildingy, turnaje, rodinné oslavy a společenské události. Nabízí restauraci, bar a profesionální zázemí.',

  'kaunicky-palac': 'Pronájem překrásných historických prostor v centru Prahy ideální pro galavečeře, recepce, firemní akce, svatby, konference a diplomatická setkání. Reprezentativní prostředí s historickou atmosférou.',

  'the-italians_kavarna': 'Kavárna v The Italians je ideální místo pro menší rodinné a firemní oslavy, snídaně a meetingy v příjemné italské atmosféře s kvalitní kávou a občerstvením.',

  'radlicka-kulturni-sportovna_komunitni-zahrada-a-sklenik': 'Komunitní zahrada a skleník v Radlické Kulturní Sportovně je ideální prostor pro uspořádání teambuildingu nebo kreativního workshopu v zeleni s možností venkovních aktivit.',

  'the-italians_konirna': 'Konírna v The Italians je unikátní rustikální prostor ideální pro firemní akce, workshopy a oslavy. Autentické prostředí s italským šarmem pro nezapomenutelné akce.',

  'kulinarni-studio-mafra': 'Špičkové kulinární studio s profesionálním vybavením a zázemím pro různorodé akce a teambuildingy. Ideální pro kulinářské workshopy, degustace vín, firemní akce a kreativní setkání.',

  'oaks-prague_la-bottega-oaks-deli-bistro': 'La Bottega Oaks Deli Bistro je prémiové italské bistro na náměstí v srdci OAKS Prague s unikátním interiérem Chapman and Taylor. Ideální pro obchodní obědy, snídaně a menší firemní akce.',

  'majaland-praha': 'Majaland Praha je zábavní park s pohádkovým světem včelky Máji nabízející venkovní i vnitřní prostory pro rodinné akce, teambuildingy, firemní dny a oslavy s kompletním zázemím a cateringem.',

  'muzeum-slivovice-r-jelinek': 'Reprezentativní prostory pro firemní akce ve stylovém muzeu v centru Prahy. Ideální pro degustace, teambuildingy, workshopy, konference a diplomatická setkání v historické atmosféře.',

  'dinosauria_noc-v-muzeu': 'Noc v muzeu v Dinosauria Museum Prague je výjimečná zážitková akce pro dětské skupiny i jako netradiční teambuilding. Nezapomenutelný noční zážitek mezi dinosaury.',

  'oaks-prague': 'OAKS Prague nabízí špičkový golfový zážitek s obchodními partnery v moderním areálu s restaurací, konferenčním zázemím a venkovními prostory pro teambuildingy a firemní akce.',

  'party-boxy-v-o2-arene-hc-sparta-praha': 'Sledujte zápasy legendárního klubu HC Sparta Praha ve společnosti obchodních partnerů v exkluzivních party boxech v O2 areně. Ideální pro firemní události a business networking.',

  'pilsner-urquell-the-original-beer-experience': 'Pilsner Urquell: The Original Beer Experience zabírá historický palác na Václavském náměstí a nabízí reprezentativní prostory provoněné plzeňským ležákem. Eventové patro propojuje několik samostatných barů a sálů – od komorního Hladinka baru přes secesní Brewers\' Bar a Pilsner Hall až po dvoupodlažní Beer Hall s velkým pódiem. Hosté mají k dispozici prémiový catering, školu čepování s pivními sommeliéry, moderní AV techniku i možnost doplnit akci o prohlídku multimediální expozice.',

  'pivnice-polepsovna': 'Craftová pivnice v srdci Holešovic spojuje pivo z lokálních minipivovarů a moderní českou kuchyni. Ideální pro neformální firemní akce, teambuildingy a komunitní setkání v industriálním prostředí.',

  'prague-city-golf-rohan': 'Tréninkový golfový areál k pronájmu pro akce na Rohanském ostrově. Ideální pro golfové teambuildingy, turnaje, rodinné akce a sportovní události v centru Prahy.',

  'prague-city-golf-zbraslav': 'Rozlehlý areál a cateringové zázemí vybavené pro všechny typy firemních akcí. Ideální pro golfové teambuildingy, svatby, konference, workshopy a offsite akce s ubytováním a restaurací.',

  'rainbows-end-cafe-and-art-garden': 'Rainbow\'s End Cafe and Art Garden je magická kreativní oáza u Karlova mostu ideální pro menší kulturní akce, výstavy, workshopy a intimní setkání v umělecké atmosféře.',

  'restaurace-gutovka': 'Restaurace & areál Gutovka spojuje moderní rodinnou restauraci s venkovními terasami uprostřed známého sportoviště ve Strašnicích. Uvnitř najdete prostornou jídelnu, galerii i vyhlídkovou věž, venku pak krytou zahrádku, gril zónu a oddělené bary, které zvládnou pohodlně obsloužit několik set hostů najednou. Tým zajišťuje kompletní catering, dorty i animační programy a v okolí lze využít hřiště, lezeckou stěnu nebo minigolf pro teambuilding.',

  'restaurace-gutovka-areal-gutovka_restaurace': 'Restaurace Gutovka nabízí moderní zázemí a profesionální služby pro firemní večírek, teambuilding i oslavu dětí či dospělých. Prostorná jídelna s kapacitou pro stovky hostů a flexibilní cateringové služby.',

  'revolution-train': 'Revolution Train je mobilní interaktivní výstava v upravených vlakových vagónech zaměřená na prevenci závislostí. Unikátní prostor pro firemní workshopy, školení a komunitní akce v industriálním prostředí.',

  'restaurace-gutovka-areal-gutovka_teambuilding': 'Uspořádejte váš teambuilding v Gutovce na Praze 10 s možností využití venkovních sportovišť, lezecké stěny, minigolfu a profesionálního cateringového zázemí pro nezapomenutelnou firemní akci.',

  'dinosauria_teambuilding-ve-virtualni-realite': 'Teambuilding ve virtuální realitě v Dinosauria Museum Prague je netradiční teambuilding nabitý adrenalinem. Moderní VR technologie pro nezapomenutelný týmový zážitek.',

  'the-apartment': 'The Apartment je nový prostor pro eventy, krásu, art, design a módu v Praze. Stylový loft ideální pro módní přehlídky, výstavy, workshopy, prezentace a kreativní akce.',

  'the-design': 'THE DESIGN je unikátní prostor v přízemí a suterénu bývalé lékárny ideální pro menší kulturní akce, výstavy, workshopy, prezentace a intimní firemní setkání v designovém prostředí.',

  'hotel-emblem': 'The Emblem Hotel nabízí naprostý klid v samém centru Prahy s luxusními konferenčními prostory, restaurací a ubytováním pro firemní akce, svatby a diplomatická setkání.',

  'the-factory-loft-prague': 'The Factory Loft Prague je plně vybavený apartmán pro nekonvenční setkání a akce. Industriální prostor ideální pro workshopy, prezentace, teambuildingy a kreativní projekty.',

  'the-flow-terrace': 'The Flow Building nabízí exkluzivní střešní kavárnu s terasou s panoramatickým výhledem na Prahu a Pražský hrad. Ideální pro firemní akce, prezentace, networking a VIP setkání.',

  'the-italians': 'The Italians je prostor, kde je vše dobré a italské. Originální prostory pro soukromé i firemní akce s jedinečnou italskou atmosférou, restaurací a několika samostatnými sály.',

  'hotel-emblem_m-lounge': 'The M Lounge v The Emblem Hotel je „obývací prostor" pro důležitá setkání a offsity. Stylový prostor ideální pro workshopy, strategie a komorní firemní akce.',

  'the-monkey-bar-prague': 'The Monkey Bar Prague je stylový a sofistikovaný bar s butikovým šarmem a skvělou atmosférou. Ideální pro firemní večírky, koktejlové akce a VIP setkání.',

  'falkensteiner-hotel-prague_the-monkey-bar-prague-1': 'The Monkey Bar Prague ve Falkensteiner Hotel Prague je stylový a sofistikovaný bar s butikovým šarmem a skvělou atmosférou pro firemní večírky a VIP akce.',

  'fleksi-filadelfie_the-nest': 'The Nest v FLEKSI Filadelfie je elegantní zasedací a konferenční prostor v ikonické budově Filadelfie na pražské Brumlovce. Moderní vybavení pro workshopy, školení a firemní jednání.',

  'the-pop-up': 'THE POP UP! je jedinečný prostor pro večírky a neformální akce, který spojuje kreativní prostředí s nezapomenutelnými zážitky. Ideální pro soukromé oslavy a firemní teambuildingy.',

  'hotel-emblem_the-salon': 'The Salon v The Emblem Hotel je stylový salon s komorní atmosférou ideální pro důvěrná setkání, menší oslavy a obchodní jednání v luxusním prostředí.',

  'vila-tusculum': 'Vila Tusculum je vila s vlastním parkem v historickém areálu vhodná pro denní eventy, firemní gatheringy, teambuildingy a svatby v přírodním prostředí s elegantním zázemím.',

  'the-italians_vinoteka': 'Vinotéka v The Italians nabízí útulné prostředí pro privátní oslavy, degustace vín a intimní setkání s italskými víny a gastronomií.',

  'chateau-st-havel-wellness': 'Privátní wellness zóna v Chateau St. Havel s privátní saunou, vířivkou, ochlazovacím bazénem a relaxační zónou pro maximálně 10 osob. K dispozici jsou masážní služby, aromaterapie a relaxační hudba v klidném prostředí historického zámku. Ideální volba pro menší relaxační programy, teambuildingy nebo jako doplněk konferenčních pobytů.',

  'zazitkove-vlaky': 'Zážitkové vlaky nabízejí historické i moderní vlaky s neotřelým prostředím pro firemní akce, oslavy, roadshow a prezentace. Jedinečný mobilní prostor pro nezapomenutelné akce.',

  'zero-latency-prague': 'Zero Latency Prague je prostor pro VR teambuildingy, kde nudné teambuildingové aktivity nemají šanci. Adrenalinové týmové zážitky ve virtuální realitě pro firemní akce.',

  'the-italians_zimni-zahrada': 'Zimní zahrada v The Italians je prosklená veranda s cihlovým zdivem ideální pro komorní setkání a oslavy v příjemném prostředí s italskou kuchyní.',
};

async function translateVenues() {
  console.log('🔄 Starting venue translation to Czech...\n');

  let successCount = 0;
  let errorCount = 0;
  const failedSlugs: string[] = [];

  for (const [slug, czechDescription] of Object.entries(venueTranslations)) {
    try {
      await prisma.venue.update({
        where: { slug },
        data: { description: czechDescription }
      });
      console.log(`✅ ${slug}`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${slug}`);
      failedSlugs.push(slug);
      errorCount++;
    }
  }

  console.log(`\n📊 Translation Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📝 Total: ${Object.keys(venueTranslations).length}`);

  if (failedSlugs.length > 0) {
    console.log(`\n❌ Failed slugs:`);
    failedSlugs.forEach(slug => console.log(`   - ${slug}`));
  }
}

translateVenues()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
