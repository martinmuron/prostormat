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
      "Vyhněte se nejčastějším chybám při výběru eventového prostoru. Přinášíme přehled z reálných akcí a tipy, jak správně posoudit lokalitu, kapacitu i technické zázemí.",
    content: `
      <h2>Úvod</h2>
      <p>Výběr eventového prostoru je jedním z nejdůležitějších rozhodnutí. Špatně zvolená lokalita, kapacita nebo technické zázemí dokáže pokazit i jinak perfektně připravenou akci. Připravili jsme přehled nejčastějších chyb, které pořadatelé dělají, a tipy, jak se jim vyhnout.</p>

      <h2>1. Podcenění lokality</h2>
      <p>Nádherný interiér sice zaujme, ale pokud se hosté do prostoru složitě dostávají, zážitek utrpí. Špatná dostupnost MHD, absence parkování nebo složité navigační pokyny jsou častým kamenem úrazu.</p>
      <p><strong>Tip:</strong> Zkontrolujte dostupnost autem i veřejnou dopravou a nezapomeňte na hosty přijíždějící z jiných měst.</p>

      <h2>2. Nesprávná kapacita</h2>
      <p>Příliš malý prostor je nepohodlný, příliš velký zase působí chladně a prázdně. Kapacita musí odpovídat nejen počtu hostů, ale také typu akce a plánovanému rozmístění.</p>
      <p><strong>Tip:</strong> Požadujte od provozovatele různé varianty uspořádání – například banket, divadelní nebo školní sezení.</p>

      <h2>3. Ignorování technického vybavení</h2>
      <p>Bez kvalitního ozvučení, mikrofonů, projektoru nebo stabilní Wi-Fi se snadno dostanete do neřešitelných situací. Technika je základ, a to nejen u konferencí.</p>
      <p><strong>Tip:</strong> Zjistěte, co je zahrnuto v ceně pronájmu. Pokud prostor nabízí vlastní technickou podporu, je to velké plus.</p>

      <h2>4. Opomenutí cateringu</h2>
      <p>Místo, které nenabízí catering nebo nedovolí externí dodavatele, může zhatit i tu nejlépe naplánovanou akci. Hladoví hosté rovná se nespokojení hosté.</p>
      <p><strong>Tip:</strong> Prověřte možnosti vlastního cateringu nebo doporučení na ověřené dodavatele.</p>

      <h2>5. Neřešení akustiky a hluku</h2>
      <p>Krásný prostor může mít problematickou akustiku. Pokud se hosté neslyší nebo je obtěžuje hluk z okolí, atmosféra akce jde dolů.</p>
      <p><strong>Tip:</strong> Vyzkoušejte prostor na vlastní uši – domluvte si prohlídku a otestujte komunikaci na různou vzdálenost.</p>

      <h2>6. Podcenění atmosféry</h2>
      <p>I technicky perfektní prostor může působit neosobně. Charakter místa by měl odpovídat typu akce.</p>
      <p><strong>Tip:</strong> Přemýšlejte, jaký dojem má akce vyvolat. Firemní gala večer potřebuje jiný charakter než startupový meetup.</p>

      <h2>Závěr</h2>
      <p>Úspěch akce stojí na detailech. Srovnávejte prostory podle lokality, kapacity, technického zázemí i atmosféry. V databázi Prostormat snadno najdete prostory, které splní všechna klíčová kritéria.</p>
    `,
    coverImage: "https://hlwgpjdhhjaibkqcyjts.supabase.co/storage/v1/object/public/venue-images/blog/nejcastejsi-chyby-pri-vyberu-eventoveho-prostoru.jpg",
    author: { name: "Prostormat tým", email: "info@prostormat.cz" },
    publishedAt: "2025-01-14T00:00:00.000Z",
    tags: JSON.stringify(["Eventy", "Tipy", "Výběr prostoru"]),
    metaTitle: "Nejčastější chyby při výběru eventového prostoru | Prostormat",
    metaDescription:
      "Vyhněte se nejčastějším chybám při výběru eventového prostoru. Praktické tipy, jak správně zvolit lokalitu, kapacitu i technické zázemí.",
  },
  {
    id: "fallback-pribeh-svatby",
    title: "Příběh jedné svatby: Jak jsme proměnili industriální halu v romantický ráj",
    slug: "pribeh-svatby-v-individualni-hale",
    excerpt:
      "Jak se z chladné industriální haly stala romantická svatební scéna? Přinášíme inspiraci z realizace, která kombinuje moderní design, atmosféru a nezapomenutelný servis.",
    content: `
      <h2>Počáteční výzva</h2>
      <p>Hala na okraji Prahy působila syrově a prázdně. Pár si ale vysnil moderní svatbu s romantickým nádechem. Naším cílem bylo vytvořit atmosféru, která hosty překvapí a nadchne.</p>

      <h2>Proměna prostoru</h2>
      <p>Klíčovou roli hrály dekorace a osvětlení. Světelné girlandy, závěsy z jemných látek, květinové oblouky a stovky svíček změnily chladný prostor v útulné a hřejivé místo. Kombinace industriálních prvků a jemných dekorací vytvořila kontrast, který zcela zapůsobil.</p>

      <h2>Catering, který nadchl</h2>
      <p>Pár zvolil moderní street food koncept. Miniburgery, finger food, sladký bar s cupcaky i tradiční české speciality zajistily, že si hosté přišli na své. Catering byl stylovou tečkou za celkovým konceptem.</p>

      <h2>Hudba a zábava</h2>
      <p>DJ doplněný o saxofonistu vytvořil nezapomenutelný hudební zážitek. Energie, kterou hudba v prostoru vytvořila, držela hosty na parketu až do ranních hodin.</p>

      <h2>Výsledek</h2>
      <p>Hosté odcházeli plní emocí a zážitků. Tato svatba je důkazem, že i industriální prostory skrývají obrovský potenciál – stačí mít správnou vizi a tým, který ji pomůže naplnit.</p>
    `,
    coverImage: "https://hlwgpjdhhjaibkqcyjts.supabase.co/storage/v1/object/public/venue-images/blog/pribeh-svatby-v-individualni-hale.jpg",
    author: { name: "Prostormat tým", email: "info@prostormat.cz" },
    publishedAt: "2025-01-07T00:00:00.000Z",
    tags: JSON.stringify(["Svatby", "Inspirace", "Dekorace"]),
    metaTitle: "Příběh svatby v industriální hale: Romantická proměna | Prostormat",
    metaDescription:
      "Jak proměnit industriální halu v romantické svatební místo? Inspirujte se skutečným příběhem a zjistěte, jak na dekorace, catering i hudbu.",
  },
  {
    id: "fallback-checklist-konference",
    title: "Na co nezapomenout při plánování konference – checklist pořadatele",
    slug: "checklist-pro-planovani-konference",
    excerpt:
      "Plánujete konferenci v Praze? Tento checklist pokrývá prostor, techniku, registraci i catering a pomůže vám mít event profesionálně zorganizovaný od A do Z.",
    content: `
      <h2>Výběr prostoru</h2>
      <p>Konferenční sál musí nabídnout odpovídající kapacitu, technické vybavení a flexibilní uspořádání. Měl by také poskytnout zázemí pro workshopy, networking i přestávky.</p>

      <h2>Registrace účastníků</h2>
      <p>Online registrační systém zrychlí check-in a poskytne přehled o účastnících. QR kódy nebo mobilní aplikace ušetří čas pořadatelům i hostům.</p>

      <h2>Technické zajištění</h2>
      <p>Bez spolehlivé techniky to nejde. Zajistěte projektory, mikrofony, ozvučení, stabilní Wi-Fi i techniky na místě. Vše otestujte ještě před začátkem.</p>

      <h2>Catering</h2>
      <p>Kvalitní občerstvení udrží účastníky svěží a soustředěné. Plánujte coffee breaky, oběd i případný večerní raut. Myslete na různé stravovací preference.</p>

      <h2>Program a harmonogram</h2>
      <p>Strukturovaný program s jasnými časy přestávek dodá akci rytmus. Nezapomeňte na networkingové bloky a doprovodný program.</p>

      <h2>Checklist pořadatele</h2>
      <ul>
        <li>Rezervace prostoru a techniky</li>
        <li>Registrace účastníků a komunikace</li>
        <li>Technické zkoušky před akcí</li>
        <li>Catering a speciální požadavky</li>
        <li>Harmonogram a odpovědnosti týmu</li>
        <li>Doprovodný program a networking</li>
      </ul>

      <h2>Závěr</h2>
      <p>Důkladná příprava je klíčem k úspěšné konferenci. V databázi Prostormat najdete prostory, které splní technické i logistické požadavky vaší akce.</p>
    `,
    coverImage: "https://hlwgpjdhhjaibkqcyjts.supabase.co/storage/v1/object/public/venue-images/blog/checklist-pro-planovani-konference.jpg",
    author: { name: "Prostormat tým", email: "info@prostormat.cz" },
    publishedAt: "2024-12-17T00:00:00.000Z",
    tags: JSON.stringify(["Konference", "Checklist", "Event management"]),
    metaTitle: "Checklist pro plánování konference: na co nezapomenout | Prostormat",
    metaDescription:
      "Plánujete konferenci? Stáhněte si checklist pořadatele a zjistěte, na co nezapomenout při výběru prostoru, techniky, cateringu i programu.",
  },
  {
    id: "fallback-magie-vecirku",
    title: "Magie večírků: Jak vytvořit nezapomenutelnou atmosféru díky prostoru",
    slug: "magie-vecirku-atmosfera-diky-prostoru",
    excerpt:
      "Nezapomenutelný večírek nevzniká náhodou. Osvětlení, hudba, zóny i dekorace musí spolupracovat. Podívejte se, jak z prostoru vytěžit maximum a vytvořit wow efekt.",
    content: `
      <h2>Osvětlení jako základ atmosféry</h2>
      <p>Správně zvolené světlo dokáže prostor proměnit k nepoznání. Barevné LED diody dodají energii, teplé tóny zase vytvoří intimní prostředí. Vyplatí se pracovat i s projekcemi nebo mappingem.</p>

      <h2>Rozmístění prostoru</h2>
      <p>Taneční parket, chill-out zóna, bar a pohodlné posezení – rozložení určuje dynamiku večírku. Pokud má prostor více částí, hosté se nenudí a akce plyne přirozeně.</p>

      <h2>Hudba a akustika</h2>
      <p>Hudba je srdcem večírku. Zkontrolujte, zda prostor nabízí kvalitní ozvučení a akustiku. Někdy stačí přidat tlumicí prvky nebo mobilní výplně, aby se zvuk nerozléhal.</p>

      <h2>Dekorace a detaily</h2>
      <p>Od rostlin až po tematické rekvizity – každý detail se počítá. I malý doplněk má vliv na celkovou atmosféru. Nebojte se neotřelých kombinací materiálů a textur.</p>

      <h2>Příběh z praxe</h2>
      <p>Firemní večírek ve staré továrně se díky mappingu, LED instalacím a kreativnímu rozložení proměnil v zážitkový klub. Hosté si ho pamatovali ještě týdny poté.</p>

      <h2>Závěr</h2>
      <p>Nezapomenutelný večírek tvoří detaily. Prostor je tou největší kulisou – s Prostormat snadno najdete místo, které umožní vytvořit přesně takovou atmosféru, jakou si přejete.</p>
    `,
    coverImage: "https://hlwgpjdhhjaibkqcyjts.supabase.co/storage/v1/object/public/venue-images/blog/magie-vecirku-atmosfera-diky-prostoru.jpg",
    author: { name: "Prostormat tým", email: "info@prostormat.cz" },
    publishedAt: "2024-11-28T00:00:00.000Z",
    tags: JSON.stringify(["Večírky", "Atmosféra", "Design"]),
    metaTitle: "Magie večírků: Jak vytvořit atmosféru díky prostoru | Prostormat",
    metaDescription:
      "Jak vytvořit nezapomenutelný večírek? Prostor hraje hlavní roli. Tipy na osvětlení, rozložení zón, hudbu i dekorace, díky nimž hosté na akci nezapomenou.",
  },
]
