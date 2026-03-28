# Integração Mapbox — Plataforma Web Admin (Atlas)

Guia para integrar o Mapbox na plataforma web administrativa do Atlas, com foco no fluxo de **seleção de localização no mapa** para cadastro de eventos.

---

## Visão Geral do Fluxo

O administrador cadastra eventos diretamente no mapa. O padrão utilizado é o **"pin central fixo"** (estilo Uber):

1. Mapa renderizado com tema escuro
2. Pin fixo no centro da tela (não se move)
3. Admin arrasta o mapa até posicionar o local desejado embaixo do pin
4. Endereço é obtido via **reverse geocode** automaticamente
5. Admin confirma — coordenadas e endereço são enviados ao backend

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_MAPBOX_ACCESS_TOKEN` | Sim | Token público do Mapbox (para Vite/React web) |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Sim | Token público do Mapbox (para Next.js) |
| `VITE_API_URL` | Sim | URL base da API Atlas |

> Use apenas **uma** das variáveis de token dependendo do seu framework (`VITE_` para Vite/React, `NEXT_PUBLIC_` para Next.js).

O mesmo token já utilizado no app mobile pode ser reutilizado aqui — é o mesmo projeto Mapbox.

---

## Biblioteca Recomendada

Para web, **não** use `@rnmapbox/maps` (é exclusivo para React Native). Use:

```bash
npm install mapbox-gl
npm install -D @types/mapbox-gl  # se usar TypeScript
```

Ou, se preferir um wrapper React:

```bash
npm install react-map-gl mapbox-gl
```

---

## Estilos de Mapa Disponíveis

O Atlas usa os seguintes estilos já configurados:

| Estilo | URL | Uso |
|---|---|---|
| **Dark (recomendado para admin)** | `mapbox://styles/mapbox/dark-v11` | Tema escuro oficial Mapbox |
| **Atlas Custom** | `mapbox://styles/atlassynkdev/cmhm2zi8v002k01qserdu3mz8` | Estilo roxo customizado do Atlas |
| **Light** | `mapbox://styles/mapbox/light-v11` | Tema claro oficial Mapbox |

Para a plataforma admin, use o estilo **dark-v11** como padrão.

---

## Implementação com Mapbox GL JS (Vanilla / React)

### 1. Inicialização do Mapa

```typescript
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
// ou: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

const map = new mapboxgl.Map({
  container: 'map-container', // ID do elemento HTML
  style: 'mapbox://styles/mapbox/dark-v11',
  center: [-46.6333, -23.5505], // São Paulo como padrão
  zoom: 14,
});
```

### 2. Componente React — Seletor de Localização

```tsx
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface LocationResult {
  latitude: number;
  longitude: number;
  address: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationResult) => void;
  initialCoords?: [number, number]; // [lng, lat]
}

export function LocationPicker({ onLocationSelect, initialCoords }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [address, setAddress] = useState('');
  const [center, setCenter] = useState<[number, number]>(
    initialCoords ?? [-46.6333, -23.5505]
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center,
      zoom: 14,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Atualiza endereço quando o mapa para de mover
    map.on('moveend', async () => {
      const { lng, lat } = map.getCenter();
      setCenter([lng, lat]);
      const result = await reverseGeocode(lng, lat);
      setAddress(result);
    });

    mapRef.current = map;

    return () => map.remove();
  }, []);

  const reverseGeocode = async (lng: number, lat: number): Promise<string> => {
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=pt&limit=1`;

    const res = await fetch(url);
    const data = await res.json();

    return data.features?.[0]?.place_name ?? 'Endereço não encontrado';
  };

  const handleConfirm = () => {
    onLocationSelect({
      latitude: center[1],
      longitude: center[0],
      address,
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px' }}>
      {/* Mapa */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Pin fixo no centro */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -100%)',
        pointerEvents: 'none',
        zIndex: 10,
        fontSize: '40px',
      }}>
        📍
      </div>

      {/* Endereço detectado */}
      {address && (
        <div style={{
          position: 'absolute',
          bottom: 70,
          left: 16,
          right: 16,
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          padding: '10px 14px',
          borderRadius: 8,
          fontSize: 14,
        }}>
          {address}
        </div>
      )}

      {/* Botão confirmar */}
      <button
        onClick={handleConfirm}
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          padding: '14px',
          background: '#f75e36',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontWeight: 'bold',
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        Confirmar Localização
      </button>
    </div>
  );
}
```

### 3. Busca de Endereço (Forward Geocoding)

Para permitir que o admin busque um lugar pelo nome:

```typescript
async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&language=pt&limit=5&country=BR`;

  const res = await fetch(url);
  const data = await res.json();

  return data.features.map((f: any) => ({
    id: f.id,
    place_name: f.place_name,
    center: f.center as [number, number], // [lng, lat]
  }));
}

// Voar o mapa para o lugar selecionado:
map.flyTo({ center: suggestion.center, zoom: 16 });
```

---

## Implementação com react-map-gl (alternativa declarativa)

```tsx
import Map, { NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState } from 'react';

export function EventLocationMap() {
  const [viewState, setViewState] = useState({
    longitude: -46.6333,
    latitude: -23.5505,
    zoom: 14,
  });

  return (
    <div style={{ position: 'relative', height: 500 }}>
      <Map
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
      </Map>

      {/* Pin central fixo */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -100%)',
        pointerEvents: 'none',
        fontSize: 40,
      }}>
        📍
      </div>
    </div>
  );
}
```

---

## APIs Mapbox Utilizadas

### Reverse Geocoding (coordenadas → endereço)

```
GET https://api.mapbox.com/geocoding/v5/mapbox.places/{lng},{lat}.json
  ?access_token={TOKEN}
  &language=pt
  &limit=1
```

### Forward Geocoding (texto → coordenadas)

```
GET https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json
  ?access_token={TOKEN}
  &language=pt
  &limit=5
  &country=BR
```

---

## Payload para o Backend

Ao confirmar o local no mapa, enviar para a API Atlas:

```typescript
interface EventLocationPayload {
  latitude: number;   // ex: -23.5505
  longitude: number;  // ex: -46.6333
  address?: string;   // ex: "Av. Paulista, 1000 - Bela Vista, São Paulo"
}
```

---

## Obtendo o Token Mapbox

1. Acesse [account.mapbox.com](https://account.mapbox.com)
2. Vá em **Access Tokens**
3. O **Default public token** já está configurado no projeto
4. Para a plataforma admin, você pode usar o mesmo token ou criar um token específico com escopo restrito a `styles:read` e `geocoding`

---

## CSS Obrigatório

O Mapbox GL JS requer que seu CSS seja importado. Adicione no entry point da aplicação:

```typescript
import 'mapbox-gl/dist/mapbox-gl.css';
```

Ou via CDN no HTML:

```html
<link href="https://api.mapbox.com/mapbox-gl-js/v3.x.x/mapbox-gl.css" rel="stylesheet" />
```

---

## Checklist de Integração

- [ ] Token Mapbox configurado na variável de ambiente (`VITE_MAPBOX_ACCESS_TOKEN` ou `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`)
- [ ] `mapbox-gl` instalado como dependência
- [ ] CSS do Mapbox GL importado
- [ ] Mapa inicializado com estilo `mapbox://styles/mapbox/dark-v11`
- [ ] Pin central fixo implementado (elemento HTML sobreposto ao mapa)
- [ ] Reverse geocode chamado no evento `moveend` do mapa
- [ ] Busca por endereço integrada (forward geocoding)
- [ ] Payload `{ latitude, longitude, address }` enviado ao endpoint de criação de eventos
