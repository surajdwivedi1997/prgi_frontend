import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import { RefreshCcw } from "lucide-react";

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
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [allData, setAllData] = useState<Registration[]>([]);
  const [filteredData, setFilteredData] = useState<Registration[]>([]);
  const [financialYears, setFinancialYears] = useState<string[]>([]);
  const [dropdownEnabled, setDropdownEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showData, setShowData] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // 🔹 Auto-search when typing stops for 600ms
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setDropdownEnabled(false);
      setShowData(false);
      setFilteredData([]);
      return;
    }

    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => handleSearch(), 600);
    setTypingTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  async function handleSearch() {
    if (!searchQuery.trim()) return;

    setLoading(true);
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    try {
      const url = `${BASE_URL}/api/registrations/search?query=${encodeURIComponent(
        searchQuery.trim()
      )}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = (await response.json()) as Registration[];

      if (data.length === 0) {
        setShowData(false);
        setDropdownEnabled(false);
        setFinancialYears([]);
        setAllData([]);
        setFilteredData([]);
        return;
      }

      // ✅ Extract years dynamically
      const years = Array.from(
        new Set(
          data
            .map((r) => r.financial_year)
            .filter((y): y is string => Boolean(y && y.trim()))
        )
      ).sort();

      setDropdownEnabled(true);
      setFinancialYears(years);
      setSelectedYear("ALL");
      setAllData(data);
      setFilteredData(data);
      setShowData(true);
    } catch (error) {
      console.error("❌ Search failed:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleYearChange(year: string) {
    setSelectedYear(year);
    if (year === "ALL") {
      setFilteredData(allData);
    } else {
      const filtered = allData.filter((r) => r.financial_year === year);
      setFilteredData(filtered);
    }
    setShowData(true);
  }

  function resetAll() {
    setSearchQuery("");
    setSelectedYear("ALL");
    setFinancialYears([]);
    setFilteredData([]);
    setAllData([]);
    setDropdownEnabled(false);
    setShowData(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
            Registration Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search and view newspaper registration information
          </p>
        </div>

        {/* Search, Dropdown, Reset Row */}
        <Card className="p-6 mb-8 bg-white dark:bg-gray-800 shadow-lg border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 items-center">
            <Input
              type="text"
              placeholder="Type at least 3 characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
              className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />

            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              disabled={!dropdownEnabled}
              className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 min-w-[220px] ${
                dropdownEnabled
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <option value="ALL">All Financial Years</option>
              {financialYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <Button
              onClick={resetAll}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-8 flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </Card>

        {/* Results */}
        {loading && (
          <div className="text-center text-gray-600 dark:text-gray-400 py-8">
            Loading...
          </div>
        )}

        {showData && filteredData.length > 0 && !loading && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Found {filteredData.length} registration(s)
              </p>
              {selectedYear === "ALL" ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing all available financial years
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing results for {selectedYear}
                </p>
              )}
            </div>

            {filteredData.map((reg, idx) => (
              <Card key={idx} className="p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">
                  Registration #{idx + 1} - {reg.financial_year || "N/A"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {columnNames.map((col) => (
                    <div key={col.key}>
                      <p className="text-xs text-red-500 dark:text-red-400 font-semibold uppercase tracking-wide">
                        {col.label}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {String(reg[col.key as keyof Registration]) || "-"}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {showData && filteredData.length === 0 && !loading && (
          <div className="text-center text-gray-600 dark:text-gray-400 py-8">
            No records found for this year.
          </div>
        )}
      </main>
    </div>
  );
}