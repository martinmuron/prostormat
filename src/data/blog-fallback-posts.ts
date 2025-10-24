export type FallbackBlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  author: {
    name: string
    email: string
  }
  publishedAt: string
  tags: string
  metaTitle: string
  metaDescription: string
}

export const fallbackBlogPosts: FallbackBlogPost[] = [
  {
    id: "fallback-nejcastejsi-chyby",
    title: "Nejčastější chyby při výběru eventového prostoru a jak se jim vyhnout",
    slug: "nejcastejsi-chyby-pri-vyberu-eventoveho-prostoru",
    excerpt:
      "Prostor je víc než adresa a počet židlí. Připravili jsme moderní checklist, který vám pomůže vybrat lokalitu, kapacitu, techniku i atmosféru bez zbytečných kompromisů.",
    content: `
      <h2>Prostor jako moodboard celé akce</h2>
      <p>Event, který dnes funguje, musí být zároveň zážitkem, Instagram momentem i pohodlným místem pro networking. Pokud zvolíte špatný prostor, celý koncept se rozpadne. Proto jsme rozebrali nejčastější chyby, se kterými se v Prostormat setkáváme, a přidali jasný návod, jak se jim vyhnout.</p>

      <h2>Chyba č. 1: Lokalita, která nefunguje v praxi</h2>
      <p>Popisek u fotky může slibovat centrum města, ale realita je tramvaj + 10 minut pěšky přes staveniště. Hosté pak přicházejí pozdě a s první negativní zkušeností.</p>
      <ul>
        <li><strong>Zkontrolujte všechny přestupy.</strong> Včetně posledních spojů po konci programu.</li>
        <li><strong>Myslete na parkování.</strong> Rezervovaná místa ušetří spoustu nervů.</li>
      </ul>

      <h2>Chyba č. 2: Kapacita mimo realitu</h2>
      <p>Banket pro 120 lidí, ale prostor zvládne pohodlně jen 90? Stoly budou nalepené na sobě. Stejně problematické je „letiště“ pro 80 hostů, které vypadá prázdně.</p>
      <blockquote>
        <p>Ideální prostor působí zaplněně na 70 % kapacity a má jasně definované zóny pro program, networking i backstage.</p>
      </blockquote>

      <h2>Chyba č. 3: Technika, která zradí v nejdůležitější chvíli</h2>
      <p>Hybridní stream, keynote, DJ set – všechno stojí na spolehlivé technice. Pár wifinových extenderů nestačí.</p>
      <p><strong>Checklist:</strong> ozvučení, mikrofony, LED obraz, monitor pro backstage, stabilní internet minimálně 50 Mbps.</p>

      <h2>Chyba č. 4: Catering bez konceptu</h2>
      <p>Občerstvení je součást storytellingu. Pokud se hosté postaví do jedné fronty, flow akce se zastaví.</p>
      <ul>
        <li><strong>Mix formátů.</strong> Welcome drink, finger food a signaturní stanice s live cooking.</li>
        <li><strong>Dietní preference.</strong> Vše dopředu komunikujte, ať se na místě neimprovizuje.</li>
      </ul>

      <h2>Chyba č. 5: Akustika bez kontroly</h2>
      <p>Designový loft může mít ozvěnu, která zabije networking. Otestujte prostor na vlastní uši a počítejte s tlumicími prvky.</p>

      <h2>Chyba č. 6: Žádný wow moment</h2>
      <p>Dnešní event potřebuje kulisu, která se sdílí. Světlo, projekce, aroma – detaily, které vytváří zážitek.</p>

      <h2>Smart checklist před podpisem smlouvy</h2>
      <ul>
        <li>Flow hostů: od registrace po afterparty.</li>
        <li>Technologie: seznam zařízení + kontakty na onsite support.</li>
        <li>Atmosféra: světlo, zvuk, dekor, fotopoint.</li>
        <li>Servis: plán B pro počasí, časová osa load-in/out.</li>
      </ul>
      <p>S Prostormat najdete prostor, který sedí vašemu brandu i rozpočtu. Stačí zadat parametry a případné slepé uličky necháte za sebou ještě před prvním site visit.</p>
    `,
    coverImage: "https://hlwgpjdhhjaibkqcyjts.supabase.co/storage/v1/object/public/venue-images/blog/nejcastejsi-chyby-pri-vyberu-eventoveho-prostoru.jpg",
    author: { name: "Prostormat tým", email: "info@prostormat.cz" },
    publishedAt: "2025-01-14T00:00:00.000Z",
    tags: JSON.stringify(["Eventy", "Tipy", "Výběr prostoru"]),
    metaTitle: "Nejčastější chyby při výběru eventového prostoru | Prostormat",
    metaDescription:
      "Moderní checklist pro výběr eventového prostoru. Naučíme vás pracovat s lokalitou, kapacitou, technikou i atmosférou, aby akce držela krok s očekáváními hostů.",
  },
  {
    id: "fallback-pribeh-svatby",
    title: "Příběh jedné svatby: Jak jsme proměnili industriální halu v romantický ráj",
    slug: "pribeh-svatby-v-individualni-hale",
    excerpt:
      "Z tovární haly na okraji Prahy jsme během jednoho víkendu vytvořili moderní love story. Inspirujte se moodboardy, časovou osou a tipy, jak zvládnout transformaci industriálního prostoru.",
    content: `
      <h2>Jak z industriálního prostoru udělat romantickou svatbu</h2>
      <p>Pár chtěl atmosféru „moderní elegance“ bez hotelových lustrů. V hledáčku skončila industriální hala s 12metrovým stropem a betonovou podlahou. Odvážné? Právě tahle volba umožnila vytvořit svatební zážitek, který si hosté budou pamatovat ještě dlouho.</p>

      <h2>Moodboard & barevná paleta</h2>
      <p>První krok? Společný Pinterest board. Kombinovali jsme chladné materiály prostoru s jemnou paletou pískové, champagne a pistáciové. Dominantní prvek: statement květinová instalace zavěšená nad obřadním pódiem.</p>
      <ul>
        <li><strong>Textury:</strong> len, samet, recyklované sklo, kartáčovaný kov.</li>
        <li><strong>Osvětlení:</strong> stmívací světelné rampy, křišťálové kapky na lankách, Edisonky nad barem.</li>
      </ul>

      <h2>Timeline proměny</h2>
      <p><strong>Pátek 08:00</strong> – montáž konstrukcí a černění stěn, aby zmizely industriální prvky, které jsme nechtěli.</p>
      <p><strong>Pátek 14:00</strong> – rozložení zón: welcome lounge, obřad, dining hall, večerní party.</p>
      <p><strong>Sobota 09:00</strong> – finální styling, test světelné scény, soundcheck kapely.</p>

      <h2>Design jednotlivých zón</h2>
      <p><strong>Welcome lounge</strong> s kávovým barem a signature drinkem. Hosté přišli, posadili se do nízkých klubových křesel a užili si vinylové sety.</p>
      <p><strong>Obřad</strong> uprostřed haly, obklopený závěsy z jemného voálu. Světla mířila jen do středu, aby vytvořila intimní atmosféru.</p>
      <p><strong>Dining hall</strong> s dlouhými komunitními stoly a ručně psanými menu. Každé místo mělo personalizovanou kartičku se společnou vzpomínkou.</p>
      <p><strong>Night party</strong> = club vibe. LED stěna s projekcí záběrů z fotokoutku živě během večera.</p>

      <h2>Detail, který rozhodl</h2>
      <blockquote>
        <p>Fotokoutek jsme přesunuli na konec chodby pod neonový nápis novomanželů. Lidé si tam chodili nejen fotit, ale i odpočinout – a vznikl spontánní chill spot.</p>
      </blockquote>

      <h2>Lessons learned</h2>
      <ul>
        <li>Industriální prostor je canvas. Každý detail musí mít jasný důvod, jinak působí nahodile.</li>
        <li>Práce se světlem = storytelling. Scéna se měnila podle denní doby a fáze programu.</li>
        <li>Technická produkce je klíčová. Bez precizní koordinace by se víkendový turn-around nedal zvládnout.</li>
      </ul>

      <h2>Ready vytvořit vlastní love story?</h2>
      <p>Na Prostormat najdete industriální prostory s dostatečnou kapacitou, možností blackoutů i zázemím pro dodavatele. Stačí zadat parametry a vybrat to, co podtrhne váš příběh.</p>
    `,
    coverImage: "https://hlwgpjdhhjaibkqcyjts.supabase.co/storage/v1/object/public/venue-images/blog/pribeh-svatby-v-individualni-hale.jpg",
    author: { name: "Prostormat tým", email: "info@prostormat.cz" },
    publishedAt: "2025-01-07T00:00:00.000Z",
    tags: JSON.stringify(["Svatby", "Inspirace", "Dekorace"]),
    metaTitle: "Příběh svatby v industriální hale: Romantická proměna | Prostormat",
    metaDescription:
      "Jak proměnit industriální halu v moderní svatební kulisu? Přinášíme moodboardy, tipy na zónování i časovou osu víkendové transformace.",
  },
  {
    id: "fallback-checklist-konference",
    title: "Na co nezapomenout při plánování konference – checklist pořadatele",
    slug: "checklist-pro-planovani-konference",
    excerpt:
      "Hybridní konference, leadership summit nebo interní all-hands: sepsali jsme modulární checklist, který pokryje prostor, techniku, registraci i obsah tak, aby event působil moderně a profesionálně.",
    content: `
      <h2>Strategický kick-off</h2>
      <p>Začněte odpověďmi na otázky: proč akci děláme, co má každý účastník odnést a jaký dojem chceme zanechat. Teprve potom řešte místo a produkci – jinak se snadno utopíte v detailech.</p>

      <h2>Výběr prostoru 2.0</h2>
      <p>Konferenční prostor musí zvládnout plenární část, break-outy, backstage a klidné zóny pro meetingy. Hledejte místa se silnou technikou a dobrým denním světlem.</p>
      <ul>
        <li><strong>Flexibilita sálů:</strong> posuvné stěny, možnost rychlého přenastavení.</li>
        <li><strong>Zázemí pro speakery:</strong> green room, make-up station, klid pro přípravu.</li>
        <li><strong>Logistika:</strong> snadný load-in pro techniku a catering, parking pro dodavatele.</li>
      </ul>

      <h2>Registrace & community management</h2>
      <p>Digital first. Vytvořte microsite s agendou, pre-event dotazníkem a personalizovaným QR kódem. Check-in pak trvá méně než 20 vteřin.</p>
      <p>Po akci rozešlete highlighty, fotky a navazující call-to-action – právě tam se rodí navazující byznys.</p>

      <h2>Technologický stack</h2>
      <p>Technika není jen projektor. Opravdu moderní konference pracuje s live přenosy, záznamem a interaktivními prvky.</p>
      <ul>
        <li>Full HD/4K projekce nebo LED stěna.</li>
        <li>Profesionální ozvučení s monitoringem v jednotlivých sálech.</li>
        <li>Stabilní internet min. 100 Mbps pro stream a partner zone.</li>
        <li>Event aplikace pro Q&A, hlasování a networking.</li>
      </ul>

      <h2>Obsah, který drží tempo</h2>
      <p>Mixujte formáty: keynotes do 20 minut, panel s jasným moderátorem, interaktivní workshopy. Každých 45 minut zařaďte pohyb či networkingový blok.</p>
      <ul>
        <li>Warm-up: ranní welcome s playlistem, který nastaví energii.</li>
        <li>Prime time: nejdůležitější obsah mezi 10:00–12:00.</li>
        <li>Afternoon reset: hands-on aktivita nebo nevšední host.</li>
      </ul>

      <h2>Guest experience</h2>
      <p>Káva a obložené chlebíčky už nestačí. Přidejte wellness kout, lokální snack bar, silent disco networking nebo večerní tasting. Vše musí navazovat na téma konference.</p>

      <h2>Ultimate checklist</h2>
      <ul>
        <li>Definice cílů, KPI a tónu komunikace.</li>
        <li>Výběr prostoru s plánem B (online/hybrid).</li>
        <li>Technologický rider potvrzený dodavatelem.</li>
        <li>Obsahová dramaturgie + moderátor coach.</li>
        <li>Catering, guest journey a signage.</li>
        <li>Post-event follow-up a data insight.</li>
      </ul>
      <p>S Prostormat snadno porovnáte prostory podle kapacity, techniky i dostupnosti. Vyplňte poptávku a my vám navrhneme místa, která dodají konferenci současný profesionální vibe.</p>
    `,
    coverImage: "https://hlwgpjdhhjaibkqcyjts.supabase.co/storage/v1/object/public/venue-images/blog/checklist-pro-planovani-konference.jpg",
    author: { name: "Prostormat tým", email: "info@prostormat.cz" },
    publishedAt: "2024-12-17T00:00:00.000Z",
    tags: JSON.stringify(["Konference", "Checklist", "Event management"]),
    metaTitle: "Checklist pro plánování konference: na co nezapomenout | Prostormat",
    metaDescription:
      "Moderní checklist pro plánování konference od strategie přes technologii až po guest experience. Pokryjeme prostor, registraci, obsah i follow-up.",
  },
  {
    id: "fallback-magie-vecirku",
    title: "Magie večírků: Jak vytvořit nezapomenutelnou atmosféru díky prostoru",
    slug: "magie-vecirku-atmosfera-diky-prostoru",
    excerpt:
      "Afterparty, na kterou se ještě týdny vzpomíná? Vezměte prostor, pracujte se světlem, zonováním a playlistem. Sdílíme osvědčené hacky i scénář jednoho velkého firemního večírku.",
    content: `
      <h2>Večírek, který funguje jako minifestival</h2>
      <p>Dnešní firemní party už není jen o rautu a DJ. Hosté chtějí playlist, který graduje, vizuál, který chtějí fotit, a zóny, kde se mohou bavit i odpočívat. Základem je prostor, který nabídne flexibilitu a umožní pracovat se světlem.</p>

      <h2>Osvětlení = game changer</h2>
      <p>Začněte tím, že vymyslíte světelnou story. Warm-up v teplejších tónech, party část s neonovými přechody a závěr se zklidněným ambientem.</p>
      <ul>
        <li><strong>Layering:</strong> kombinujte základní světlo, světelné instalace a interaktivní prvky (např. LED náramky reagující na hudbu).</li>
        <li><strong>Highlight moment:</strong> countdown, ve kterém dojde k přechodu světel a odhalení hlavního programu.</li>
      </ul>

      <h2>Zónování prostoru</h2>
      <p>Ideální večírek má minimálně čtyři mood zóny. Díky tomu se hosté přirozeně přesouvají a event má dynamiku.</p>
      <ol>
        <li><strong>Main stage:</strong> tančírna se silným zvukem a vizuální scénou.</li>
        <li><strong>Social bar:</strong> signature drinky, vysoké stoly, prostor pro networking.</li>
        <li><strong>Relax lounge:</strong> nízká světla, playlist na 80 BPM, komfortní sezení.</li>
        <li><strong>Interactive corner:</strong> fotokoutek, VR stage, kreativní workshop.</li>
      </ol>

      <h2>Hudba & akustika</h2>
      <p>Hudba je engine celé akce. Mějte připravený playlist pro příjezd hostů, warm-up, hlavní set a late-night část. Kvalitní PA systém a sound designér, který kontroluje hladiny v jednotlivých zónách, jsou nutností.</p>

      <h2>Case study: Tech brand launch party</h2>
      <p>Pro klienta z technologického segmentu jsme obsadili prostor bývalé pošty. Minimalistická scenérie přes den, večer totální klubová metamorfóza. Mapping na fasádě odpočítával launch nového produktu, uvnitř jsme pracovali s LED tunelem, který prováděl pohyb návštěvníků.</p>
      <blockquote>
        <p>Peak moment? V okamžiku představení produktu se synchronizovalo světlo, CO₂ efekty i refrén od live DJ + saxofonisty. Feed plný stories během několika minut.</p>
      </blockquote>

      <h2>Checklist pro vaše další „wow“</h2>
      <ul>
        <li>Vyberte prostor, který zvládne samostatně ozvučené zóny.</li>
        <li>Nasaďte světelný design, který graduje dramaturgii večera.</li>
        <li>Zajistěte vizuální identitu akce – signage, bar menu, fotopoint.</li>
        <li>Připravte aftercare: pozdní snack, odvoz, playlist ke sdílení.</li>
      </ul>
      <p>S Prostormat najdete venues, které umí klubový vibe, ale i decentní corporate. Stačí zadat parametry a zbytek doladíme společně.</p>
    `,
    coverImage: "https://hlwgpjdhhjaibkqcyjts.supabase.co/storage/v1/object/public/venue-images/blog/magie-vecirku-atmosfera-diky-prostoru.jpg",
    author: { name: "Prostormat tým", email: "info@prostormat.cz" },
    publishedAt: "2024-11-28T00:00:00.000Z",
    tags: JSON.stringify(["Večírky", "Atmosféra", "Design"]),
    metaTitle: "Magie večírků: Jak vytvořit atmosféru díky prostoru | Prostormat",
    metaDescription:
      "Afterparty, která má wow efekt: naučíme vás pracovat se světlem, zónami, playlistem i guest experience tak, aby firemní večírek připomínal minifestival.",
  },
]
