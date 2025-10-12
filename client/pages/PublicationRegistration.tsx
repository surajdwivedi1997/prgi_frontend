import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { publicationApi } from "../lib/publicationApi";
import { PublicationRequest } from "../types/publication.types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import Header from "../components/layout/Header";
import { Loader2, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { getAllStates, getDistrictsByState } from "../data/stateDistrictData";

export default function PublicationRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [formData, setFormData] = useState<PublicationRequest>({
    titleName: "",
    language: "",
    state: "",
    district: "",
    periodicity: "",
    publicationType: "",
    publisherName: "",
    publisherAddress: "",
    publisherEmail: "",
    publisherPhone: "",
    editorName: "",
    editorAddress: "",
    editorEmail: "",
    editorPhone: "",
    printerName: "",
    printingPressName: "",
    printingPressAddress: "",
    placeOfPublication: "",
    firstPublicationDate: "",
    declarationText: "",
  });

  const handleChange = (field: keyof PublicationRequest, value: string) => {
    // When state changes, update available districts and reset district field
    if (field === "state") {
      const districts = getDistrictsByState(value);
      setAvailableDistricts(districts);
      setFormData(prev => ({ ...prev, state: value, district: "" }));
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  // Initialize districts if state is already selected
  useEffect(() => {
    if (formData.state) {
      const districts = getDistrictsByState(formData.state);
      setAvailableDistricts(districts);
    }
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await publicationApi.createPublication(formData);
      alert("Publication registered successfully! Pending admin approval.");
      navigate("/my-publications");
    } catch (error: any) {
      alert(error.response?.data || "Failed to register publication");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Publication Registration</h1>
          <p className="text-muted-foreground">Complete Form I - Declaration</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= s ? "bg-primary text-white" : "bg-gray-200"
                }`}>
                  {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                {s < 4 && <div className={`h-1 w-20 ${step > s ? "bg-primary" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span>Publication Details</span>
            <span>Publisher Info</span>
            <span>Editor & Printer</span>
            <span>Declaration</span>
          </div>
        </div>

        <Card className="p-6">
          {/* Step 1: Publication Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Publication Details</h2>
              
              <div>
                <Label>Title of Publication *</Label>
                <Input
                  value={formData.titleName}
                  onChange={(e) => handleChange("titleName", e.target.value)}
                  placeholder="e.g., The Daily Express"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Publication Type *</Label>
                  <select
                    value={formData.publicationType}
                    onChange={(e) => handleChange("publicationType", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Type</option>
                    <option value="NEWSPAPER">Newspaper</option>
                    <option value="MAGAZINE">Magazine</option>
                    <option value="JOURNAL">Journal</option>
                  </select>
                </div>

                <div>
                  <Label>Periodicity *</Label>
                  <select
                    value={formData.periodicity}
                    onChange={(e) => handleChange("periodicity", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Periodicity</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="FORTNIGHTLY">Fortnightly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Language *</Label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleChange("language", e.target.value)}
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
                    <option value="Odia">Odia</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Urdu">Urdu</option>
                    <option value="Assamese">Assamese</option>
                    <option value="Sanskrit">Sanskrit</option>
                  </select>
                </div>

                <div>
                  <Label>State *</Label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select State</option>
                    {getAllStates().map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>District *</Label>
                  <select
                    value={formData.district}
                    onChange={(e) => handleChange("district", e.target.value)}
                    className="w-full p-2 border rounded-md"
                    disabled={!formData.state}
                  >
                    <option value="">
                      {formData.state ? "Select District" : "Select State First"}
                    </option>
                    {availableDistricts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  {!formData.state && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Please select a state first
                    </p>
                  )}
                </div>

                <div>
                  <Label>Place of Publication</Label>
                  <Input
                    value={formData.placeOfPublication}
                    onChange={(e) => handleChange("placeOfPublication", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>First Publication Date</Label>
                <Input
                  type="date"
                  value={formData.firstPublicationDate}
                  onChange={(e) => handleChange("firstPublicationDate", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Publisher Info */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Publisher Information</h2>
              
              <div>
                <Label>Publisher Name *</Label>
                <Input
                  value={formData.publisherName}
                  onChange={(e) => handleChange("publisherName", e.target.value)}
                />
              </div>

              <div>
                <Label>Publisher Address *</Label>
                <textarea
                  value={formData.publisherAddress}
                  onChange={(e) => handleChange("publisherAddress", e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Publisher Email</Label>
                  <Input
                    type="email"
                    value={formData.publisherEmail}
                    onChange={(e) => handleChange("publisherEmail", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Publisher Phone</Label>
                  <Input
                    value={formData.publisherPhone}
                    onChange={(e) => handleChange("publisherPhone", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Editor & Printer */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Editor & Printer Information</h2>
              
              <div>
                <Label>Editor Name *</Label>
                <Input
                  value={formData.editorName}
                  onChange={(e) => handleChange("editorName", e.target.value)}
                />
              </div>

              <div>
                <Label>Editor Address</Label>
                <textarea
                  value={formData.editorAddress}
                  onChange={(e) => handleChange("editorAddress", e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={2}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Editor Email</Label>
                  <Input
                    type="email"
                    value={formData.editorEmail}
                    onChange={(e) => handleChange("editorEmail", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Editor Phone</Label>
                  <Input
                    value={formData.editorPhone}
                    onChange={(e) => handleChange("editorPhone", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Printer Name *</Label>
                <Input
                  value={formData.printerName}
                  onChange={(e) => handleChange("printerName", e.target.value)}
                />
              </div>

              <div>
                <Label>Printing Press Name *</Label>
                <Input
                  value={formData.printingPressName}
                  onChange={(e) => handleChange("printingPressName", e.target.value)}
                />
              </div>

              <div>
                <Label>Printing Press Address *</Label>
                <textarea
                  value={formData.printingPressAddress}
                  onChange={(e) => handleChange("printingPressAddress", e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Declaration */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Declaration</h2>
              
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm mb-4">
                  I hereby declare that the particulars given above are true to the best of my knowledge and belief.
                </p>
                <Label>Additional Declaration (Optional)</Label>
                <textarea
                  value={formData.declarationText}
                  onChange={(e) => handleChange("declarationText", e.target.value)}
                  className="w-full p-2 border rounded-md mt-2"
                  rows={4}
                  placeholder="Enter any additional declaration or remarks..."
                />
              </div>

              <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                <h3 className="font-semibold mb-2">Review your information</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Title:</strong> {formData.titleName}</p>
                  <p><strong>Type:</strong> {formData.publicationType}</p>
                  <p><strong>Language:</strong> {formData.language}</p>
                  <p><strong>State:</strong> {formData.state}</p>
                  <p><strong>District:</strong> {formData.district}</p>
                  <p><strong>Publisher:</strong> {formData.publisherName}</p>
                  <p><strong>Editor:</strong> {formData.editorName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {step < 4 ? (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}