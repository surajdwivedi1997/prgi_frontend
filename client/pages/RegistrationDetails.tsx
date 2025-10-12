import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import { Search } from "lucide-react";

interface Registration {
  id: number;
  old_registration_no: string;
  New_registration_no: string;
  title_name: string;
  title_code: string;
  owner_name: string;
  languages: string;
  periodicity_period: string;
  Newregistration_registration_type: string;
  NewEdition_registration_type: string;
  RevisedEdition_registration_type: string;
  state_name: string;
  district_name: string;
  application_approved_date: string;
  financial_year: string;
  e_file_no: string;
  annual_statement_current_status: string;
  penalty_due: number;
}

const columnNames = [
  { key: "old_registration_no", label: "Old Registration No" },
  { key: "New_registration_no", label: "New Registration No" },
  { key: "title_name", label: "Title Name" },
  { key: "title_code", label: "Title Code" },
  { key: "owner_name", label: "Owner Name" },
  { key: "languages", label: "Languages" },
  { key: "periodicity_period", label: "Periodicity Period" },
  { key: "Newregistration_registration_type", label: "New Registration Type" },
  { key: "NewEdition_registration_type", label: "New Edition Type" },
  { key: "RevisedEdition_registration_type", label: "Revised Edition Type" },
  { key: "state_name", label: "State Name" },
  { key: "district_name", label: "District Name" },
  { key: "application_approved_date", label: "Application Approved Date" },
  { key: "financial_year", label: "Financial Year" },
  { key: "e_file_no", label: "E-File No" },
  { key: "annual_statement_current_status", label: "Annual Statement Status" },
  { key: "penalty_due", label: "Penalty Due" },
];

export default function RegistrationDetails() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredData, setFilteredData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showData, setShowData] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [financialYears, setFinancialYears] = useState<string[]>([]);

  useEffect(() => {
    loadRegistrationData();
  }, []);

  async function handleSearchQueryChange(value: string) {
    setSearchQuery(value);
    
    // Auto-fetch financial years for matching registrations
    if (value.trim().length >= 3) {
      try {
        const response = await fetch(
          `http://localhost:8080/api/registrations/search?query=${encodeURIComponent(value.trim())}`
        );
        
        if (response.ok) {
          const results = await response.json();
          if (results.length > 0) {
            // Extract unique years from search results only
            const matchingYears = [...new Set(results.map((r: Registration) => r.financial_year).filter(Boolean))];
            setFinancialYears(matchingYears.sort());
            
            // Auto-select the first year
            if (results[0].financial_year) {
              console.log("🎯 Auto-detected financial year:", results[0].financial_year);
              setSelectedYear(results[0].financial_year);
            }
          } else {
            // No results found, reset to all years
            loadAllFinancialYears();
            setSelectedYear("");
          }
        }
      } catch (error) {
        console.error("Failed to auto-fetch year:", error);
      }
    } else if (value.trim().length === 0) {
      // Reset to all years when search is cleared
      loadAllFinancialYears();
      setSelectedYear("");
    }
  }

  async function handleYearChange(year: string) {
    setSelectedYear(year);
    // Don't automatically search - wait for user to click Search button
  }

  async function loadAllFinancialYears() {
    try {
      const response = await fetch("http://localhost:8080/api/registrations");
      if (response.ok) {
        const data = await response.json();
        const years = [...new Set(data.map((reg: Registration) => reg.financial_year).filter(Boolean))];
        setFinancialYears(years.sort());
      }
    } catch (error) {
      console.error("Failed to load financial years:", error);
    }
  }

  async function loadRegistrationData() {
    try {
      console.log("📋 Loading all registrations...");
      const response = await fetch("http://localhost:8080/api/registrations");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Loaded registrations:", data.length);
      setRegistrations(data);
      
      // Extract unique financial years
      const years = [...new Set(data.map((reg: Registration) => reg.financial_year).filter(Boolean))];
      setFinancialYears(years.sort());
    } catch (error) {
      console.error("❌ Failed to load registration data:", error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim() && !selectedYear) {
      alert("Please enter a search term or select a financial year");
      return;
    }

    await handleSearchWithParams(searchQuery, selectedYear);
  }

  async function handleSearchWithParams(query: string, year: string) {
    console.log("🔍 Searching for:", query, "Year:", year);
    setIsFlipping(true);

    try {
      let url = `http://localhost:8080/api/registrations/search?query=${encodeURIComponent(query || '')}`;
      if (year) {
        url += `&year=${encodeURIComponent(year)}`;
      }
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const filtered = await response.json();
      console.log("✅ Search results:", filtered);
      
      if (filtered.length === 0) {
        alert("No registrations found for the selected criteria");
        setIsFlipping(false);
        return;
      }
      
      // Wait for flip animation to complete before showing data
      setTimeout(() => {
        setFilteredData(filtered);
        setShowData(true);
        setTimeout(() => setIsFlipping(false), 50);
      }, 350);
      
    } catch (error) {
      console.error("❌ Search error:", error);
      alert("Failed to search registrations");
      setIsFlipping(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .flip-card {
          perspective: 1000px;
        }
        
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          backface-visibility: hidden;
        }
        
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
              Registration Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Search and view newspaper registration information
            </p>
          </div>

          <Card className="p-6 mb-8 bg-white dark:bg-gray-800 shadow-lg border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Search by registration number, title, or owner name..."
                value={searchQuery}
                onChange={(e) => handleSearchQueryChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 min-w-[200px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Financial Years</option>
                {financialYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleSearch}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-8"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </Card>

          <div className="mb-6">
            {showData && filteredData.length > 0 ? (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Found {filteredData.length} registration(s)
                  </p>
                </div>

                {/* Show all results */}
                {filteredData.map((reg, idx) => (
                  <div key={idx} className="mb-8">
                    <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4 border-b-2 border-red-300 dark:border-red-700 pb-2">
                      Registration #{idx + 1} - {reg.financial_year || "N/A"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {columnNames.map((col) => (
                        <div key={col.key} className="flip-card" style={{ minHeight: '120px' }}>
                          <div className={`flip-card-inner ${!isFlipping ? 'flipped' : ''}`}>
                            <Card className="flip-card-front p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-white dark:from-gray-800 dark:to-gray-700 border-red-200 dark:border-gray-600">
                              <div className="space-y-2">
                                <p className="text-xs text-red-500 dark:text-red-400 font-semibold uppercase tracking-wide">
                                  {col.label}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">-</p>
                              </div>
                            </Card>
                            <Card className="flip-card-back p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              <div className="space-y-2">
                                <p className="text-xs text-red-500 dark:text-red-400 font-semibold uppercase tracking-wide">
                                  {col.label}
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                  {reg[col.key as keyof Registration] || "-"}
                                </p>
                              </div>
                            </Card>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {columnNames.map((col) => (
                  <div key={col.key} className="flip-card" style={{ minHeight: '120px' }}>
                    <div className={`flip-card-inner ${isFlipping ? 'flipped' : ''}`}>
                      <Card className="flip-card-front p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-white dark:from-gray-800 dark:to-gray-700 border-red-200 dark:border-gray-600">
                        <div className="space-y-2">
                          <p className="text-xs text-red-500 dark:text-red-400 font-semibold uppercase tracking-wide">
                            {col.label}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">-</p>
                        </div>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}