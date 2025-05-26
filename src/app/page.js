'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_KEY = process.env.OPENAQ_API_KEY;

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

  const handleClick = () => {
    router.push('/historical');
  };

  const handleClick2 = () => {
    router.push('/select-station');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6 md:px-12 font-sans">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          London Air Quality – NO₂ & O₃
        </h1>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Select Station:
          </label>

          {loadingStations ? (
            <div className="flex items-center space-x-2 text-blue-600 font-medium">
              <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.372 0 0 5.372 0 12h4z" />
              </svg>
              Loading stations...
            </div>
          ) : (
            <select
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const station = stations.find(s => s.id === parseInt(e.target.value));
                setSelectedStation(station);
                fetchReadings(station);
              }}
            >
              <option value="">-- Select --</option>
              {stations.map(station => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {loadingReadings && selectedStation && (
          <div className="flex items-center space-x-2 text-gray-600 mb-6">
            <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.372 0 0 5.372 0 12h4z" />
            </svg>
            Fetching latest NO₂ and O₃ readings...
          </div>
        )}

        {!loadingReadings && readings.no2 && readings.o3 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">
              Latest Readings:
            </h2>
            <p className="text-gray-800 mb-2">
              <strong>NO₂:</strong> {readings.no2.value} {readings.no2.unit} <br />
              <span className="text-sm text-gray-500">at {readings.no2.datetime}</span>
            </p>
            <p className="text-gray-800">
              <strong>O₃:</strong> {readings.o3.value} {readings.o3.unit} <br />
              <span className="text-sm text-gray-500">at {readings.o3.datetime}</span>
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleClick}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            View Historical Data
          </button>
          <button
            onClick={handleClick2}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            View Stations on Map
          </button>
        </div>
      </div>
    </div>
  );
}
