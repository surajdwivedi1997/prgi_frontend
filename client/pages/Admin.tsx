import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";

type User = { 
  id: number; 
  email: string; 
  role: string; 
  canAccessDetails?: boolean 
};

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    const role = localStorage.getItem("userRole");
    if (!token || role !== "ROLE_ADMIN") {
      navigate("/login", { replace: true });
      return;
    }
    load();
  }, [navigate]);

  async function load() {
    setError("");
    try {
      const data = await apiFetch<User[]>("admin/userlist");
      setUsers(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load users");
      setUsers([]);
    }
  }

  async function toggle(user: User, allow: boolean) {
    try {
      await apiFetch(`admin/user/${user.id}/toggle-access?allow=${allow}`, { 
        method: "PUT" 
      });
      await load();
    } catch (err) {
      console.error("Failed to toggle access:", err);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">User Access Management</h1>
              <p className="text-muted-foreground">
                Control whether users can access detailed application data
              </p>
            </div>
            <Button variant="outline" onClick={load}>
              Refresh
            </Button>
          </div>

          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Access Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users === null ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.email}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.role === "ROLE_ADMIN"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}
                        >
                          {u.role === "ROLE_ADMIN" ? "Admin" : "User"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {u.role !== "ROLE_ADMIN" ? (
                          <div className="flex items-center justify-end gap-2">
                            <span
                              className={`text-xs font-medium ${
                                !u.canAccessDetails ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              Blocked
                            </span>
                            <button
                              onClick={() => toggle(u, !u.canAccessDetails)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                u.canAccessDetails ? "bg-primary" : "bg-muted"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  u.canAccessDetails ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                            <span
                              className={`text-xs font-medium ${
                                u.canAccessDetails ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              Allowed
                            </span>
                          </div>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Always Allowed
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>

          {error && (
            <Card className="p-4 bg-destructive/10 border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}