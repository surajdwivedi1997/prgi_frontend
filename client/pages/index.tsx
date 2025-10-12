import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Download, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
import { apiFetch } from "@/lib/api";
import Header from "@/components/layout/Header";
import { useNavigate } from "react-router-dom";

const DATE_RANGES = [
  { id: "range1", label: "08-09-2025 to 18-09-2025", start: "2025-09-08", end: "2025-09-18" },
  { id: "range2", label: "19-09-2025 to 28-09-2025", start: "2025-09-19", end: "2025-09-28" },
];

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#14b8a6"];

const MODULES = [
  { id: "new-registration", name: "New Registration", color: COLORS[0] },
  { id: "new-edition", name: "New Edition", color: COLORS[1] },
  { id: "revised-registration", name: "Revised Registration", color: COLORS[2] },
  { id: "ownership-transfer", name: "Ownership Transfer", color: COLORS[3] },
  { id: "discontinuation", name: "Discontinuation of Publication", color: COLORS[4] },
  { id: "newsprint", name: "Newsprint Declaration Authentication", color: COLORS[5] },
];

type SummaryData = Record<string, Record<string, number>>;

interface ApplicationDetail {
  applicationNumber?: string;
  proposedTitles?: string;
  titleName?: string;
  currentStatus?: string;
  applicationStatus?: string;
  publicationState?: string;
  publicationDistrict?: string;
  applicationSubmissionDate?: string;
  dmSubmitDate?: string;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
  return (
    <g>
      <text x={cx} y={cy - 20} dy={8} textAnchor="middle" fill={fill} className="font-bold text-xl">
        {payload.name}
      </text>
      <text x={cx} y={cy + 5} dy={8} textAnchor="middle" fill="#666" className="text-lg font-semibold">
        {value}
      </text>
      <text x={cx} y={cy + 25} dy={8} textAnchor="middle" fill="#999" className="text-sm">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 15}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 18}
        outerRadius={outerRadius + 22}
        fill={fill}
      />
    </g>
  );
};

const renderCustomLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="font-bold text-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Index() {
  const navigate = useNavigate();
  const [selectedRangeId, setSelectedRangeId] = useState(DATE_RANGES[0].id);
  const [appliedRange, setAppliedRange] = useState(DATE_RANGES[0]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<ApplicationDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedSubModule, setSelectedSubModule] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [pieChartOpen, setPieChartOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [overviewActiveIndex, setOverviewActiveIndex] = useState(0);

  useEffect(() => {
    fetchSummary();
  }, [appliedRange]);

  const filteredDetailsData = useMemo(() => {
    if (!searchQuery) return detailsData;
    return detailsData.filter((item) => {
      const appNum = (item.applicationNumber || "").toLowerCase();
      return appNum.includes(searchQuery.toLowerCase());
    });
  }, [detailsData, searchQuery]);

  async function fetchSummary() {
    setLoading(true);
    try {
      const data = await apiFetch<SummaryData>(
        `/api/applications/summary?startDate=${appliedRange.start}&endDate=${appliedRange.end}`
      );
      setSummaryData(data);
    } catch (err) {
      console.error("Failed to load summary:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleApplyFilter() {
    const range = DATE_RANGES.find((r) => r.id === selectedRangeId) || DATE_RANGES[0];
    setAppliedRange(range);
  }

  function handleExportSummary() {
    if (!summaryData) return;
    const rows = Object.entries(summaryData).flatMap(([module, statuses]) =>
      Object.entries(statuses).map(([status, count]) => ({
        Module: module,
        Status: status,
        Count: count,
      }))
    );
    exportCSV("summary-export", rows);
  }

  async function handleSubModuleClick(moduleName: string, subModuleName: string) {
    setSelectedSubModule(`${moduleName} - ${subModuleName}`);
    setDetailsOpen(true);
    setDetailsLoading(true);
    setSearchQuery("");
    
    try {
      if (moduleName === "New Registration") {
        if (subModuleName.includes("New Applications") || subModuleName.includes("Response awaited")) {
          const data = await apiFetch<ApplicationDetail[]>(
            `/api/applications/new-registration/new-applications?startDate=${appliedRange.start}&endDate=${appliedRange.end}`
          );
          setDetailsData(Array.isArray(data) ? data : []);
        } else if (subModuleName.includes("Deficient")) {
          const data = await apiFetch<ApplicationDetail[]>(
            `/api/applications/new-registration/deficient?startDate=${appliedRange.start}&endDate=${appliedRange.end}`
          );
          setDetailsData(Array.isArray(data) ? data : []);
        } else {
          setDetailsData([]);
        }
      } else {
        setDetailsData([]);
      }
    } catch (err) {
      console.error("Failed to load details:", err);
      setDetailsData([]);
    } finally {
      setDetailsLoading(false);
    }
  }

  function handleExportDetails() {
    if (filteredDetailsData.length === 0) return;
    const rowsWithSerial = filteredDetailsData.map((item, idx) => ({
      "#": idx + 1,
      ...item
    }));
    exportCSV("details-export", rowsWithSerial);
  }

  function exportCSV(filename: string, rows: any[]) {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const escape = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function getModuleCount(moduleName: string): number {
    if (!summaryData || !summaryData[moduleName]) return 0;
    const moduleData = summaryData[moduleName];
    return Object.values(moduleData).reduce((sum, val) => {
      const num = Number(val) || 0;
      return sum + num;
    }, 0);
  }

  function getModuleColor(moduleName: string) {
    const module = MODULES.find(m => m.name === moduleName);
    return module ? module.color : COLORS[0];
  }

  // Generate overview pie chart data
  const overviewPieData = useMemo(() => {
    if (!summaryData) return [];
    return MODULES.map(module => ({
      name: module.name,
      value: getModuleCount(module.name),
      color: module.color
    })).filter(item => item.value > 0);
  }, [summaryData]);

  const totalApplications = useMemo(() => {
    return overviewPieData.reduce((sum, item) => sum + item.value, 0);
  }, [overviewPieData]);

  const pieChartData = detailsData.length > 0
    ? Object.entries(
        detailsData.reduce((acc: Record<string, number>, item: ApplicationDetail) => {
          const status = item.currentStatus || item.applicationStatus || "Unknown";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    : [];

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onOverviewPieEnter = (_: any, index: number) => {
    setOverviewActiveIndex(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <Header
        selectedDateRange={DATE_RANGES.find(r => r.id === selectedRangeId)}
        onDateChange={(range) => setSelectedRangeId(range.id)}
        onApplyFilter={handleApplyFilter}
        onExport={handleExportSummary}
      />

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Application Status Report</h1>
            <p className="text-muted-foreground">
              Date Range: {appliedRange.label}
            </p>
            {totalApplications > 0 && (
              <p className="text-lg font-semibold text-primary mt-2">
                Total Applications: {totalApplications.toLocaleString()}
              </p>
            )}
          </div>
          <Button 
            onClick={handleExportSummary}
            variant="secondary"
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !summaryData ? (
          <Card className="p-10 text-center">
            <p className="text-muted-foreground">No data available</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Module Cards and Pie Chart Side by Side */}
            <div className="grid grid-cols-[70%_30%] gap-6">
              {/* Module Cards - 70% */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MODULES.map((module) => {
                  const total = getModuleCount(module.name);
                  return (
                    <Card key={module.id} className="p-6 border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: module.color }}>
                      <h3 className="font-semibold text-lg mb-4">{module.name}</h3>
                      <div className="text-4xl font-bold mb-2" style={{ color: module.color }}>
                        {total.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Applications</p>
                    </Card>
                  );
                })}
              </div>

              {/* Pie Chart - 30% */}
              {overviewPieData.length > 0 && (
                <Card className="p-6 border-2 flex flex-col">
                  <h3 className="text-lg font-semibold mb-4 text-center">Distribution Overview</h3>
                  <div className="flex-1 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          activeIndex={overviewActiveIndex}
                          data={overviewPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={2}
                          dataKey="value"
                          onMouseEnter={onOverviewPieEnter}
                          animationBegin={0}
                          animationDuration={1000}
                          animationEasing="ease-out"
                          label={(entry) => `${((entry.value / totalApplications) * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {overviewPieData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`}
                              fill={entry.color}
                              style={{
                                filter: overviewActiveIndex === index ? 'brightness(1.2) drop-shadow(0 0 6px rgba(0,0,0,0.3))' : 'brightness(1)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                              }}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [`${value} applications`, 'Count']}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
            </div>

            {/* Module Breakdown Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Module Breakdown - Click to View Details</h2>
              <div className="space-y-6">
                {Object.entries(summaryData).map(([moduleName, statuses]) => {
                  const moduleColor = getModuleColor(moduleName);
                  return (
                    <div key={moduleName} className="border-b last:border-0 pb-6 last:pb-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-1 h-8 rounded-full" 
                            style={{ backgroundColor: moduleColor }}
                          />
                          <h3 className="font-semibold text-lg" style={{ color: moduleColor }}>
                            {moduleName}
                          </h3>
                        </div>
                        <span className="text-2xl font-bold" style={{ color: moduleColor }}>
                          {getModuleCount(moduleName)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(statuses).map(([status, count]) => (
                          <div
                            key={status}
                            className="flex flex-col p-4 rounded-lg hover:shadow-md transition-all cursor-pointer border-2"
                            style={{ 
                              borderColor: `${moduleColor}20`,
                              backgroundColor: `${moduleColor}08`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = moduleColor;
                              e.currentTarget.style.backgroundColor = `${moduleColor}15`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = `${moduleColor}20`;
                              e.currentTarget.style.backgroundColor = `${moduleColor}08`;
                            }}
                            onClick={() => handleSubModuleClick(moduleName, status)}
                          >
                            <span className="text-sm text-muted-foreground mb-1">{status}</span>
                            <span className="text-2xl font-bold" style={{ color: moduleColor }}>
                              {count.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Details Table Dialog with Glass Effect */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col bg-background/80 backdrop-blur-xl border-2">
          <DialogHeader>
            <DialogTitle>{selectedSubModule}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search by Application Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSearchQuery("")}
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {filteredDetailsData.length} of {detailsData.length} records
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={handleExportDetails} 
                  disabled={filteredDetailsData.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  disabled={detailsData.length === 0}
                  onClick={() => setPieChartOpen(true)}
                >
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Pie Chart
                </Button>
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-auto flex-1">
            {detailsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredDetailsData.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                {searchQuery 
                  ? `No records found matching "${searchQuery}"`
                  : "No database records available for this sub-module or access denied"
                }
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Application Number</TableHead>
                    <TableHead>Title/Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDetailsData.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell className="font-mono">{item.applicationNumber || "N/A"}</TableCell>
                      <TableCell>{item.proposedTitles || item.titleName || "N/A"}</TableCell>
                      <TableCell>{item.currentStatus || item.applicationStatus || "N/A"}</TableCell>
                      <TableCell>{item.publicationState || "N/A"}</TableCell>
                      <TableCell>{item.publicationDistrict || "N/A"}</TableCell>
                      <TableCell>
                        {item.applicationSubmissionDate || item.dmSubmitDate || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Pie Chart Dialog with Glass Effect */}
      <Dialog open={pieChartOpen} onOpenChange={setPieChartOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-background/80 backdrop-blur-xl border-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedSubModule} - Status Distribution</DialogTitle>
          </DialogHeader>
          {pieChartData.length > 0 ? (
            <div className="space-y-8">
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      innerRadius={90}
                      outerRadius={160}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                      animationBegin={0}
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                    >
                      {pieChartData.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          style={{
                            filter: activeIndex === index ? 'brightness(1.2) drop-shadow(0 0 8px rgba(0,0,0,0.3))' : 'brightness(1)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Status Color Legend</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pieChartData.map((entry, index) => (
                    <div
                      key={entry.name}
                      className="flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md"
                      style={{
                        borderColor: activeIndex === index ? COLORS[index % COLORS.length] : 'transparent',
                        backgroundColor: activeIndex === index ? `${COLORS[index % COLORS.length]}10` : 'transparent',
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" title={entry.name}>
                          {entry.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.value} records ({((entry.value / pieChartData.reduce((sum, e) => sum + e.value, 0)) * 100).toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pieChartData.map((entry, index) => (
                  <Card 
                    key={`card-${entry.name}`}
                    className="p-4 cursor-pointer transition-all hover:shadow-lg"
                    style={{ 
                      borderTop: `4px solid ${COLORS[index % COLORS.length]}`,
                      opacity: activeIndex === index ? 1 : 0.7,
                      transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <div className="text-xs font-medium text-muted-foreground mb-1 truncate" title={entry.name}>
                      {entry.name}
                    </div>
                    <div className="text-3xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                      {entry.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {((entry.value / pieChartData.reduce((sum, e) => sum + e.value, 0)) * 100).toFixed(1)}%
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              No data available for pie chart
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}