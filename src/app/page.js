'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const AQI_COLORS = {
  good: 'bg-green-100 text-green-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  unhealthy: 'bg-red-100 text-red-800',
};

const getStatus = (value) => {
  if (value < 50) return 'good';
  if (value < 100) return 'moderate';
  return 'unhealthy';
};

export default function Home() {
  const router = useRouter();
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [readings, setReadings] = useState({ no2: null, o3: null });
  const [loadingStations, setLoadingStations] = useState(true);
  const [loadingReadings, setLoadingReadings] = useState(false);

  useEffect(() => {
    async function fetchStations() {
      setLoadingStations(true);
      const res = await fetch("/api/stations");
      const data = await res.json();
      const filtered = data.results.filter(
        (loc) =>
          loc.sensors?.some((s) => s.parameter?.name === "no2") &&
          loc.sensors?.some((s) => s.parameter?.name === "o3")
      );
      setStations(filtered);
      setLoadingStations(false);
    }
    fetchStations();
  }, []);

  async function fetchReadings(station) {
    setLoadingReadings(true);
    const res = await fetch(`/api/latest-readings/${station.id}`);
    const data = await res.json();

    const no2Sensor = station.sensors.find(s => s.parameter?.name === 'no2');
    const o3Sensor = station.sensors.find(s => s.parameter?.name === 'o3');

    const no2 = data.results.find(m => m.sensorsId === no2Sensor.id);
    const o3 = data.results.find(m => m.sensorsId === o3Sensor.id);

    setReadings({
      no2: no2 ? {
        value: no2.value,
        unit: 'µg/m³',
        datetime: no2.datetime.local || no2.datetime.utc
      } : null,
      o3: o3 ? {
        value: o3.value,
        unit: 'µg/m³',
        datetime: o3.datetime.local || o3.datetime.utc
      } : null
    });
    setLoadingReadings(false);
  }

  const handleClick = () => router.push('/historical');
  const handleClick2 = () => router.push('/select-station');

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-white to-green-100 text-gray-800 p-6 font-sans">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <motion.h1 
          className="text-4xl sm:text-5xl font-extrabold text-blue-800 mb-4"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        >
          🌿 London Air Quality Dashboard
        </motion.h1>
        <p className="text-lg text-gray-700">
          Track NO₂ and O₃ levels across various stations in London using real-time OpenAQ data.
        </p>
      </div>


      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 backdrop-blur-md bg-opacity-80 border border-gray-200">

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Select a Monitoring Station</label>
          {loadingStations ? (
            <div className="animate-pulse text-blue-600">⏳ Loading stations...</div>
          ) : (
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
              onChange={(e) => {
                const station = stations.find(s => s.id === parseInt(e.target.value));
                setSelectedStation(station);
                fetchReadings(station);
              }}
            >
              <option value="">-- Choose Station --</option>
              {stations.map(station => (
                <option key={station.id} value={station.id}>{station.name}</option>
              ))}
            </select>
          )}
        </div>

        {loadingReadings && selectedStation && (
          <div className="text-center text-blue-600 animate-pulse">🔄 Fetching latest readings...</div>
        )}

        {!loadingReadings && readings.no2 && readings.o3 && (
          <motion.div 
            className="grid sm:grid-cols-2 gap-4 mt-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            {['no2', 'o3'].map(param => {
              const data = readings[param];
              const status = getStatus(data.value);
              return (
                <div
                  key={param}
                  className={`rounded-xl p-4 ${AQI_COLORS[status]} shadow-md border`}
                >
                  <h3 className="text-lg font-bold uppercase">{param}</h3>
                  <p className="text-2xl font-semibold">{data.value} {data.unit}</p>
                  <p className="text-sm text-gray-600">⏰ {data.datetime}</p>
                  <p className="mt-2 text-xs font-medium uppercase">Status: {status}</p>
                </div>
              );
            })}
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={handleClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow-md"
          >
            📊 View Historical Trends
          </button>
          <button
            onClick={handleClick2}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow-md"
          >
            🗺️ View Stations on Map
          </button>
        </div>
      </div>
    </div>
  );
}
