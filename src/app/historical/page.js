'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function Historical({ searchParams }) {
  const [station, setStation] = useState(null);
  const [period, setPeriod] = useState(7);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStation({
      id: 154,
      sensors: [
        { id: 241, parameter: { name: 'no2' } },
        { id: 246, parameter: { name: 'o3' } }
      ]
    });
  }, []);

  useEffect(() => {
    if (!station) return;

    const fetchData = async () => {
      setLoading(true);

      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - period);

      const formatDate = (d) => d.toISOString();

      const sensorNo2 = station.sensors.find(s => s.parameter.name === 'no2');
      const sensorO3 = station.sensors.find(s => s.parameter.name === 'o3');

      const fetchSensorData = async (sensorId) => {
        const res = await fetch(
          `/api/historical-readings/${sensorId}?datetime_from=${formatDate(from)}&datetime_to=${formatDate(to)}&limit=${period}`
        );
        const data = await res.json();
        return data.results || [];
      };

      const dataNo2Raw = await fetchSensorData(sensorNo2.id);
      const dataO3Raw = await fetchSensorData(sensorO3.id);

      const mapByDate = (data) => {
        const map = new Map();
        data.forEach(item => {
          const localDate = item.period?.datetimeFrom?.local?.split('T')[0];
          if (localDate) {
            map.set(localDate, item.value);
          }
        });
        return map;
      };

      const mapNo2 = mapByDate(dataNo2Raw);
      const mapO3 = mapByDate(dataO3Raw);

      const combined = [];
      for (let i = 0; i < period; i++) {
        const d = new Date();
        d.setDate(to.getDate() - (period - 1 - i));
        const dateStr = d.toISOString().split('T')[0];
        combined.push({
          date: dateStr,
          no2: mapNo2.get(dateStr) ?? null,
          o3: mapO3.get(dateStr) ?? null
        });
      }

      setChartData(combined);
      setLoading(false);
    };

    fetchData();
  }, [station, period]);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6 md:px-12 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Historical Air Quality Data
        </h1>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Period:
          </label>
          <select
            className="w-full sm:w-64 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={period}
            onChange={e => setPeriod(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-6">
            <svg className="animate-spin h-6 w-6 text-blue-600 mr-2" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.372 0 0 5.372 0 12h4z" />
            </svg>
            <span className="text-blue-600 font-medium">Loading data...</span>
          </div>
        )}

        {!loading && chartData.length > 0 && (
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="no2"
                  stroke="#8884d8"
                  name="NO₂ (µg/m³)"
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="o3"
                  stroke="#82ca9d"
                  name="O₃ (µg/m³)"
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
