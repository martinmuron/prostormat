export default function Head() {
  const title = "Nová poptávka na Event Board | ProstorMat"
  const description =
    "Vytvořte novou poptávku na Event Boardu a oslovte provozovatele event prostorů napřímo. Přidejte detaily své akce během pár minut."
  const url = "https://www.prostormat.cz/event-board/novy"

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow" />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </>
  )
}
