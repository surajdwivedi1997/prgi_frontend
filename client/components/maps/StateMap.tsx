import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";

const stateFiles: Record<string, string> = {
  Maharashtra: "/maps/state-jsons/maharashtra.json",
  "Uttar Pradesh": "/maps/state-jsons/uttar-pradesh.json",
  "Tamil Nadu": "/maps/state-jsons/tamil-nadu.json",
  Gujarat: "/maps/state-jsons/gujarat.json",
  Delhi: "/maps/state-jsons/delhi.json",
};

export default function StateMap() {
  const { stateName } = useParams();
  const navigate = useNavigate();

  const geoUrl = stateFiles[stateName || ""] || null;

  if (!geoUrl)
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-red-600">
          District map not available for {stateName}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-cyan-600 text-white px-4 py-2 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <div className="w-full h-screen flex flex-col items-center bg-gradient-to-b from-white to-blue-50">
      <div className="flex justify-between w-full max-w-5xl mt-4 px-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {stateName} – District Map
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        >
          ⟵ Back
        </button>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 4500, center: [78, 22] }}
        style={{ width: "90%", height: "85vh" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const district =
                geo.properties.NAME_2 ||
                geo.properties.district ||
                geo.properties.DISTRICT ||
                "Unknown";

              const centroid = geoCentroid(geo);

              return (
                <React.Fragment key={geo.rsmKey}>
                  <Geography
                    geography={geo}
                    style={{
                      default: {
                        fill: "#bae6fd",
                        stroke: "#0c4a6e",
                        strokeWidth: 0.4,
                        outline: "none",
                      },
                      hover: { fill: "#0ea5e9", cursor: "pointer" },
                    }}
                  />
                  {centroid && (
                    <Marker coordinates={centroid}>
                      <text
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fontSize={6}
                        fill="#1e293b"
                        style={{
                          fontWeight: 600,
                          textShadow:
                            "0 1px 2px rgba(255,255,255,0.8), 0 -1px 2px rgba(255,255,255,0.8)",
                        }}
                      >
                        {district}
                      </text>
                    </Marker>
                  )}
                </React.Fragment>
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}