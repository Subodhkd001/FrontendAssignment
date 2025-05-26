'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'; 

const StationMapSelector = dynamic(() => import('../components/StationMapSelector'), {
  ssr: false,
});

export default function SelectStationPage() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStations() {
      try {
        const res = await fetch('/api/stations');
        const data = await res.json();

        const stationsFormatted = (data.results || []).map(station => ({
          id: station.id,
          name: station.name,
          latitude: station.coordinates?.latitude,
          longitude: station.coordinates?.longitude,
        })).filter(station => station.latitude && station.longitude);

        setStations(stationsFormatted);
      } catch (error) {
        console.error('Failed to fetch stations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStations();
  }, []);

  const handleSelect = (station) => {
    setSelectedStation(station);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Air Quality Monitoring Stations</h1>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <svg className="animate-spin h-6 w-6 text-blue-600 mr-2" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.372 0 0 5.372 0 12h4z" />
          </svg>
          <span className="text-blue-600 font-medium">Loading stations...</span>
        </div>
      ) : (
        <>
          <StationMapSelector stations={stations} onSelect={handleSelect} />
          {selectedStation && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold">Selected Station:</h2>
              <p>
                <strong>{selectedStation.name}</strong> (ID: {selectedStation.id})
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
