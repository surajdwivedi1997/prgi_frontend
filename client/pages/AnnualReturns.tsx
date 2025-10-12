import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { publicationApi } from "../lib/publicationApi";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import Header from "../components/layout/Header";
import { Loader2, FileText, Plus, CheckCircle } from "lucide-react";

interface Publication {
  id: number;
  titleName: string;
  rniNumber: string;
  status: string;
  publisherName: string;
  editorName: string;
  printerName: string;
  publisherAddress: string;
  printingPressAddress: string;
}

interface AnnualReturnForm {
  publicationId: number;
  rniNumber: string;
  titleName: string;
  returnYear: number;
  publisherName: string;
  publisherAddress: string;
  editorName: string;
  printerName: string;
  printingPressAddress: string;
  totalCopiesPrinted: number | null;
  averageCirculation: number | null;
  distributionArea: string;
  subscriptionRevenue: string;
  advertisementRevenue: string;
  otherRevenue: string;
  hasPublishedRegularly: boolean;
  issuesMissed: number | null;
  reasonForMissedIssues: string;
  ownershipChanged: boolean;
  ownershipChangeDetails: string;
  addressChanged: boolean;
  newAddress: string;
  declarationText: string;
}

export default function AnnualReturns() {
  const navigate = useNavigate();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentYear] = useState(new Date().getFullYear() - 1);
  
  const [formData, setFormData] = useState<AnnualReturnForm>({
    publicationId: 0,
    rniNumber: "",
    titleName: "",
    returnYear: currentYear,
    publisherName: "",
    publisherAddress: "",
    editorName: "",
    printerName: "",
    printingPressAddress: "",
    totalCopiesPrinted: null,
    averageCirculation: null,
    distributionArea: "",
    subscriptionRevenue: "",
    advertisementRevenue: "",
    otherRevenue: "",
    hasPublishedRegularly: true,
    issuesMissed: null,
    reasonForMissedIssues: "",
    ownershipChanged: false,
    ownershipChangeDetails: "",
    addressChanged: false,
    newAddress: "",
    declarationText: "",
  });

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    try {
      setLoading(true);
      const data = await publicationApi.getMyPublications();
      const approved = data.filter((pub: Publication) => pub.status === "APPROVED");
      setPublications(approved);
    } catch (error) {
      console.error("Failed to load publications:", error);
      alert("Failed to load publications");
    } finally {
      setLoading(false);
    }
  };

  const selectPublication = (pub: Publication) => {
    setSelectedPub(pub);
    setFormData({
      ...formData,
      publicationId: pub.id,
      rniNumber: pub.rniNumber,
      titleName: pub.titleName,
      publisherName: pub.publisherName,
      publisherAddress: pub.publisherAddress,
      editorName: pub.editorName,
      printerName: pub.printerName,
      printingPressAddress: pub.printingPressAddress,
    });
  };

  const handleChange = (field: keyof AnnualReturnForm, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const response = await fetch("http://localhost:8080/api/annual-returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Annual return submitted successfully!");
        setSelectedPub(null);
        navigate("/my-publications");
      } else {
        const error = await response.text();
        alert(error || "Failed to submit annual return");
      }
    } catch (error) {
      console.error("Failed to submit:", error);
      alert("Failed to submit annual return");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!selectedPub) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">File Annual Return</h1>
            <p className="text-muted-foreground">
              Select a publication to file annual return for year {currentYear}
            </p>
          </div>

          {publications.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Approved Publications</h3>
              <p className="text-muted-foreground mb-4">
                You need an approved publication to file annual returns
              </p>
              <Button onClick={() => navigate("/publication-registration")}>
                Register Publication
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {publications.map((pub) => (
                <Card key={pub.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{pub.titleName}</h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        RNI Number: <strong>{pub.rniNumber}</strong>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Publisher: {pub.publisherName}
                      </p>
                    </div>
                    <Button onClick={() => selectPublication(pub)}>
                      <Plus className="mr-2 h-4 w-4" />
                      File Return
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Annual Return - {currentYear}</h1>
          <p className="text-muted-foreground">
            Publication: <strong>{selectedPub.titleName}</strong> (RNI: {selectedPub.rniNumber})
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Publication Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Publisher Name</Label>
                <Input
                  value={formData.publisherName}
                  onChange={(e) => handleChange("publisherName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Editor Name</Label>
                <Input
                  value={formData.editorName}
                  onChange={(e) => handleChange("editorName", e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label>Publisher Address</Label>
                <textarea
                  value={formData.publisherAddress}
                  onChange={(e) => handleChange("publisherAddress", e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={2}
                  required
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Circulation Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Total Copies Printed (Annual)</Label>
                <Input
                  type="number"
                  value={formData.totalCopiesPrinted || ""}
                  onChange={(e) => handleChange("totalCopiesPrinted", parseInt(e.target.value) || null)}
                  required
                />
              </div>
              <div>
                <Label>Average Circulation per Issue</Label>
                <Input
                  type="number"
                  value={formData.averageCirculation || ""}
                  onChange={(e) => handleChange("averageCirculation", parseInt(e.target.value) || null)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label>Distribution Area</Label>
                <Input
                  value={formData.distributionArea}
                  onChange={(e) => handleChange("distributionArea", e.target.value)}
                  placeholder="e.g., Maharashtra, Mumbai Metropolitan Region"
                  required
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Financial Information</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Subscription Revenue</Label>
                <Input
                  value={formData.subscriptionRevenue}
                  onChange={(e) => handleChange("subscriptionRevenue", e.target.value)}
                  placeholder="₹ Amount"
                />
              </div>
              <div>
                <Label>Advertisement Revenue</Label>
                <Input
                  value={formData.advertisementRevenue}
                  onChange={(e) => handleChange("advertisementRevenue", e.target.value)}
                  placeholder="₹ Amount"
                />
              </div>
              <div>
                <Label>Other Revenue</Label>
                <Input
                  value={formData.otherRevenue}
                  onChange={(e) => handleChange("otherRevenue", e.target.value)}
                  placeholder="₹ Amount"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Publication Compliance</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasPublished"
                  checked={formData.hasPublishedRegularly}
                  onChange={(e) => handleChange("hasPublishedRegularly", e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="hasPublished">Publication was issued regularly as per periodicity</Label>
              </div>
              
              {!formData.hasPublishedRegularly && (
                <>
                  <div>
                    <Label>Number of Issues Missed</Label>
                    <Input
                      type="number"
                      value={formData.issuesMissed || ""}
                      onChange={(e) => handleChange("issuesMissed", parseInt(e.target.value) || null)}
                    />
                  </div>
                  <div>
                    <Label>Reason for Missed Issues</Label>
                    <textarea
                      value={formData.reasonForMissedIssues}
                      onChange={(e) => handleChange("reasonForMissedIssues", e.target.value)}
                      className="w-full p-2 border rounded-md"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Changes (If Any)</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ownershipChanged"
                  checked={formData.ownershipChanged}
                  onChange={(e) => handleChange("ownershipChanged", e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="ownershipChanged">Ownership Changed</Label>
              </div>
              
              {formData.ownershipChanged && (
                <div>
                  <Label>Ownership Change Details</Label>
                  <textarea
                    value={formData.ownershipChangeDetails}
                    onChange={(e) => handleChange("ownershipChangeDetails", e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addressChanged"
                  checked={formData.addressChanged}
                  onChange={(e) => handleChange("addressChanged", e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="addressChanged">Address Changed</Label>
              </div>
              
              {formData.addressChanged && (
                <div>
                  <Label>New Address</Label>
                  <textarea
                    value={formData.newAddress}
                    onChange={(e) => handleChange("newAddress", e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Declaration</h2>
            <div className="p-4 bg-muted rounded-md mb-4">
              <p className="text-sm">
                I hereby declare that the information provided in this annual return is true and correct to the best of my knowledge and belief.
              </p>
            </div>
            <div>
              <Label>Additional Declaration (Optional)</Label>
              <textarea
                value={formData.declarationText}
                onChange={(e) => handleChange("declarationText", e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={4}
                placeholder="Enter any additional declaration or remarks..."
              />
            </div>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedPub(null)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Annual Return
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}