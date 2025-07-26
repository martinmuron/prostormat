'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icon with our brand colors
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
        "></div>
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid #1d4ed8;
        "></div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  })
}

interface VenueMapProps {
  address: string
  venueName: string
  coordinates?: [number, number] // [lat, lng]
  className?: string
}

// Prague coordinates as fallback
const PRAGUE_CENTER: [number, number] = [50.0755, 14.4378]

// Function to geocode address (simplified - in production you'd use a geocoding service)
const getCoordinatesFromAddress = (address: string): [number, number] => {
  // For demo purposes, map common Prague addresses to approximate coordinates
  const addressCoordinates: Record<string, [number, number]> = {
    'Kampa Island 1, Praha 1': [50.0830, 14.4081],
    'Kampa Island 2, Praha 1': [50.0825, 14.4075],
    'Národní 20, Praha 1': [50.0816, 14.4181],
    'Wenceslas Square 14, Praha 1': [50.0813, 14.4263],
    'Thámova 190, Praha 8': [50.0908, 14.4525],
    'Holečkova 39, Praha 5': [50.0694, 14.4039],
    'Náměstí Míru 15, Praha 2': [50.0753, 14.4393],
    'Pařížská 30, Praha 1': [50.0908, 14.4172],
    'Letná Park 5, Praha 7': [50.0989, 14.4172],
    'Karlovo náměstí 40, Praha 2': [50.0766, 14.4175],
    'Vinohrady Square 25, Praha 3': [50.0780, 14.4500],
    'Malá Strana 18, Praha 1': [50.0870, 14.4037],
  }
  
  return addressCoordinates[address] || PRAGUE_CENTER
}

export function VenueMap({ address, venueName, coordinates, className = "" }: VenueMapProps) {
  const mapRef = useRef<L.Map>(null)
  
  // Use provided coordinates or geocode the address
  const mapCoordinates = coordinates || getCoordinatesFromAddress(address)
  
  useEffect(() => {
    // Custom CSS for the map to match our design
    const style = document.createElement('style')
    style.textContent = `
      .venue-map .leaflet-container {
        border-radius: 1rem;
        border: 2px solid #e5e7eb;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      
      .venue-map .leaflet-control-zoom {
        border: none !important;
        border-radius: 0.75rem !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        overflow: hidden;
      }
      
      .venue-map .leaflet-control-zoom a {
        background: white !important;
        color: #374151 !important;
        border: none !important;
        font-size: 18px !important;
        font-weight: 600 !important;
        line-height: 30px !important;
        width: 34px !important;
        height: 34px !important;
        transition: all 0.2s ease !important;
      }
      
      .venue-map .leaflet-control-zoom a:hover {
        background: #f3f4f6 !important;
        color: #1f2937 !important;
      }
      
      .venue-map .leaflet-popup-content-wrapper {
        border-radius: 1rem !important;
        padding: 0 !important;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        border: 2px solid #e5e7eb !important;
      }
      
      .venue-map .leaflet-popup-content {
        margin: 0 !important;
        padding: 1rem !important;
        background: linear-gradient(135deg, #f8fafc, #f1f5f9) !important;
        border-radius: 1rem !important;
      }
      
      .venue-map .leaflet-popup-tip {
        background: #f1f5f9 !important;
        border: 2px solid #e5e7eb !important;
        border-top: none !important;
        border-left: none !important;
      }
      
      .custom-div-icon {
        background: none !important;
        border: none !important;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className={`venue-map ${className}`}>
      <MapContainer
        center={mapCoordinates}
        zoom={16}
        style={{ height: '300px', width: '100%' }}
        ref={mapRef}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker 
          position={mapCoordinates} 
          icon={createCustomIcon()}
        >
          <Popup>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">{venueName}</h4>
              <p className="text-sm text-gray-600 mb-3">{address}</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-blue-600 font-medium">Venue Location</span>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}