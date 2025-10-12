// client/pages/TitleCheck.tsx

import { useState } from "react";
import { titleApi } from "../lib/titleApi";
import { TitleCheckResponse } from "../types/title.types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import Header from "../components/layout/Header";
import { Loader2, Search, AlertCircle, CheckCircle, Info } from "lucide-react";

export default function TitleCheck() {
  const [titleName, setTitleName] = useState("");
  const [language, setLanguage] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TitleCheckResponse | null>(null);

  const handleCheck = async () => {
    if (!titleName || !language || !state) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await titleApi.checkTitleAvailability({
        titleName,
        language,
        state,
      });
      setResult(response);
    } catch (error) {
      console.error("Error checking title:", error);
      alert("Failed to check title availability");
    } finally {
      setLoading(false);
    }
  };

  const getColorClass = (score: number) => {
    if (score >= 86) return "text-green-600";
    if (score >= 61) return "text-orange-500";
    if (score >= 31) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (status: string) => {
    if (status === "HIGH") return <CheckCircle className="h-6 w-6 text-green-600" />;
    if (status === "MEDIUM") return <Info className="h-6 w-6 text-orange-500" />;
    return <AlertCircle className="h-6 w-6 text-red-600" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Title Availability Check</h1>
          <p className="text-muted-foreground">
            Check if your publication title is available with AI-powered probability analysis
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="titleName">Publication Title *</Label>
              <Input
                id="titleName"
                value={titleName}
                onChange={(e) => setTitleName(e.target.value)}
                placeholder="e.g., The Daily Express"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Language *</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Language</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Urdu">Urdu</option>
                </select>
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <select
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select State</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Punjab">Punjab</option>
                </select>
              </div>
            </div>

            <Button onClick={handleCheck} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Check Availability
                </>
              )}
            </Button>
          </div>
        </Card>

        {result && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Results</h2>
              {getStatusIcon(result.status)}
            </div>

            {/* Probability Meter */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Approval Probability</span>
                <span className={`text-3xl font-bold ${getColorClass(result.probabilityScore)}`}>
                  {result.probabilityScore}%
                </span>
              </div>
              
              <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    result.probabilityScore >= 86
                      ? "bg-green-500"
                      : result.probabilityScore >= 61
                      ? "bg-orange-500"
                      : result.probabilityScore >= 31
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${result.probabilityScore}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
              <span
                className={`inline-block px-4 py-2 rounded-full font-semibold ${
                  result.status === "HIGH"
                    ? "bg-green-100 text-green-800"
                    : result.status === "MEDIUM"
                    ? "bg-orange-100 text-orange-800"
                    : result.status === "LOW"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {result.status === "HIGH" && "✓ Highly Likely to be Approved"}
                {result.status === "MEDIUM" && "⚠ May Require Modifications"}
                {result.status === "LOW" && "⚠ Approval Unlikely"}
                {result.status === "REJECTED" && "✗ Title Unavailable"}
              </span>
            </div>

            {/* Reasons */}
            {result.reasons.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Analysis:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.reasons.map((reason, idx) => (
                    <li key={idx} className="text-sm">{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conflicts */}
            {result.conflicts.exactMatch && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                <h3 className="font-semibold text-red-800 mb-2">Exact Match Found:</h3>
                <p className="text-sm text-red-700">{result.conflicts.exactMatch}</p>
              </div>
            )}

            {result.conflicts.similarTitles && result.conflicts.similarTitles.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Similar Titles:</h3>
                <div className="space-y-2">
                  {result.conflicts.similarTitles.map((similar, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{similar.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {similar.similarity}% match ({similar.status})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="font-semibold text-blue-800 mb-2">Suggestions:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-blue-700">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}