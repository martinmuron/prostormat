export default function Head() {
  const title = "Event Board | ProstorMat"
  const description =
    "Aktuální Event Board s poptávkami na event prostory v Praze i dalších městech. Získejte kontakty na organizátory a reagujte na nové příležitosti."
  const url = "https://www.prostormat.cz/event-board"

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
