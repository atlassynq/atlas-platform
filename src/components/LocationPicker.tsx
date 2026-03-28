import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Search } from 'lucide-react';

const TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;
const DEFAULT_CENTER: [number, number] = [-34.877, -8.047]; // Recife

export interface LocationResult {
  latitude: number;
  longitude: number;
  address: string;
}

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

interface LocationPickerProps {
  initialCoords?: [number, number]; // [lng, lat]
  onLocationSelect: (result: LocationResult) => void;
}

function LocationPicker({ initialCoords, onLocationSelect }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [center, setCenter] = useState<[number, number]>(
    initialCoords ?? DEFAULT_CENTER
  );
  const [isGeocoding, setIsGeocoding] = useState(false);

  const reverseGeocode = async (lng: number, lat: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${TOKEN}&language=pt&limit=1`
      );
      const data = await res.json();
      setAddress(data.features?.[0]?.place_name ?? '');
    } catch {
      // silently fail
    } finally {
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    mapboxgl.accessToken = TOKEN;

    const startCenter = initialCoords ?? DEFAULT_CENTER;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: startCenter,
      zoom: 14,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('moveend', () => {
      const { lng, lat } = map.getCenter();
      setCenter([lng, lat]);
      reverseGeocode(lng, lat);
    });

    mapRef.current = map;

    if (initialCoords) {
      reverseGeocode(initialCoords[0], initialCoords[1]);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${TOKEN}&language=pt&limit=5&country=BR`
        );
        const data = await res.json();
        setSuggestions(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data.features ?? []).map((f: any) => ({
            id: f.id,
            place_name: f.place_name,
            center: f.center as [number, number],
          }))
        );
      } catch {
        setSuggestions([]);
      }
    }, 400);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    mapRef.current?.flyTo({ center: suggestion.center, zoom: 16 });
    setSearchQuery(suggestion.place_name);
    setSuggestions([]);
  };

  const handleConfirm = () => {
    if (!address || isGeocoding) return;
    onLocationSelect({
      latitude: center[1],
      longitude: center[0],
      address,
    });
  };

  return (
    <div className="space-y-2">
      {/* Busca */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Buscar endereço ou local..."
          value={searchQuery}
          onChange={handleSearchChange}
          onBlur={() => setTimeout(() => setSuggestions([]), 150)}
          className="w-full h-10 pl-9 pr-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/30"
        />
        {suggestions.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl bg-[#111111] border border-white/10 overflow-hidden shadow-2xl">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={() => handleSuggestionClick(s)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 border-b border-white/5 last:border-0 truncate"
              >
                {s.place_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mapa */}
      <div
        className="relative rounded-xl overflow-hidden border border-white/10"
        style={{ height: 320 }}
      >
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Pin fixo no centro */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 10,
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
          }}
        >
          <MapPin size={36} className="text-[#FF4B8A]" fill="#FF4B8A40" />
        </div>

        {/* Chip de endereço */}
        <div className="absolute bottom-3 left-3 right-12 z-10">
          <div className="px-3 py-2 rounded-xl bg-black/80 backdrop-blur-sm border border-white/10 text-xs text-gray-200 truncate">
            {isGeocoding
              ? 'Buscando endereço...'
              : address || 'Arraste o mapa para posicionar'}
          </div>
        </div>
      </div>

      {/* Botão confirmar */}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={!address || isGeocoding}
        className="w-full py-2.5 rounded-xl text-sm font-semibold
                   bg-gradient-to-r from-[#FF8A3C] via-[#FF4B8A] to-[#6F3AFF]
                   text-white shadow-lg shadow-[#6F3AFF]/40
                   hover:scale-[1.01] active:scale-[0.99] transition-transform
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100"
      >
        Confirmar localização
      </button>
    </div>
  );
}

export default LocationPicker;
