export interface FAQItem {
  question: string
  answer: string
  section?: string
}

export interface FAQSection {
  title: string
  items: FAQItem[]
}

// Organized FAQ structure with sections
export const faqSections: FAQSection[] = [
  {
    title: "Pro organizátory akcí",
    items: [
      {
        question: "Jak funguje Prostormat?",
        answer: "Prostormat je platforma, která propojuje organizátory akcí s majiteli prostor třemi způsoby: (1) Můžete si prohlížet katalog více než 500 prostor a kontaktovat majitele přímo, (2) Zveřejnit poptávku na Event Boardu a nechat prostory, aby se ozvaly vám, nebo (3) Využít našich služeb a my celou akci zorganizujeme za vás od výběru prostoru po catering a produkci."
      },
      {
        question: "Je používání Prostormat zdarma pro organizátory akcí?",
        answer: "Ano, pro organizátory akcí je Prostormat zcela zdarma. Můžete bez omezení procházet prostory, odesílat poptávky, kontaktovat majitele a používat Event Board. Neúčtujeme žádné provize z rezervací ani žádné další poplatky."
      },
      {
        question: "Co je Event Board a jak ho mohu použít?",
        answer: "Event Board je veřejná nástěnka poptávek, kde můžete bezplatně zveřejnit detaily své akce (datum, počet hostů, typ akce, lokalita). Ověření majitelé prostor s aktivním předplatným vás pak mohou kontaktovat přímo s nabídkami. To vám šetří čas – nemusíte procházet stovky prostorů, prostory samy najdou vás."
      },
      {
        question: "Jak funguje rychlá poptávka?",
        answer: "Rychlá poptávka je nejrychlejší způsob, jak získat nabídky. Vyplníte krátký formulář s požadavky na akci a my automaticky odešleme váš požadavek všem vhodným prostorům, které odpovídají vašim kritériím (lokalita, kapacita, typ prostoru). Majitelé vás pak kontaktují přímo."
      },
      {
        question: "Jaké typy akcí podporujete?",
        answer: "Podporujeme širokou škálu akcí: firemní eventy, teambuildingy, konference a workshopy, svatby a svatební oslavy, narozeninové party a soukromé oslavy, prezentace a networking eventy, koncerty a kulturní akce, výstavy a veletrhy. Najdete u nás prostory od 10 do 500+ osob."
      },
      {
        question: "Jak probíhá rezervace prostoru?",
        answer: "Rezervace probíhá přímou komunikací mezi vámi a majitelem prostoru. Po nalezení vhodného prostoru jej kontaktujete přes platformu (tlačítko „Kontaktovat“ nebo „Odeslat poptávku“). Majitel vám odpoví s dostupností, cenou a podmínkami. Všechny detaily rezervace (termín, cena, smlouva) si pak domluvíte přímo – Prostormat neúčtuje žádné provize."
      },
      {
        question: "Nabízíte kompletní organizaci akcí?",
        answer: "Ano! Pokud nemáte čas nebo zkušenosti s organizací, můžeme celou akci zorganizovat za vás. Naše služba zahrnuje: výběr a rezervaci ideálního prostoru, catering a občerstvení, technické vybavení (zvuk, světla, projekce), výzdobu a dekorace, produkční koordinaci a harmonogram. Aktuálně se zaměřujeme na akce od 30 osob. Více informací najdete na stránce „Organizace akce“."
      },
      {
        question: "Účtujete provize z rezervací?",
        answer: "Ne, Prostormat NEÚČTUJE ŽÁDNÉ PROVIZE z rezervací. Cenu si domluvíte přímo s majitelem prostoru bez našeho zásahu. To je jeden z našich hlavních rozdílů oproti jiným platformám – transparentnost a žádné skryté poplatky."
      }
    ]
  },
  {
    title: "Pro majitele prostorů",
    items: [
      {
        question: "Kolik stojí přidání prostoru na Prostormat?",
        answer: "Roční předplatné stojí 12 000 Kč. Zahrnuje: kompletní profil prostoru s fotogalerií, neomezené dotazy od klientů, přístup k poptávkám na Event Boardu, automatické notifikace o relevantních poptávkách, email podporu. Předplatné se automaticky obnovuje každý rok, můžete jej ale kdykoliv zrušit bez sankcí."
      },
      {
        question: "Jak mohu přidat svůj prostor?",
        answer: "Klikněte na „Přidat prostor“ v hlavním menu. Vyplňte formulář s informacemi o prostoru (název, adresa, kapacita, vybavení, fotografie, kontaktní údaje). Po vyplnění budete přesměrováni na bezpečnou platbu kartou (12 000 Kč/rok). Náš tým váš prostor zkontroluje do 24–48 hodin a po schválení bude zveřejněn."
      },
      {
        question: "Co je zahrnuto v základním předplatném (12 000 Kč/rok)?",
        answer: "V základním předplatném získáte: veřejný profil s neomezeným počtem fotografií a videem, zobrazení ve výsledcích vyhledávání podle parametrů, přístup k Event Boardu – vidíte plné kontakty organizátorů, emailové notifikace při nových relevantních poptávkách, možnost upravovat profil kdykoliv, podporu přes email a účast v našem newsletter marketingu."
      },
      {
        question: "Co jsou prémiové balíčky Priority a Top Priority?",
        answer: "Priority (7 000 Kč/rok): Váš prostor se zobrazuje mezi prvními 24 prostory ve všech výsledcích vyhledávání a filtrů. Statisticky získáte až o 70 % více poptávek.\n\nTop Priority (14 000 Kč/rok): Váš prostor je mezi prvními 12 v katalogu a získává umístění na homepage. Statisticky přináší až o 135 % více poptávek. Limit je pouze 12 prostor – pokud je vyprodáno, můžete se zapsat na waiting list.\n\nObě varianty zahrnují newsletter marketing Prostormat."
      },
      {
        question: "Co je Event Board a proč je důležitý pro mě jako majitele prostoru?",
        answer: "Event Board je veřejná nástěnka, kde organizátoři zveřejňují své poptávky (typ akce, datum, počet hostů, rozpočet, lokalita). Jako majitel s aktivním předplatným vidíte plné kontaktní údaje organizátorů a můžete jim aktivně nabídnout svůj prostor. To znamená, že nemusíte čekat, až vás někdo najde – můžete aktivně oslovovat klienty, kteří hledají přesně to, co nabízíte."
      },
      {
        question: "Jak rychle můj prostor schválíte?",
        answer: "Schválení nového prostoru obvykle trvá 24–48 hodin. Náš tým zkontroluje informace, fotografie a ověří, že prostor splňuje naše kvalitativní standardy. Pokud něco bude chybět nebo bude potřeba upravit, ozveme se vám emailem. Po schválení vám pošleme oznámení a váš prostor bude okamžitě viditelný."
      },
      {
        question: "Jaká jsou kritéria pro schválení prostoru?",
        answer: "Váš prostor schválíme, pokud splňuje: kvalitní fotografie (minimálně 3, ideálně 8–10 fotografií), úplné a pravdivé informace (adresa, kapacita, vybavení, kontakty), prostor je vhodný pro akce/eventy (ne běžné kanceláře nebo byty), aktivní provoz a dostupnost pro rezervace. Pokud něco nebude vyhovovat, ozveme se s konkrétními požadavky na úpravu."
      },
      {
        question: "Mohu převzít (claimovat) prostor, který už na Prostormat je?",
        answer: "Ano! Pokud při přidávání prostoru zjistíme, že již existuje v naší databázi, nabídneme vám možnost „claimování“ (převzetí). Po zaplacení předplatného náš tým ověří, že jste oprávněný správce (např. ověříme vlastnictví prostoru). Po schválení převezmete plnou správu existujícího profilu a můžete jej upravovat."
      },
      {
        question: "Jak dostávám poptávky od klientů?",
        answer: "Poptávky dostáváte třemi způsoby: (1) Přímé kontakty – klient vás najde v katalogu a kontaktuje přes formulář na vašem profilu, (2) Event Board – prohlížíte veřejné poptávky a aktivně oslovujete organizátory, (3) Emailové notifikace – když někdo použije rychlou poptávku a váš prostor odpovídá kritériím, automaticky vám zašleme detaily."
      },
      {
        question: "Mohu upravit profil svého prostoru?",
        answer: "Ano, váš profil můžete kdykoliv upravovat. Po přihlášení přejděte do sekce „Dashboard“ → „Moje prostory“ a klikněte na prostor, který chcete upravit. Můžete změnit: fotografie, popis, ceník, kapacitu, vybavení a služby, dostupnost, kontaktní údaje."
      },
      {
        question: "Jak funguje automatické obnovení předplatného?",
        answer: "Předplatné se automaticky obnovuje každý rok, aby váš prostor zůstal viditelný bez přerušení. Měsíc před obnovením vám pošleme připomínku emailem. Platbu můžete zrušit kdykoliv v nastavení účtu – klikněte na „Zrušit předplatné“ a budete mít přístup do konce zaplaceného období. Žádné sankce ani skryté poplatky."
      },
      {
        question: "Mohu získat refundaci (vrácení peněz)?",
        answer: "Refundace je možná do 14 dnů od první platby, pokud jste ještě nezískali žádnou poptávku přes platformu. Po 14 dnech nebo po obdržení první poptávky již refundaci neposkytujeme. Předplatné ale můžete kdykoliv zrušit a budete mít přístup do konce zaplaceného období."
      }
    ]
  },
  {
    title: "Full-Service Organizace akcí",
    items: [
      {
        question: "Co zahrnuje služba full-service organizace akce?",
        answer: "Náš tým za vás zařídí kompletně vše: výběr a rezervace ideálního prostoru podle vašich požadavků, catering, nápoje a občerstvení, technické vybavení (zvuk, světla, projekce, pódia), výzdobu a dekorace podle tématu akce, koordinace dodavatelů a harmonogram, produkční tým přítomný během akce. Vy pouze řeknete, co potřebujete, a my to zařídíme."
      },
      {
        question: "Jaká je minimální velikost akce pro full-service organizaci?",
        answer: "Aktuálně se zaměřujeme na akce od 30 osob. Pro menší akce doporučujeme použít náš katalog prostor nebo Event Board, kde si prostor můžete najít sami."
      },
      {
        question: "Jak dlouho dopředu musím objednat full-service organizaci?",
        answer: "Doporučujeme kontaktovat nás alespoň 4–6 týdnů předem, abychom měli dostatek času na výběr vhodného prostoru a koordinaci dodavatelů. V urgentních případech můžeme zorganizovat akci i za 2 týdny, ale záleží na dostupnosti prostor a dodavatelů."
      },
      {
        question: "Kolik stojí full-service organizace akce?",
        answer: "Cena závisí na velikosti akce, požadavcích (catering, technika, produkce) a lokalitě. Vyplňte formulář na stránce „Organizace akce“ a my vám během 48 hodin zašleme nezávaznou cenovou nabídku přesně podle vašich potřeb."
      }
    ]
  },
  {
    title: "AI a připravované funkce",
    items: [
      {
        question: "Jaké AI funkce připravujete?",
        answer: "Pracujeme na balíčcích AI Matching a AI Visual Event. AI Matching bude pomocí strojového učení doporučovat nejrelevantnější prostory organizátorům a automaticky párovat poptávky s profily prostorů. AI Visual Event umožní popsat plánovanou akci a vygenerovat fotorealistickou vizualizaci přímo v prostoru."
      },
      {
        question: "Kdy budou AI funkce dostupné a jak je získám?",
        answer: "Obě AI funkce jsou nyní ve fázi beta testování s vybranými partnery. Jakmile je uvolníme, budou k dispozici jako Prémiové balíčky „AI Matching“ a „AI Visual Event“ v sekci Ceník. Pokud chcete mít přístup mezi prvními, napište nám na info@prostormat.cz a zařadíme vás na waiting list."
      }
    ]
  },
  {
    title: "Platby a účtování",
    items: [
      {
        question: "Jak mohu platit?",
        answer: "Platby probíhají bezpečně online kartou přes Stripe. Přijímáme všechny běžné platební karty (Visa, Mastercard, American Express). Po dokončení platby obdržíte potvrzení emailem a fakturu."
      },
      {
        question: "Dostanu fakturu?",
        answer: "Ano, fakturu obdržíte automaticky emailem ihned po dokončení platby. Pokud potřebujete fakturu s jinými údaji (IČO, DIČ firmy), kontaktujte nás na info@prostormat.cz a my fakturu přepošleme."
      },
      {
        question: "Co se stane, když nezaplatím obnovení předplatného?",
        answer: "Pokud platba obnovení selže, váš profil zůstane aktivní ještě 7 dní a pošleme vám připomínku emailem. Po 7 dnech se profil automaticky skryje (nebude viditelný ve vyhledávání ani na Event Boardu). Data zůstanou zachovaná – jakmile obnovíte platbu, prostor se okamžitě znovu zveřejní."
      }
    ]
  },
  {
    title: "Obecné otázky",
    items: [
      {
        question: "V jakých městech působíte?",
        answer: "Náš hlavní katalog pokrývá Prahu a okolí (Praha 1–16 a přilehlé obce). Máme však prostory i v dalších městech České republiky (Brno, Ostrava, Plzeň, České Budějovice a další). Postupně rozšiřujeme pokrytí do všech krajských měst."
      },
      {
        question: "Jak mohu kontaktovat podporu?",
        answer: "Napište nám na info@prostormat.cz – odpovídáme do 24 hodin v pracovních dnech. Můžete také využít kontaktní formulář na stránce „Kontakt“."
      },
      {
        question: "Jsou moje osobní údaje v bezpečí?",
        answer: "Ano, bereme ochranu dat velmi vážně. Jsme v souladu s GDPR. Vaše osobní údaje (email, telefon, jméno) používáme pouze pro provoz platformy a komunikaci ohledně poptávek. Nikdy je neprodáváme třetím stranám. Více informací najdete v našich Zásadách ochrany soukromí."
      },
      {
        question: "Mohu zrušit svou poptávku nebo požadavek?",
        answer: "Ano. Pokud jste zveřejnili poptávku na Event Boardu, můžete ji kdykoliv uzavřít v dashboardu (status změní na „uzavřená“). Pokud jste odeslali přímou poptávku majiteli, ozvěte se mu přímo a sdělte, že už prostor nepotřebujete."
      },
      {
        question: "Účtujete provize z rezervací?",
        answer: "Ne, Prostormat NEÚČTUJE PROVIZE. Organizátoři si domlouvají cenu a podmínky přímo s majiteli prostor. Náš byznys model je založený na předplatném od majitelů prostor (12 000 Kč/rok), ne na provizích. To znamená transparentní ceny bez skrytých poplatků."
      }
    ]
  }
]

// Legacy flat array for backward compatibility
export const faqItems: FAQItem[] = faqSections.flatMap(section =>
  section.items.map(item => ({
    ...item,
    section: section.title
  }))
)
