import { Button } from "@/components/ui/button";
import { LogOut, Calendar, Home } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import NotificationBell from "@/components/layout/NotificationBell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DATE_RANGES = [
  { id: "range1", label: "08-09-2025 to 18-09-2025", start: "2025-09-08", end: "2025-09-18" },
  { id: "range2", label: "19-09-2025 to 28-09-2025", start: "2025-09-19", end: "2025-09-28" },
];

export default function Header({ 
  onDateChange, 
  onApplyFilter, 
  onExport, 
  selectedDateRange 
}: { 
  onDateChange?: (range: any) => void;
  onApplyFilter?: () => void;
  onExport?: () => void;
  selectedDateRange?: any;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = localStorage.getItem("userEmail");

  const isDashboard = location.pathname === "/dashboard";
  const isApplicationStatus = location.pathname === "/application-status";

  function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('canAccessDetails');
    sessionStorage.clear();
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo - Clickable to go to dashboard */}
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => navigate("/dashboard")}
        >
          <div className="h-9 w-9 rounded-lg bg-primary/10 ring-1 ring-primary/20 grid place-items-center">
            <span className="text-primary font-extrabold">P</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight">PRGI</span>
            {userEmail && <span className="text-xs text-muted-foreground">{userEmail}</span>}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Notification Bell - FIRST ITEM */}
          <NotificationBell />

          {/* Date controls - only show on application status page */}
          {isApplicationStatus && onDateChange && onApplyFilter && (
            <>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedDateRange?.id || "range1"}
                  onValueChange={(value) => {
                    const range = DATE_RANGES.find(r => r.id === value);
                    if (range && onDateChange) {
                      onDateChange(range);
                    }
                  }}
                >
                  <SelectTrigger className="w-[240px] bg-background hover:bg-accent transition-colors">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_RANGES.map((range) => (
                      <SelectItem 
                        key={range.id} 
                        value={range.id}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                          {range.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={onApplyFilter}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                Apply
              </Button>
            </>
          )}

          {/* Dashboard button - show when NOT on dashboard */}
          {!isDashboard && (
            <Button 
              variant="outline" 
              className="gap-2 bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-100 dark:border-blue-700 shadow-sm hover:shadow-md transition-all"
              onClick={() => navigate("/dashboard")}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          )}

          <Button 
            variant="outline" 
            className="gap-2 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 shadow-sm hover:shadow-md transition-all" 
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>

          {/* Dark Mode Toggle */}
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}