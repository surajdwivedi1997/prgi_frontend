import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { Moon, Sun } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  async function onLogin(e: FormEvent) {
    e.preventDefault();

    console.log("=== LOGIN ATTEMPT STARTED ===");
    console.log("Email:", email);
    console.log("Password length:", password.length);

    setError("");
    setLoading(true);

    try {
      console.log("Making API call to /login");

      const data = await apiFetch<{
        token: string;
        id: number;
        role: string;
        email: string;
        canAccessDetails?: boolean;
      }>("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        auth: false, // ⛔ disable auth for login endpoint
      });

      console.log("Login successful! Response:", data);

      if (data.token) {
        // ✅ Save token + user info
        localStorage.setItem("jwtToken", data.token);
        localStorage.setItem("userId", String(data.id));
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem(
          "canAccessDetails",
          String(Boolean(data.canAccessDetails))
        );

        console.log("Token saved successfully, redirecting...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 100);
      } else {
        console.error("❌ No token returned from backend!");
        setError("Invalid response from server — token missing.");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
      console.log("=== LOGIN ATTEMPT FINISHED ===");
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-50"
      }`}
    >
      {/* 🌗 Dark Mode Toggle */}
      <Button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-4 right-4 z-50 rounded-full w-12 h-12 p-0 ${
          darkMode
            ? "bg-slate-700 hover:bg-slate-600 text-yellow-400"
            : "bg-white hover:bg-gray-100 text-gray-700"
        } shadow-lg`}
        variant="ghost"
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>

      <Card
        className={`w-full max-w-5xl overflow-hidden shadow-2xl transition-colors duration-300 ${
          darkMode ? "bg-slate-800 border-slate-700" : "bg-white"
        }`}
      >
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Branding */}
          <div
            className={`md:w-1/2 p-12 text-white flex flex-col items-center justify-center transition-colors duration-300 ${
              darkMode
                ? "bg-gradient-to-br from-slate-800 to-slate-900"
                : "bg-gradient-to-br from-blue-600 to-indigo-700"
            }`}
          >
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-6">
                <img
                  src="https://i.imgur.com/your-uploaded-image.png"
                  alt="PRGI Logo"
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div>
                <h1 className="text-4xl font-bold mb-2">PRGI Portal</h1>
                <p className="text-xl font-semibold">
                  Press Registrar General of India
                </p>
              </div>

              <div className="border-t border-white/30 pt-6 mt-6">
                <p className="text-lg opacity-90">भारत के प्रेस महारजिस्ट्रार</p>
                <p className="text-sm mt-2 opacity-75">
                  Secure Portal for Publication Registration & Management
                </p>
              </div>

              <div className="mt-8 space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
                  <p className="text-sm">Publication Registration Services</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
                  <p className="text-sm">Certificate Management</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
                  <p className="text-sm">Annual Returns Filing</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div
            className={`md:w-1/2 p-12 transition-colors duration-300 ${
              darkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 ${
                darkMode
                  ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"
                  : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              }`}
            />
            <div className="max-w-md mx-auto">
              <h2
                className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Portal Access
              </h2>
              <p
                className={`mb-8 transition-colors duration-300 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Sign in to access your account
              </p>

              <form onSubmit={onLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className={`text-sm font-semibold ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className={`w-full h-12 ${
                      darkMode
                        ? "bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                        : "bg-white text-gray-900 border-gray-300"
                    }`}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className={`text-sm font-semibold ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className={`w-full h-12 ${
                      darkMode
                        ? "bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                        : "bg-white text-gray-900 border-gray-300"
                    }`}
                    placeholder="Enter your password"
                  />
                </div>

                {error && (
                  <div
                    className={`p-3 rounded-md ${
                      darkMode
                        ? "bg-red-900/30 border border-red-700"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        darkMode ? "text-red-300" : "text-red-600"
                      }`}
                    >
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-12 font-semibold text-base ${
                    darkMode
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Don’t have an account?{" "}
                  <Link
                    to="/signup"
                    className={`font-semibold hover:underline ${
                      darkMode ? "text-indigo-400" : "text-blue-600"
                    }`}
                  >
                    Sign up
                  </Link>
                </p>
              </div>

              <div
                className={`mt-8 pt-6 ${
                  darkMode
                    ? "border-t border-slate-700"
                    : "border-t border-gray-200"
                }`}
              >
                <p
                  className={`text-xs text-center ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}