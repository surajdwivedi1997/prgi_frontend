import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  Notification,
} from "@/lib/notificationApi";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const lastFetchTime = useRef<number>(0);
  const FETCH_COOLDOWN = 30000; // 30 seconds minimum between fetches

  // Load unread count with cooldown protection
  async function loadUnreadCount() {
    const now = Date.now();
    
    // Prevent fetching if we fetched recently (within cooldown period)
    if (now - lastFetchTime.current < FETCH_COOLDOWN) {
      console.log("⏱️ Notification fetch skipped - cooldown active");
      return;
    }

    try {
      const count = await getUnreadCount();
      
      // Trigger shake animation if count increased
      if (count > unreadCount && count > 0) {
        setShake(true);
        setTimeout(() => setShake(false), 1000);
      }
      
      setUnreadCount(count);
      lastFetchTime.current = now;
      console.log("✅ Notification count updated:", count);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  }

  // ✅ FIXED: Changed from 5 seconds to 60 seconds
  useEffect(() => {
    loadUnreadCount(); // Initial load
    const interval = setInterval(loadUnreadCount, 60000); // Check every 60 seconds
    return () => clearInterval(interval);
  }, []);

  // ✅ NEW: Fetch when tab becomes visible (user returns)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("👁️ Tab visible - fetching notifications");
        loadUnreadCount();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  async function loadNotifications() {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.isRead) {
      await markAsRead(notification.id);
      setUnreadCount(prev => prev - 1);
    }

    // Navigate based on type
    if (notification.relatedEntityType === "GRIEVANCE") {
      const userRole = localStorage.getItem("userRole");
      if (userRole === "ROLE_ADMIN") {
        navigate("/admin/grievances");
      } else {
        navigate("/grievances");
      }
    } else if (notification.relatedEntityType === "APPOINTMENT") {
      const userRole = localStorage.getItem("userRole");
      if (userRole === "ROLE_ADMIN") {
        navigate("/admin/appointments");
      } else {
        navigate("/my-appointments");
      }
    }

    setOpen(false);
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead();
      setUnreadCount(0);
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`relative ${shake ? 'animate-shake' : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-3 m-2 cursor-pointer hover:bg-muted/50 border-l-4 ${
                  notification.isRead
                    ? "border-l-gray-300 bg-muted/20"
                    : "border-l-blue-500"
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-2">
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0 animate-pulse" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}