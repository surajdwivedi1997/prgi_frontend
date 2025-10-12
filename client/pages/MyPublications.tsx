import { useState, useEffect } from "react";
import { publicationApi } from "../lib/publicationApi";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Header from "../components/layout/Header";
import { useNavigate } from "react-router-dom";
import { Loader2, FileText, Calendar, MapPin } from "lucide-react";

// ✅ Make optional fields optional to match API response
interface Publication {
  id: number;
  titleName: string;
  language?: string;
  state?: string;
  district?: string;
  periodicity?: string;
  publicationType?: string;
  publisherName?: string;
  status: string;
  rniNumber?: string | null;
  createdAt?: string;
}

export default function MyPublications() {
  const navigate = useNavigate();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    try {
      setLoading(true);
      const data = await publicationApi.getMyPublications();
      // ✅ Safe cast since we know shape, but API may omit optional fields
      setPublications(data as Publication[]);
    } catch (error) {
      console.error("Failed to load publications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Publications</h1>
            <p className="text-muted-foreground">
              Track your publication registration applications
            </p>
          </div>
          <Button onClick={() => navigate("/publication-registration")}>
            <FileText className="mr-2 h-4 w-4" />
            New Registration
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : publications.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Publications Yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't registered any publications yet.
            </p>
            <Button onClick={() => navigate("/publication-registration")}>
              Register Your First Publication
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {publications.map((pub) => (
              <Card key={pub.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{pub.titleName}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          pub.status
                        )}`}
                      >
                        {pub.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">{pub.publicationType || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Periodicity
                        </p>
                        <p className="font-medium">{pub.periodicity || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Language
                        </p>
                        <p className="font-medium">{pub.language || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Publisher
                        </p>
                        <p className="font-medium">{pub.publisherName || "—"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {pub.district || "—"}, {pub.state || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Applied on{" "}
                          {pub.createdAt
                            ? new Date(pub.createdAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                    </div>

                    {pub.rniNumber && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                          RNI Number: {pub.rniNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}