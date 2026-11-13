import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

// Fix Leaflet icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom pin marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Click listener inside Leaflet context
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Recenter component
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MUMBAI_PRESETS = [
  { name: 'Bandra West', lat: 19.0596, lng: 72.8295, address: 'Linking Road, Bandra West, Mumbai 400050' },
  { name: 'Andheri East', lat: 19.1197, lng: 72.8684, address: 'MIDC Road, Andheri East, Mumbai 400093' },
  { name: 'Colaba / Fort', lat: 18.922, lng: 72.8347, address: 'Near Gateway of India, Colaba, Mumbai 400001' },
  { name: 'Powai Lake', lat: 19.1176, lng: 72.906, address: 'Central Ave, Hiranandani, Powai, Mumbai 400076' },
  { name: 'Dadar Station', lat: 19.0178, lng: 72.8478, address: 'Swami Gyan Jivandas Marg, Dadar, Mumbai 400014' },
];

export const LocationPicker = ({
  initialLat = 19.0596,
  initialLng = 72.8295,
  initialAddress = '',
  onLocationChange,
}) => {
  const [position, setPosition] = useState({ lat: initialLat, lng: initialLng });
  const [address, setAddress] = useState(initialAddress);

  const handleSelect = (lat, lng, presetAddress = null) => {
    const roundedLat = parseFloat(lat.toFixed(6));
    const roundedLng = parseFloat(lng.toFixed(6));
    setPosition({ lat: roundedLat, lng: roundedLng });

    const computedAddress =
      presetAddress || `Pinned Location: Lat ${roundedLat}, Lng ${roundedLng}, Mumbai`;
    setAddress(computedAddress);

    if (onLocationChange) {
      onLocationChange({
        lat: roundedLat,
        lng: roundedLng,
        address: computedAddress,
      });
    }
  };

  const handlePreset = (preset) => {
    handleSelect(preset.lat, preset.lng, preset.address);
  };

  return (
    <div className="space-y-3">
      {/* Map Header / Help */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <span className="text-charcoal-600 dark:text-charcoal-300 flex items-center gap-1.5 font-medium">
          <MapPin className="w-4 h-4 text-terracotta-500" />
          <span>Click anywhere on the map to pin exact coordinates</span>
        </span>

        {/* Quick Mumbai Presets */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] text-charcoal-400 self-center">Presets:</span>
          {MUMBAI_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handlePreset(p)}
              className="text-[11px] px-2 py-0.5 rounded-md bg-sand-200/80 hover:bg-sand-300 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 text-charcoal-700 dark:text-sand-200 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-sand-300 dark:border-charcoal-700 shadow-inner relative z-0">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <ChangeView center={[position.lat, position.lng]} zoom={13} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[position.lat, position.lng]} icon={customIcon} />
          <MapClickHandler onLocationSelect={handleSelect} />
        </MapContainer>
      </div>

      {/* Coordinate & Address Input Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-medium text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider mb-1">
            Street Address or Landmark Description
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (onLocationChange) {
                onLocationChange({
                  lat: position.lat,
                  lng: position.lng,
                  address: e.target.value,
                });
              }
            }}
            placeholder="e.g. Opposite Marks & Spencer, Hill Road, Bandra West"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider mb-1">
            Coordinates (Lat, Lng)
          </label>
          <div className="px-3.5 py-2 text-xs rounded-xl bg-sand-100 dark:bg-charcoal-700/60 border border-sand-200 dark:border-charcoal-700 text-charcoal-700 dark:text-sand-300 font-mono flex items-center justify-between">
            <span>
              {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-semibold">
              Pinned ✓
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
