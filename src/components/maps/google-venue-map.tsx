interface GoogleVenueMapProps {
  address: string
  venueName: string
  className?: string
}

export function GoogleVenueMap({ address, venueName, className = "" }: GoogleVenueMapProps) {
  const baseAddress = address?.trim() || "Praha, Česká republika"
  const hasCountry = /čes|czech|slovak|germany|austria/i.test(baseAddress)
  const mapAddress = hasCountry ? baseAddress : `${baseAddress}, Česká republika`

  // Encode the address for URL - using the basic Google Maps embed without API key
  const encodedAddress = encodeURIComponent(mapAddress)
  
  // Google Maps Embed URL (basic version that doesn't require API key)
  const mapUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed&z=16`
  
  return (
    <div className={`${className}`}>
      <div className="rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg bg-gray-100 hover:shadow-xl transition-shadow duration-300">
        <iframe
          src={mapUrl}
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-[300px]"
          title={`Mapa lokace: ${venueName}`}
        />
      </div>
    </div>
  )
}
