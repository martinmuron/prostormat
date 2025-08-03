import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react"

// Placeholder blog posts for when database is empty
const placeholderPosts = [
  {
    id: "placeholder-1",
    title: "Jak vybrat ideální prostor pro firemní akci",
    slug: "jak-vybrat-idealni-prostor-pro-firemni-akci",
    excerpt: "Plánujete firemní akci a nevíte, na co se zaměřit při výběru prostoru? Zde najdete praktické tipy a checklisk, který vám pomůže vybrat to pravé místo.",
    content: `
      <h2>Úvod</h2>
      <p>Výběr správného prostoru pro firemní akci je klíčový pro její úspěch. Ať už plánujete teambuilding, konferenci, nebo slavnostní večer, prostor ovlivní celkovou atmosféru a dojem, který si účastníci odnesou.</p>
      
      <h2>Na co se zaměřit při výběru</h2>
      <h3>1. Kapacita a rozložení</h3>
      <p>Ujistěte se, že prostor pojme všechny účastníky pohodlně. Počítejte s prostorem na pohyb a případné aktivity.</p>
      
      <h3>2. Lokalita</h3>
      <p>Zvolte místo snadno dostupné veřejnou dopravou i autem. Myslete na parkování pro účastníky.</p>
      
      <h3>3. Technické vybavení</h3>
      <p>Ověřte dostupnost projekčních ploch, ozvučení a WiFi připojení podle potřeb vaší akce.</p>
      
      <h2>Praktický checklist</h2>
      <ul>
        <li>Kapacita odpovídá počtu účastníků</li>
        <li>Dobré dopravní spojení</li>
        <li>Dostupné parkování</li>
        <li>Technické vybavení dle potřeb</li>
        <li>Možnost cateringu</li>
        <li>Flexibilní rozložení prostoru</li>
      </ul>
    `,
    coverImage: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=400&fit=crop",
    author: { name: "Prostormat Team", email: "team@prostormat.cz" },
    publishedAt: new Date("2024-01-15"),
    tags: '["Firemní akce", "Tipy", "Prostory"]'
  },
  {
    id: "placeholder-2",
    title: "5 trendů v organizaci svateb pro rok 2025",
    slug: "5-trendu-v-organizaci-svateb-pro-rok-2025",
    excerpt: "Objevte nejnovější trendy ve svatebním průmyslu. Od udržitelných svateb po netradiční prostory - inspirujte se pro vaši nezapomenutelnou oslavu.",
    content: `
      <h2>Trendy, které budou definovat svatby v roce 2025</h2>
      <p>Svatební průmysl se neustále vyvíjí a rok 2025 přinese zajímavé novinky. Zde jsou hlavní trendy, které budou definovat letošní svatby.</p>
      
      <h2>1. Udržitelné svatby</h2>
      <p>Páry stále více dbají na ekologický dopad své svatby. Od místních dodavatelů po kompostovatelnou výzdobu.</p>
      
      <h2>2. Mikro svatby s velkým dopadem</h2>
      <p>Menší svatby umožňují vyšší kvalitu a více osobní přístup k každému detailu.</p>
      
      <h2>3. Netradiční prostory</h2>
      <p>Průmyslové haly, střešní terasy nebo historické budovy nahrazují klasické svatební sály.</p>
      
      <h2>4. Technologie ve službách lásky</h2>
      <p>Od živých přenosů pro vzdálené příbuzné po QR kódy pro svatební menu.</p>
      
      <h2>5. Personalizace do nejmenšího detailu</h2>
      <p>Každý prvek svatby odráží osobnost páru - od handmade prvků po jedinečné menu.</p>
    `,
    coverImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=400&fit=crop",
    author: { name: "Prostormat Team", email: "team@prostormat.cz" },
    publishedAt: new Date("2024-01-10"),
    tags: '["Svatby", "Trendy", "2025"]'
  },
  {
    id: "placeholder-3",
    title: "Teambuilding v neobvyklých prostorech",
    slug: "teambuilding-v-neobvyklych-prostorech",
    excerpt: "Tradiční konferenční sály už nebaví? Přečtěte si, jak netradičně prostory mohou oživit váš teambuilding a posílit týmovou soudržnost.",
    content: `
      <h2>Proč zvolit netradiční prostor?</h2>
      <p>Netradiční prostředí stimuluje kreativitu a pomáhá týmu vidět věci z nového úhlu pohledu. Změna prostředí často vede k průlomovým nápadům.</p>
      
      <h2>Inspirativní prostory pro teambuilding</h2>
      <h3>Průmyslové haly a ateliéry</h3>
      <p>Surové prostředí podporuje otevřené myšlení a experimentování.</p>
      
      <h3>Střešní terasy a zahrady</h3>
      <p>Příroda uklidňuje a podporuje přirozenou komunikaci.</p>
      
      <h3>Historické prostory</h3>
      <p>Unikátní atmosféra dodává aktivitám zvláštní nádech.</p>
      
      <h2>Tipy pro organizaci</h2>
      <ul>
        <li>Vyberte prostor podle charakteru týmu</li>
        <li>Myslete na praktické aspekty (parkování, dostupnost)</li>
        <li>Připravte backup plán pro nepřízeň počasí</li>
        <li>Využijte unikátnost prostoru v aktivitách</li>
      </ul>
    `,
    coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    author: { name: "Prostormat Team", email: "team@prostormat.cz" },
    publishedAt: new Date("2024-01-05"),
    tags: '["Teambuilding", "Netradičně", "Týmová práce"]'
  },
  {
    id: "placeholder-4",
    title: "Checklist pro organizaci úspěšné konference",
    slug: "checklist-pro-organizaci-uspesne-konference",
    excerpt: "Kompletní průvodce plánováním konference od výběru prostoru až po day-of koordinaci. Nezapomeňte na žádný důležitý detail.",
    content: `
      <h2>Kompletní checklist pro konferenci</h2>
      <p>Organizace konference vyžaduje pečlivé plánování a koordinaci mnoha detailů. Tento checklist vám pomůže nezapomenout na nic důležitého.</p>
      
      <h2>3-6 měsíců předem</h2>
      <ul>
        <li>Stanovte cíle a rozpočet konference</li>
        <li>Vyberte datum a rezervujte prostor</li>
        <li>Sestavte tým organizátorů</li>
        <li>Najděte hlavní řečníky</li>
      </ul>
      
      <h2>1-3 měsíce předem</h2>
      <ul>
        <li>Spusťte registrace účastníků</li>
        <li>Domluvte catering a technické vybavení</li>
        <li>Připravte marketingové materiály</li>
        <li>Vytvořte program konference</li>
      </ul>
      
      <h2>Týden před konferencí</h2>
      <ul>
        <li>Zkontrolujte vše podle finálního checklistu</li>
        <li>Připravte welcome packety</li>
        <li>Otestujte veškerou techniku</li>
        <li>Briefujte celý tým</li>
      </ul>
      
      <h2>Den konference</h2>
      <ul>
        <li>Dorazte s dostatečným předstihem</li>
        <li>Mějte připravený krizový plán</li>
        <li>Delegujte odpovědnosti</li>
        <li>Sbírejte zpětnou vazbu</li>
      </ul>
    `,
    coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    author: { name: "Prostormat Team", email: "team@prostormat.cz" },
    publishedAt: new Date("2023-12-28"),
    tags: '["Konference", "Checklist", "Plánování"]'
  },
  {
    id: "placeholder-5",
    title: "Jak ušetřit na pronájmu prostoru bez kompromisů",
    slug: "jak-usetrit-na-pronajmu-prostoru-bez-kompromisu",
    excerpt: "Praktické rady, jak získat kvalitní prostor za rozumnou cenu. Naučte se vyjednávat a najít skryté poklady mezi dostupnými prostory.",
    content: `
      <h2>Úspora na prostoru nemusí znamenat kompromisy</h2>
      <p>S chytrým přístupem můžete najít kvalitní prostor za skvělou cenu. Klíčem je vědět, kde hledat a jak vyjednávat.</p>
      
      <h2>Tipy pro úsporu nákladů</h2>
      <h3>1. Flexibilní termíny</h3>
      <p>Akce v méně populárních termínech (všední dny, mimo sezónu) často nabízejí lepší ceny.</p>
      
      <h3>2. Balíčkové nabídky</h3>
      <p>Často je výhodnější vzít balíček zahrnující prostor, catering a vybavení.</p>
      
      <h3>3. Dlouhodobé smlouvy</h3>
      <p>Pro pravidelné akce můžete vyjednat lepší podmínky při dlouhodobé spolupráci.</p>
      
      <h2>Kde hledat levnější prostory</h2>
      <ul>
        <li>Komunitní centra a kulturní domy</li>
        <li>Univerzitní prostory</li>
        <li>Nové prostory hledající první klienty</li>
        <li>Prostory mimo centrum města</li>
      </ul>
      
      <h2>Vyjednávací taktiky</h2>
      <ul>
        <li>Připravte si argumenty (mimo sezónu, dlouhodobá spolupráce)</li>
        <li>Buďte flexibilní s doplňkovými službami</li>
        <li>Požádejte o slevu při platbě předem</li>
        <li>Zvažte barter - nabídněte promo výměnou za slevu</li>
      </ul>
    `,
    coverImage: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
    author: { name: "Prostormat Team", email: "team@prostormat.cz" },
    publishedAt: new Date("2023-12-20"),
    tags: '["Rozpočet", "Úspory", "Tipy"]'
  },
  {
    id: "placeholder-6",
    title: "Udržitelné akce: Jak zorganizovat eco-friendly event",
    slug: "udrzitelne-akce-jak-zorganizovat-eco-friendly-event",
    excerpt: "Ochrana životního prostředí se týká i eventů. Zjistěte, jak zorganizovat akci s minimálním dopadem na přírodu a inspirovat účastníky k udržitelnému myšlení.",
    content: `
      <h2>Eco-friendly akce jsou budoucností</h2>
      <p>Udržitelnost se stává stále důležitějším faktorem při organizaci akcí. Účastníci oceňují přístup, který respektuje životní prostředí.</p>
      
      <h2>Principy udržitelné akce</h2>
      <h3>1. Minimalizace odpadu</h3>
      <p>Používejte opakovaně použitelné nebo kompostovatelné materiály. Vyhněte se jednorázovým plastům.</p>
      
      <h3>2. Místní dodavatelé</h3>
      <p>Podporujte lokální ekonomiku a snižte uhlíkovou stopu dopravy.</p>
      
      <h3>3. Digitalizace</h3>
      <p>Nahraďte papírové materiály digitálními alternativami - QR kódy, aplikace, e-maily.</p>
      
      <h2>Praktické tipy</h2>
      <ul>
        <li>Nabídněte veřejnou dopravu nebo carpooling</li>
        <li>Kompostujte organický odpad</li>
        <li>Vyberte catering s bio a lokálními produkty</li>
        <li>Používejte LED osvětlení</li>
        <li>Instalujte stanice na třídění odpadu</li>
      </ul>
      
      <h2>Komunikace s účastníky</h2>
      <p>Informujte účastníky o eco-friendly opatřeních a motivujte je k participaci. Mnoho lidí ocení možnost přispět k ochraně prostředí.</p>
      
      <h2>Měření dopadu</h2>
      <p>Sledujte a vyhodnocujte eco-metriky vaší akce - množství odpadu, spotřebu energie, způsoby dopravy účastníků.</p>
    `,
    coverImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop",
    author: { name: "Prostormat Team", email: "team@prostormat.cz" },
    publishedAt: new Date("2023-12-15"),
    tags: '["Udržitelnost", "Eco-friendly", "Trendy"]'
  }
]

async function getBlogPost(slug: string) {
  try {
    const post = await db.blogPost.findUnique({
      where: {
        slug,
        status: "published"
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })
    
    // If no post found in database, check placeholder posts
    if (!post) {
      const placeholderPost = placeholderPosts.find(p => p.slug === slug)
      return placeholderPost || null
    }
    
    return post
  } catch (error) {
    console.error("Error fetching blog post:", error)
    // In case of database error, check placeholder posts
    const placeholderPost = placeholderPosts.find(p => p.slug === slug)
    return placeholderPost || null
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const tags = post.tags ? JSON.parse(post.tags) : []

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Back to blog */}
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět na blog
            </Button>
          </Link>
        </div>

        {/* Article header */}
        <article className="prose prose-lg max-w-none">
          <header className="mb-8">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.publishedAt!).toLocaleDateString('cs-CZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            
            <Button variant="outline" size="sm" className="rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Share2 className="w-4 h-4 mr-2" />
              Sdílet
            </Button>
          </header>

          {/* Cover image */}
          {post.coverImage && (
            <div className="mb-8">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Article content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Article footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span>Autor: {post.author.name || post.author.email}</span>
            </div>
            <Link href="/blog">
              <Button variant="outline" className="rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zpět na blog
              </Button>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
} 