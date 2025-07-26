interface GoogleVenueMapProps {
  address: string
  venueName: string
  className?: string
}

export function GoogleVenueMap({ address, venueName, className = "" }: GoogleVenueMapProps) {
  // Encode the address for URL - using the basic Google Maps embed without API key
  const encodedAddress = encodeURIComponent(address)
  
  // Google Maps Embed URL (basic version that doesn't require API key)
  const mapUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed&z=16`
  
  return (
    <div className={`${className}`}>
      <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg bg-gray-100 hover:shadow-xl transition-shadow duration-300">
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
        
        {/* Custom overlay with venue info - positioned to not interfere with Google controls */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200 max-w-[250px] z-10">
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mt-0.5 flex-shrink-0"></div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1 leading-tight">{venueName}</h4>
              <p className="text-xs text-gray-600 leading-tight">{address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}