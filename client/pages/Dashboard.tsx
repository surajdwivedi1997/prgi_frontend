import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import Header from "../components/layout/Header";
import { 
  BarChart3, 
  FileText, 
  AlertCircle,
  Users,
  ArrowRight,
  Calendar,
  Clock,
  Ticket,
  Newspaper,
  Search,
  FileCheck,
  TrendingUp,
  Map // NEW ICON ADDED
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const userEmail = localStorage.getItem("userEmail");
  const isAdmin = userRole === "ROLE_ADMIN";

  const modules = [
    // PRESS REGISTRATION MODULES
    {
      id: "publication-registration",
      title: "Publication Registration",
      description: "Register new newspaper/magazine/periodical",
      icon: Newspaper,
      color: "cyan",
      path: "/publication-registration",
      showFor: "user",
      category: "press"
    },
    {
      id: "my-publications",
      title: "My Publications",
      description: "View and manage registered publications",
      icon: FileCheck,
      color: "cyan",
      path: "/my-publications",
      showFor: "user",
      category: "press"
    },
    {
      id: "title-verification",
      title: "Title Availability Check",
      description: "Check if publication title is available",
      icon: Search,
      color: "cyan",
      path: "/title-check",
      showFor: "user",
      category: "press"
    },
    {
      id: "annual-returns",
      title: "Annual Returns",
      description: "File annual statements and updates",
      icon: TrendingUp,
      color: "cyan",
      path: "/annual-returns",
      showFor: "user",
      category: "press"
    },

    // EXISTING USER MODULES
    {
      id: "registration",
      title: "Registration Details",
      description: "View and manage registration information",
      icon: FileText,
      color: "blue",
      path: "/registration-details",
      showFor: "all",
      category: "general"
    },
    // NEW TILE ADDED HERE
    {
      id: "registration-map",
      title: "Registration Details - 2",
      description: "Interactive India map with state-wise data",
      icon: Map,
      color: "blue",
      path: "/registration-map",
      showFor: "all",
      category: "general"
    },
    {
      id: "application-status",
      title: "Application Status Report",
      description: "Track application statistics and trends",
      icon: BarChart3,
      color: "purple",
      path: "/application-status",
      showFor: "all",
      category: "general"
    },
    {
      id: "grievances",
      title: "Grievances",
      description: "Submit and track your grievances",
      icon: AlertCircle,
      color: "orange",
      path: "/grievances",
      showFor: "user",
      category: "general"
    },
    {
      id: "book-appointment",
      title: "Book Appointment",
      description: "Schedule meetings with officials",
      icon: Calendar,
      color: "pink",
      path: "/appointments",
      showFor: "user",
      category: "general"
    },
    {
      id: "my-appointments",
      title: "My Appointments",
      description: "View your appointment history",
      icon: Clock,
      color: "indigo",
      path: "/my-appointments",
      showFor: "user",
      category: "general"
    },
    {
      id: "token-queue",
      title: "Token Queue",
      description: "Get a walk-in token and check queue status",
      icon: Ticket,
      color: "teal",
      path: "/token-queue",
      showFor: "user",
      category: "general"
    },

    // ADMIN MODULES - PRESS
    {
      id: "manage-publications",
      title: "Publication Management",
      description: "Approve/reject publication registrations",
      icon: Newspaper,
      color: "cyan",
      path: "/admin/publications",
      showFor: "admin",
      category: "press"
    },
    {
      id: "title-management",
      title: "Title Management",
      description: "Manage reserved titles and objections",
      icon: Search,
      color: "cyan",
      path: "/admin/titles",
      showFor: "admin",
      category: "press"
    },
    {
      id: "certificate-generation",
      title: "PRGI Certificates",
      description: "Generate and manage PRGI certificates",
      icon: FileCheck,
      color: "cyan",
      path: "/admin/certificates",
      showFor: "admin",
      category: "press"
    },
    {
      id: "annual-returns-admin",
      title: "Annual Returns Review",
      description: "Review and verify annual submissions",
      icon: TrendingUp,
      color: "cyan",
      path: "/admin/annual-returns",
      showFor: "admin",
      category: "press"
    },

    // ADMIN MODULES - GENERAL
    {
      id: "admin-appointments",
      title: "Appointment Management",
      description: "Manage and schedule all appointments",
      icon: Calendar,
      color: "pink",
      path: "/admin/appointments",
      showFor: "admin",
      category: "general"
    },
    {
      id: "grievance-management",
      title: "Grievance Management",
      description: "Review and manage user grievances",
      icon: AlertCircle,
      color: "orange",
      path: "/admin/grievances",
      showFor: "admin",
      category: "general"
    },
    {
      id: "token-management",
      title: "Token Management",
      description: "Manage walk-in token queue",
      icon: Ticket,
      color: "teal",
      path: "/admin/tokens",
      showFor: "admin",
      category: "general"
    },
    {
      id: "admin",
      title: "Admin Panel",
      description: "Manage users and system settings",
      icon: Users,
      color: "green",
      path: "/admin",
      showFor: "admin",
      category: "general"
    }
  ];

  const visibleModules = modules.filter(module => {
    if (module.showFor === "all") return true;
    if (module.showFor === "admin") return isAdmin;
    if (module.showFor === "user") return !isAdmin;
    return false;
  });

  const pressModules = visibleModules.filter(m => m.category === "press");
  const generalModules = visibleModules.filter(m => m.category === "general");

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-blue-500/10 dark:bg-blue-500/20",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-l-blue-500",
        hover: "hover:bg-blue-500/20 dark:hover:bg-blue-500/30"
      },
      purple: {
        bg: "bg-purple-500/10 dark:bg-purple-500/20",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-l-purple-500",
        hover: "hover:bg-purple-500/20 dark:hover:bg-purple-500/30"
      },
      orange: {
        bg: "bg-orange-500/10 dark:bg-orange-500/20",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-l-orange-500",
        hover: "hover:bg-orange-500/20 dark:hover:bg-orange-500/30"
      },
      green: {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-l-emerald-500",
        hover: "hover:bg-emerald-500/20 dark:hover:bg-emerald-500/30"
      },
      pink: {
        bg: "bg-pink-500/10 dark:bg-pink-500/20",
        text: "text-pink-600 dark:text-pink-400",
        border: "border-l-pink-500",
        hover: "hover:bg-pink-500/20 dark:hover:bg-pink-500/30"
      },
      indigo: {
        bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
        text: "text-indigo-600 dark:text-indigo-400",
        border: "border-l-indigo-500",
        hover: "hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30"
      },
      teal: {
        bg: "bg-teal-500/10 dark:bg-teal-500/20",
        text: "text-teal-600 dark:text-teal-400",
        border: "border-l-teal-500",
        hover: "hover:bg-teal-500/20 dark:hover:bg-teal-500/30"
      },
      cyan: {
        bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
        text: "text-cyan-600 dark:text-cyan-400",
        border: "border-l-cyan-500",
        hover: "hover:bg-cyan-500/20 dark:hover:bg-cyan-500/30"
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const renderModuleGrid = (modules: typeof visibleModules) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map((module) => {
        const Icon = module.icon;
        const colors = getColorClasses(module.color);
        
        return (
          <Card
            key={module.id}
            onClick={() => navigate(module.path)}
            className={`
              p-6 border-l-4 ${colors.border} 
              cursor-pointer transition-all duration-200 
              ${colors.hover}
              hover:shadow-lg hover:scale-[1.02]
              group
            `}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`
                p-3 rounded-lg ${colors.bg}
                group-hover:scale-110 transition-transform duration-200
              `}>
                <Icon className={`h-6 w-6 ${colors.text}`} />
              </div>
              <ArrowRight className={`
                h-5 w-5 ${colors.text} opacity-0 
                group-hover:opacity-100 group-hover:translate-x-1 
                transition-all duration-200
              `} />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">
              {module.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {module.description}
            </p>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back{userEmail ? `, ${userEmail.split('@')[0]}` : ''}!
            </h1>
            <p className="text-muted-foreground">
              {isAdmin 
                ? "Manage your system and monitor all activities" 
                : "Access your modules and manage your applications"}
            </p>
          </div>

          {/* Press Registration Section */}
          {pressModules.length > 0 && (
            <div className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Newspaper className="h-6 w-6" />
                  Press Registration
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Publication registration and management services
                </p>
              </div>
              {renderModuleGrid(pressModules)}
            </div>
          )}

          {/* General Services Section */}
          {generalModules.length > 0 && (
            <div className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">General Services</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Appointments, grievances, and other services
                </p>
              </div>
              {renderModuleGrid(generalModules)}
            </div>
          )}

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="p-6 border-l-4 border-l-blue-500">
              <div className="text-sm text-muted-foreground mb-1">User Role</div>
              <div className="text-2xl font-bold">
                {isAdmin ? "Administrator" : "User"}
              </div>
            </Card>
            <Card className="p-6 border-l-4 border-l-purple-500">
              <div className="text-sm text-muted-foreground mb-1">Account Status</div>
              <div className="text-2xl font-bold text-green-600">Active</div>
            </Card>
            <Card className="p-6 border-l-4 border-l-orange-500">
              <div className="text-sm text-muted-foreground mb-1">Last Login</div>
              <div className="text-sm font-semibold">
                {new Date().toLocaleDateString()}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}