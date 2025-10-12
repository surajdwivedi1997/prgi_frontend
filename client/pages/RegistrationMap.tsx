import React from "react";
import Header from "../components/layout/Header";
import IndiaMap from "../components/maps/IndianMap";

const RegistrationMap: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Registration Details - Interactive India Map
        </h1>
        <IndiaMap />
      </main>
    </div>
  );
};

export default RegistrationMap;