import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config({ path: '.env.local' })

const prisma = new PrismaClient()

const enhancedDescriptions = [
  {
    id: 'cmg9el49r0007ntgoywuoeivr',
    slug: 'bar-monk-prague',
    description: 'Bar Monk Prague je moderní bar na Malé Straně s elegantním interiérem doplněným barevnými neony a venkovním posezením. Nabízí autorské koktejly, prémiové destiláty a malé občerstvení. Je ideálním místem pro večerní posezení, soukromé oslavy nebo firemní akce. Atmosféra baru kombinuje stylový design s příjemnou a uvolněnou náladou, díky čemuž se stává oblíbenou destinací pro ty, kteří hledají kvalitní mixologické zážitky v historické části Prahy. K dispozici je WiFi připojení, catering a plně vybavený bar. Prostor je vhodný jak pro menší soukromé oslavy, tak pro firemní večírky a teambuildingy, kde můžete relaxovat u kvalitních drinků v příjemném prostředí Malé Strany.'
  },
  {
    id: 'cmg9f7r7d007zntu7dycg10q4',
    slug: 'healthy-longevity-cafe',
    description: 'Healthy Longevity Cafe je jedinečný tematický prostor, kavárna a restaurace s interiérem plným rostlin, který zklidní vaši mysl během náročného dne. Nachází se v Praze 1 a nabízí kapacitu až 120 hostů ve stoje. Tento zelený prostor je ideální pro ty, kteří hledají zdravý životní styl a příjemné prostředí pro setkání, pracovní schůzky nebo relaxaci. Kavárna se zaměřuje na zdravou stravu a wellness, přičemž vytváří oázu klidu uprostřed rušného města. K dispozici je bezplatné WiFi připojení a bar s širokým výběrem nápojů. Prostor je vhodný pro menší soukromé akce, workshopy zaměřené na zdraví a wellness, nebo jednoduše jako místo, kde se můžete zastavit na kvalitní kávu v obklopení zeleně a příjemné atmosféry podporující dlouhověkost a zdravý životní styl.'
  },
  {
    id: 'f8956a49-f079-429c-bdf4-417be2fa8147',
    slug: 'bugsys-bar',
    description: 'Bugsy\'s Bar je jeden z nejznámějších koktejlových barů v Praze, otevřený od roku 1995 a považovaný za pevný bod mixologického vesmíru. Nachází se na prestižní Pařížské ulici v Praze 1 – Starém Městě a nabízí elegantní lounge interiér, prémiové koktejly, široký výběr whisky, rumů a dalších destilátů. Je ideálním místem pro večerní posezení, menší společenské akce nebo privátní degustace. Bar je otevřen pondělí až sobotu od 19:00 do 02:00. Bugsy\'s Bar je známý svými ikonickými drinky, jako je Gimlet, připraveným s precizností a péčí. Tento legendární bar hostil za své dlouhé existence nesčetné hosty hledající autentický koktejlový zážitek v srdci Prahy. Díky své poloze na Pařížské ulici a dlouholeté tradici je Bugsy\'s oblíbenou volbou pro náročné hosty, kteří oceňují kvalitu, styl a atmosféru skutečného koktejlového baru.'
  },
  {
    id: 'cmg9czro40009ntr65pgva8sa',
    slug: 'm1-lounge',
    description: 'M1 Lounge je ikonický klub v centru Starého Města zaměřený na R&B a hip hop, který kombinuje prémiové koktejly, VIP lahvový servis a špičkové DJ vystoupení. Stylový prostor s privátním VIP salonkem hostil hvězdy jako Usher, Machine Gun Kelly, Wiz Khalifa, Xzibit nebo G-Eazy a nabízí exklusivní atmosféru pro náročnou klientelu. Club je otevřen denně až do 4:00 ráno, o víkendech dokonce do 6:00. M1 Lounge nabízí originální koktejly, které nenajdete nikde jinde, a vytváří prémiovou atmosféru pro hosty, kteří hledají špičkový noční zážitek. S kapacitou až 100 hostů ve stoje je ideální pro větší skupiny a VIP zákazníky, kteří chtějí soukromí a výjimečný servis. Pravidelné tematické akce jako Mo Bottles Monday, VIP Hip Hop Tuesday, Champagne Shower Wednesday a Glow Thursday zajišťují, že každá návštěva je jedinečným zážitkem plným skvělé hudby a luxusní atmosféry.'
  },
  {
    id: 'cmg9fxxf7015jntu7il8pzx2m',
    slug: 'hard-rock-cafe-praha_1.patro-lounge',
    description: 'Patro Lounge v Hard Rock Cafe Praha se nachází v srdci staré Prahy méně než 50 metrů od Staroměstského náměstí v ikonické čtyřpodlažní budově V. J. Rott s krásně zdobenou novorenesanční fasádou s barevnými freskami. Hard Rock Cafe Praha je jednou z největších poboček v Evropě a rozprostírá se na ploše 1 900 metrů čtverečních. Prostor zahrnuje tři pulzující bary, Rock Shop a unikátní sbírku memorabilií z proslulé světové kolekce Hard Rock. Unikátním prvkem je kytarový lustr v centru atria široký 5 metrů, který byl vyroben na zakázku speciálně pro pražskou pobočku. Lounge v prvním patře nabízí kapacitu 110 míst k sezení a je ideální pro soukromé oslavy, firemní akce, nebo společenská setkání v jedinečné atmosféře rock\'n\'rollu. K dispozici je WiFi připojení, plně vybavený bar a možnost cateringu. Hard Rock Cafe Praha je otevřeno denně od 11:30 do půlnoci, přičemž nabízí skvělé jídlo, nápoje a nezapomenutelnou atmosféru v historickém centru Prahy.'
  },
  {
    id: 'cmg9f79qk007dntu7h0swe3kc',
    slug: 'pytloun-old-armoury-hotel-prague',
    description: 'Pytloun Old Armoury Hotel Prague je stylový hotel umístěný v budově bývalé zbrojnice v historickém centru Prahy, pouhých 5 minut chůze od Karlova mostu a dalších památek. Nabízí ubytování, restauraci Talíř, Pytloun Sky Bar & Restaurant Prague a unikátní historické prostory vhodné pro pořádání firemních i soukromých akcí s kapacitou až 250 hostů ve stoje. Díky atmosféře spojené s tradicí a historií je oblíbenou volbou pro hosty, kteří hledají autentický zážitek v centru Prahy. Hotel nabízí speciální výhody pro hosty včetně tapas v lobby baru zdarma (14:00-16:00), welcome drinku při příjezdu, 20% slevy na konzumaci v restauraci a 30% slevy do Muzea města Prahy. K dispozici je bezplatné WiFi, parkování a plně vybavený bar. Prostory hotelu jsou ideální pro firemní akce, konference, svatby nebo soukromé oslavy v jedinečném historickém prostředí bývalé zbrojnice, které vytváří nezapomenutelnou atmosféru pro každou událost v srdci Prahy.'
  },
  {
    id: 'cmg9fzdjc017fntu7v19jx4wx',
    slug: 'hlubocepsky-zamecek_kovarna',
    description: 'Kovárna je venkovní prostor s krytým posezením v areálu Folklore Garden s kapacitou až 80 míst ve stoje, který nabízí jedinečnou kombinaci tradiční české atmosféry a moderních eventových služeb. Prostor je součástí komplexu Folklore Garden, který je známý svými tradičními českými folklórními show a kompletním servisem pro vaše akce. Kovárna je ideálním místem pro svatby, firemní akce, teambuildingové programy a rodinné oslavy v příjemném venkovním prostředí s možností parkování. Areál se nachází v Praze 2 a charakterizuje ho jedinečný koncept „srdcem Fancy, duší Industrial", který kombinuje eleganci s industriálním designem. Prostor je vhodný pro menší až středně velké akce, kde můžete relaxovat v příjemném venkovním prostředí s kompletním zázemím včetně cateringu a technického vybavení. Folklore Garden nabízí i další prostory v areálu, díky čemuž můžete vytvořit unikátní akci s různými zónami a programem, včetně možnosti tradiční české folklórní show, která oživí vaši akci autentickým kulturním zážitkem.'
  },
  {
    id: 'cmg9ft2kb00z5ntu7ym77bjzz',
    slug: 'spolecenske-prostory-paspova-salu-v-pivovaru-staropramen_restaurace-potrefena-husa-na-verandach',
    description: 'Restaurace Potrefená husa Na Verandách je tradiční pivovarská restaurace přímo v areálu historického pivovaru Staropramen na pražském Smíchově, založeného v roce 1869. Prostor nabízí kapacitu 181 míst ve stoje a je součástí Návštěvnického centra Staropramen, které můžete pronajmout na soukromé, firemní a další společenské akce až pro 250 hostů. K dispozici je WiFi, parkování, catering, plně vybavený bar a terasa. Restaurace je ideální pro pořádání firemních akcí, teambuildingů, narozeninových oslav a firemních večírků s možností interaktivní prohlídky historického pivovaru, školy čepování piv a řízené degustace s pivním specialistou. Bohatou historií pivovaru vás provede jedna z nejvýznamnějších postav dějin Staropramenu, hlavní sládek Josef Paspa. Prostor je variabilní a nabízí bohatý program včetně audiovizuální prohlídky, degustací a dalších aktivit. Partnerem pro catering je Foodway Catering, který připraví vše od lehkého coffee breaku až po pravý český oběd nebo večeři v podobě rautu či banketu. Unikátní spojení historického prostředí pivovaru s moderním servisem vytváří nezapomenutelnou atmosféru pro každou akci.'
  },
  {
    id: 'cmg9ftotr00zzntu7zw86d4sr',
    slug: 'academic-hotel-congress-centre_l-salonek',
    description: 'L Salonek je jeden z pěti salonků v Academic Hotel & Congress Centre, který se nachází pouhých 7 km od centra Prahy s výbornou dopravní dostupností vlakem i autem. Salonek nabízí kapacitu až 40 míst ve stoje a je ideálním prostorem pro menší konference, školení, workshopy, výjezdní zasedání nebo týmové aktivity. Congress Centre disponuje velkým konferenčním sálem a pěti salonky, díky čemuž je nejlepší volbou pro konference, kongresy, teambuildingové akce, divadelní představení, koncerty nebo vernisáže. K dispozici je bezplatné WiFi, parkování na náměstí nebo v hotelové garáži a bar. Lokalita u cyklostezek a značených turistických tras dělá z hotelu oblíbenou destinaci také pro volnočasové aktivity. Okolí Roztok nabízí historické památky, turistické stezky krásnou přírodou i přímou cyklotrasu do Drážďan. Hotel Academic je vybaven také saunou, bowling barem a restaurací pro kompletní zážitek. Salonek je plně vybaven moderní audiovizuální technikou a flexibilním uspořádáním, které lze přizpůsobit vašim potřebám. Díky profesionálnímu servisu a kompletnímu konferenčnímu zázemí je L Salonek ideální volbou pro menší firemní akce a školení v klidném prostředí mimo ruch centra Prahy.'
  },
  {
    id: 'cmg9elai50019ntgoaid3qexk',
    slug: 'majaland-praha',
    description: 'Majaland Praha je největší kryté zábavní centrum v Čechách s plochou 9 000 m², které nabízí impozantní atrakce včetně 220 metrů dlouhé horské dráhy s výškovým rozdílem 9 metrů. Venkovní areál o rozloze 4 000 m² nabízí dalších 7 atrakcí (otevřeno dle počasí). Centrum se nachází v Praze 7 na POP Airport a je dostupné za pouhých 5 minut od letiště s bezplatným parkováním. U vchodu do Mayalandu najdete obchod plný krásných hraček, knih a deskových her. V divadle Mayaland si děti užijí zábavný program a mohou se osobně setkat s včelkou Májou. V jedinečné restauraci Maya\'s najdete všechny oblíbené pokrmy a můžete zde uspořádat nezapomenutelnou dětskou oslavu narozenin v pohádkovém Mayalandu. Prostor nabízí WiFi, parkování a bar. Majaland je ideální pro rodinné akce, dětské oslavy, firemní akce s rodinným programem a teambuildingové aktivity. Odpolední happy hours probíhají pondělí až čtvrtek od 16:00 do 20:00 se vstupem za 249 Kč. Na POP Airport najdete také unikátní muzeum Dinosauria s originálními kostami dinosaurů starými až 154 milionů let a výstavu Engine Classic Cars Gallery s více než 200 vozy a motocykly.'
  }
]

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  console.log('🚀 Updating Enhanced Venue Descriptions')
  console.log('=' .repeat(60))
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
