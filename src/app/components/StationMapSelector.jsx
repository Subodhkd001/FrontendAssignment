'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';


import 'leaflet/dist/leaflet.css';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function StationMapSelector({ stations, onSelect }) {
  const [selectedStation, setSelectedStation] = useState(null);

  const londonCenter = [51.5074, -0.1278];
  const zoomLevel = 11;

  const handleMarkerClick = (station) => {
    setSelectedStation(station);
    if (onSelect) onSelect(station);
    // Optionally save selection to localStorage or global state here
    localStorage.setItem('selectedStation', JSON.stringify(station));
  };

  return (
    <MapContainer
      center={londonCenter}
      zoom={zoomLevel}
      style={{ height: '600px', width: '100%' }}
      scrollWheelZoom={true}
    >
      <ChangeView center={selectedStation ? [selectedStation.latitude, selectedStation.longitude] : londonCenter} zoom={zoomLevel} />
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stations.map((station) => (
        <Marker
          key={station.id}
          position={[station.latitude, station.longitude]}
          eventHandlers={{
            click: () => handleMarkerClick(station),
          }}
        >
          <Popup>
            <div>
              <strong>{station.name}</strong>
              <br />
              ID: {station.id}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
