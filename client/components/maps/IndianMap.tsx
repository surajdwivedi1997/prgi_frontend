import React, { useState, useEffect, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { geoCentroid, geoPath } from "d3-geo";
import * as d3 from "d3-geo";

const INDIA_STATES = "/maps/india-states.json";
const INDIA_DISTRICTS = "/maps/state-jsons/district/india_district.geojson";
const TELANGANA_DISTRICTS = "/maps/state-jsons/district/telangana_district.geojson";

const colorPairs = [
  ["#fef3c7", "#fbbf24"],
  ["#dbeafe", "#60a5fa"],
  ["#d1fae5", "#34d399"],
  ["#e0e7ff", "#818cf8"],
  ["#fce7f3", "#f472b6"],
  ["#fed7aa", "#fb923c"],
  ["#fecdd3", "#fb7185"],
  ["#d9f99d", "#84cc16"],
  ["#bfdbfe", "#3b82f6"],
  ["#ede9fe", "#a78bfa"],
];

// ✅ Helper: return correct file for a given state
const getDistrictFile = (stateName: string) => {
  const fileMap: Record<string, string> = {
    Telangana: TELANGANA_DISTRICTS,
  };
  return fileMap[stateName] || INDIA_DISTRICTS;
};

export default function IndiaMap() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("selectedState") : null
  );
  const [filteredDistricts, setFilteredDistricts] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([80, 22]);
  const [mapScale, setMapScale] = useState(1000);
  const [zoom, setZoom] = useState(1);
  const [mapKey, setMapKey] = useState<number>(0);
  const [loadingStates, setLoadingStates] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 🆕 NEW: For backend district data
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [districtData, setDistrictData] = useState<any[]>([]);
  const [showDataPanel, setShowDataPanel] = useState(false);

  // 🧭 Restore last viewed state (if exists)
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("selectedState") : null;
    if (saved) {
      handleStateClick(saved);
    }
  }, []);

  // 🔄 Reset back to India map
  const handleReset = () => {
    setSelectedState(null);
    setSelectedDistrict(null);
    setFilteredDistricts([]);
    setDistrictData([]);
    setShowDataPanel(false);
    setMapCenter([80, 22]);
    setMapScale(1000);
    setZoom(1);
    setMapKey((k) => k + 1);
    if (typeof window !== "undefined") localStorage.removeItem("selectedState");
  };

  // 🏙️ When a state is clicked → load its district boundaries
  const handleStateClick = async (stateName: string) => {
    setSelectedState(stateName);
    if (typeof window !== "undefined") localStorage.setItem("selectedState", stateName);
    setLoadingStates(true);

    const districtFile = getDistrictFile(stateName);
    console.log(`📂 Fetching districts for ${stateName}: ${districtFile}`);

    try {
      const res = await fetch(districtFile);
      const data = await res.json();
      let features = data.features || [];

      // 🧩 Filter only the selected state (if not Telangana)
      if (stateName !== "Telangana") {
        const renameMap: Record<string, string> = {
          Uttarakhand: "Uttaranchal",
          Odisha: "Orissa",
          Puducherry: "Pondicherry",
        };

        const normalizedState = (renameMap[stateName] || stateName)
          .normalize("NFC")
          .trim()
          .toLowerCase();

        features = features.filter(
          (d: any) =>
            (d.properties?.NAME_1 || "")
              .normalize("NFC")
              .trim()
              .toLowerCase() === normalizedState
        );

        console.log(`🎯 Filtered ${features.length} districts for ${stateName}`);
      }

      setFilteredDistricts(features);

      // 🗺️ Calculate map center + scale
      if (features.length > 0) {
        const width = containerRef.current?.offsetWidth || window.innerWidth * 0.8;
        const height = containerRef.current?.offsetHeight || window.innerHeight * 0.6;

        const projection = d3.geoMercator().scale(400).translate([width / 2, height / 2]);
        const path = geoPath().projection(projection);
        const bounds = path.bounds({ type: "FeatureCollection", features });
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const x = (bounds[0][0] + bounds[1][0]) / 2;
        const y = (bounds[0][1] + bounds[1][1]) / 2;

        const padding = 1.2;
        const scale = Math.min(width / dx, height / dy) * 200 * padding;
        const center = projection.invert([x, y]) as [number, number];

        setMapCenter(center);
        setMapScale(scale);
        setZoom(1.2);
        setMapKey((k) => k + 1);
      } else {
        console.warn(`⚠️ No districts found for ${stateName}`);
      }
    } catch (err) {
      console.error("❌ Failed to load districts:", err);
    } finally {
      setLoadingStates(false);
    }
  };

  // 🆕 NEW: Fetch district data from backend when clicked
  const handleDistrictClick = async (geo: any) => {
    const districtName =
      geo?.properties?.D_N ||
      geo?.properties?.DISTRICT ||
      geo?.properties?.DIST_NAME ||
      geo?.properties?.Dt_Name ||
      geo?.properties?.NAME_2 ||
      geo?.properties?.NAME2 ||
      geo?.properties?.Name_2 ||
      geo?.properties?.DNAME ||
      geo?.properties?.dtname ||
      geo?.properties?.district ||
      `District`;

    const formattedDistrict = String(districtName).trim();
    const stateName = selectedState || geo?.properties?.NAME_1 || "Unknown";

    console.log(`📡 Fetching data for ${formattedDistrict}, ${stateName}`);
    setSelectedDistrict(formattedDistrict);
    setShowDataPanel(true);
    setDistrictData([]);

    try {
      const response = await fetch(
        `http://localhost:8080/api/registrations/by-location?state=${encodeURIComponent(
          stateName
        )}&district=${encodeURIComponent(formattedDistrict)}`
      );

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setDistrictData(data);
      console.log(`✅ Found ${data.length} registrations`);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
    }
  };

  const handleRecenter = () => {
    if (selectedState) handleStateClick(selectedState);
    else handleReset();
  };

  const renameDisplayMap: Record<string, string> = {
    Uttaranchal: "Uttarakhand",
    Orissa: "Odisha",
    Pondicherry: "Puducherry",
    "Arunanchal Pradesh": "Arunachal Pradesh",
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[85vh] flex flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800"
    >
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        {selectedState ? `${selectedState} District Map` : "India State Map"}
      </h1>

      {selectedState && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleReset}
          className="absolute top-20 left-10 px-4 py-2 bg-cyan-600 text-white rounded-lg shadow-lg hover:bg-cyan-700 transition-all z-50"
        >
          ← Back to India
        </motion.button>
      )}

      {/* 🔍 Zoom & Refresh controls */}
      <div className="absolute top-28 right-8 z-10 flex flex-col bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <button onClick={() => setZoom((z) => Math.min(z * 1.3, 8))} className="px-3 py-2 text-lg font-bold hover:bg-cyan-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 dark:text-white">+</button>
        <button onClick={() => setZoom((z) => Math.max(z / 1.3, 1))} className="px-3 py-2 text-lg font-bold hover:bg-cyan-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 dark:text-white">−</button>
        <button onClick={handleRecenter} className="px-3 py-2 text-sm font-semibold hover:bg-cyan-50 dark:hover:bg-gray-700 text-cyan-700 dark:text-cyan-400">⟳</button>
      </div>

      {/* 🗺️ Map Container with Colored Border - MAIN CHANGE HERE */}
      <div className="w-full flex justify-center items-center relative">
        {loadingStates && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-70 z-40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-3 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">Loading districts...</p>
            </div>
          </div>
        )}

        {/* ✨ NEW: Map Container with Colored Square Border - Smaller Box */}
        <div className="relative w-[82%] h-[75vh] border-3 border-cyan-500 dark:border-cyan-400 rounded-lg shadow-xl overflow-hidden">
          <ComposableMap
            key={mapKey}
            projection="geoMercator"
            projectionConfig={{ scale: mapScale, center: mapCenter }}
            style={{ width: "100%", height: "100%", cursor: "grab", transition: "all 0.5s ease-in-out" }}
          >
            <ZoomableGroup center={mapCenter} zoom={zoom}>
              {/* 🧭 India State View */}
              {!selectedState && (
                <Geographies geography={INDIA_STATES}>
                  {({ geographies }) =>
                    geographies.map((geo, i) => {
                      let name =
                        geo.properties.NAME_1 ||
                        geo.properties.st_nm ||
                        geo.properties.name ||
                        "Unknown";
                      if (renameDisplayMap[name]) name = renameDisplayMap[name];
                      const [base, dark] = colorPairs[i % colorPairs.length];
                      const centroid = geoCentroid(geo);
                      return (
                        <g key={geo.rsmKey} onMouseEnter={() => setHovered(name)} onMouseLeave={() => setHovered(null)} onClick={() => handleStateClick(name)} style={{ cursor: "pointer" }}>
                          <Geography 
                            geography={geo} 
                            style={{ 
                              default: { 
                                fill: base, 
                                stroke: "#1e293b", 
                                strokeWidth: 0.5,
                                outline: "none"
                              }, 
                              hover: { 
                                fill: dark,
                                outline: "none"
                              },
                              pressed: {
                                fill: dark,
                                outline: "none"
                              }
                            }} 
                          />
                          {centroid && (
                            <Marker coordinates={centroid}>
                              <text textAnchor="middle" alignmentBaseline="middle" fontSize={7 + zoom * 0.5} fill="#0f172a" fontWeight={600} style={{ pointerEvents: "none", textShadow: "0 1px 2px rgba(255,255,255,0.9), 0 -1px 2px rgba(255,255,255,0.9)" }}>{name}</text>
                            </Marker>
                          )}
                        </g>
                      );
                    })
                  }
                </Geographies>
              )}

              {/* 🏙️ District View */}
              {selectedState && filteredDistricts.length > 0 && (
                <Geographies geography={{ type: "FeatureCollection", features: filteredDistricts }}>
                  {({ geographies }) =>
                    geographies.map((geo, i) => {
                      let raw =
                        geo.properties.D_N ||
                        geo.properties.DISTRICT ||
                        geo.properties.DIST_NAME ||
                        geo.properties.Dt_Name ||
                        geo.properties.NAME_2 ||
                        geo.properties.NAME2 ||
                        geo.properties.Name_2 ||
                        geo.properties.DNAME ||
                        geo.properties.dtname ||
                        geo.properties.district ||
                        `District-${i}`;

                      raw = String(raw).trim().replace(/_/g, " ");
                      const districtName = raw
                        .toLowerCase()
                        .split(" ")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ");

                      const [base, dark] = colorPairs[i % colorPairs.length];
                      const centroid = geoCentroid(geo);

                      return (
                        <g key={geo.rsmKey} onMouseEnter={() => setHovered(districtName)} onMouseLeave={() => setHovered(null)} onClick={() => handleDistrictClick(geo)} style={{ cursor: "pointer" }}>
                          <Geography 
                            geography={geo} 
                            style={{ 
                              default: { 
                                fill: base, 
                                stroke: "#0f172a", 
                                strokeWidth: 0.2,
                                outline: "none"
                              }, 
                              hover: { 
                                fill: dark,
                                outline: "none"
                              },
                              pressed: {
                                fill: dark,
                                outline: "none"
                              }
                            }} 
                          />
                          {centroid && (
                            <Marker coordinates={centroid}>
                              <text textAnchor="middle" alignmentBaseline="middle" fontSize={6 + zoom * 0.3} fill="#0f172a" fontWeight={500} style={{ pointerEvents: "none", textShadow: "0 1px 2px rgba(255,255,255,0.8), 0 -1px 2px rgba(255,255,255,0.8)" }}>{districtName}</text>
                            </Marker>
                          )}
                        </g>
                      );
                    })
                  }
                </Geographies>
              )}
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </div>

      {/* 🧾 District Data Panel */}
      <AnimatePresence>
        {showDataPanel && selectedDistrict && (
          <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} className="absolute right-4 top-28 bottom-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-y-auto z-40">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{selectedDistrict}</h3>
                <p className="text-sm opacity-90">{selectedState}</p>
              </div>
              <button onClick={() => setShowDataPanel(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors">✕</button>
            </div>

            <div className="p-4">
              {districtData.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center">No records found.</p>
              ) : (
                <div className="space-y-4">
                  {districtData.map((record, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 hover:shadow-md transition"
                    >
                      <h4 className="font-bold text-cyan-700 dark:text-cyan-400 mb-2">
                        Record #{idx + 1}
                      </h4>

                      <table className="min-w-full text-sm text-gray-700 dark:text-gray-300">
                        <tbody>
                          {Object.entries(record).map(([key, value]) => (
                            <tr key={key} className="border-b border-gray-200 dark:border-gray-600">
                              <td className="font-semibold capitalize py-1 pr-3 text-gray-800 dark:text-gray-200">
                                {key.replace(/_/g, " ")}
                              </td>
                              <td className="py-1 text-gray-600 dark:text-gray-400">
                                {value !== null && value !== "" ? value.toString() : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✨ Hover Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }} className="absolute bottom-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg px-5 py-2 rounded-lg border-2 border-cyan-300 dark:border-cyan-600">
            <span className="font-semibold">{hovered}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}