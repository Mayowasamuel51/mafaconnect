import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/uimain/card";
import { Button } from "@/components/uimain/button";
import { Input } from "@/components/uimain/Input";
import { Label } from "@/components/uimain/label";
import { Progress } from "@/components/uimain/progress";
import { Loader2, Upload, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { useKYCStatus, useSubmitIndividualKYC, useSubmitCorporateKYC, Director, CompanyRepresentative } from "@/hooks/useKYC";
import { toast } from "sonner";

const individualSchema = z.object({
  nin: z.string().regex(/^\d{11}$/, "NIN must be exactly 11 digits"),
  photo: z.any().refine((file) => file instanceof File, "Photo is required"),
});

const directorSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  nin: z.string().regex(/^\d{11}$/, "NIN must be exactly 11 digits"),
  phone: z.string().min(10, "Valid phone required"),
  email: z.string().email("Valid email required"),
  address: z.string().min(5, "Address is required"),
  photo: z.any().optional(),
});

export default function KYCOnboarding() {
  const navigate = useNavigate();
  const { data: kycStatus, isLoading } = useKYCStatus();
  const submitIndividual = useSubmitIndividualKYC();
  const submitCorporate = useSubmitCorporateKYC();

  const [step, setStep] = useState(1);
  const [photoFile, setPhotoFile] = useState(null);
  const [cacDocuments, setCacDocuments] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [representative, setRepresentative] = useState({
    full_name: "",
    nin: "",
    phone: "",
    email: "",
    address: "",
  });
  const [repDocFile, setRepDocFile] = useState(null);

  const isIndividual = kycStatus?.customer_type === "individual";
  const totalSteps = isIndividual ? 2 : 4;
  const progress = (step / totalSteps) * 100;

  const individualForm = useForm({
    resolver: zodResolver(individualSchema),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (kycStatus?.kyc_status === "approved") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <CardTitle>KYC Approved</CardTitle>
              <CardDescription>Your verification is complete</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/customer-dashboard")}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleIndividualSubmit = async () => {
    const nin = individualForm.getValues("nin");
    if (!nin || !photoFile) {
      toast.error("Please complete all required fields");
      return;
    }

    await submitIndividual.mutateAsync({
      nin,
      photoFile,
    });
    navigate("/customer-dashboard");
  };

  const handleCorporateSubmit = async () => {
    if (cacDocuments.length === 0) {
      toast.error("Please upload at least one CAC document");
      return;
    }
    if (directors.length === 0) {
      toast.error("Please add at least one director");
      return;
    }
    if (!representative.full_name || !representative.nin) {
      toast.error("Please complete representative information");
      return;
    }

    const corporateData = {
      cacDocuments,
      directors: directors.map((d) => ({
        ...d,
        photoFile: d.photoFile,
      })),
      representative: {
        ...representative,
        documentationFile: repDocFile || undefined,
      },
    };

    await submitCorporate.mutateAsync(corporateData);
    navigate("/customer-dashboard");
  };

  const addDirector = () => {
    setDirectors([
      ...directors,
      {
        full_name: "",
        nin: "",
        phone: "",
        email: "",
        address: "",
      },
    ]);
  };

  const removeDirector = (index) => {
    setDirectors(directors.filter((_, i) => i !== index));
  };

  const updateDirector = (index, field: keyof Director, value) => {
    const updated = [...directors];
    updated[index] = { ...updated[index], [field]: value };
    setDirectors(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>
            Complete your {isIndividual ? "individual" : "corporate"} verification to start ordering
          </CardDescription>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {step} of {totalSteps}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* INDIVIDUAL FLOW */}
          {isIndividual && step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Personal Information</h3>
              <div className="space-y-2">
                <Label htmlFor="nin">National Identification Number (NIN)</Label>
                <Input
                  id="nin"
                  {...individualForm.register("nin")}
                  placeholder="12345678901"
                  maxLength={11}
                />
                {individualForm.formState.errors.nin && (
                  <p className="text-sm text-destructive">
                    {individualForm.formState.errors.nin.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Upload Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("File must be less than 5MB");
                        return;
                      }
                      setPhotoFile(file);
                      individualForm.setValue("photo", file);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">JPG or PNG, max 5MB</p>
                {photoFile && (
                  <p className="text-sm text-green-600">✓ {photoFile.name}</p>
                )}
              </div>
            </div>
          )}

          {isIndividual && step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Review & Submit</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p><strong>NIN:</strong> {individualForm.getValues("nin")}</p>
                <p><strong>Photo:</strong> {photoFile?.name}</p>
              </div>
              <Button
                onClick={handleIndividualSubmit}
                disabled={submitIndividual.isPending}
                className="w-full"
              >
                {submitIndividual.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                ) : (
                  "Submit for Approval"
                )}
              </Button>
            </div>
          )}

          {/* CORPORATE FLOW */}
          {!isIndividual && step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">CAC Documents</h3>
              <div className="space-y-2">
                <Label htmlFor="cac-docs">Upload CAC Certificate, Form 2, Form 7</Label>
                <Input
                  id="cac-docs"
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setCacDocuments(files);
                  }}
                />
                <p className="text-xs text-muted-foreground">PDF or images, up to 10MB each</p>
                {cacDocuments.length > 0 && (
                  <div className="text-sm space-y-1">
                    {cacDocuments.map((f, i) => (
                      <p key={i} className="text-green-600">✓ {f.name}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!isIndividual && step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Directors</h3>
                <Button onClick={addDirector} size="sm">
                  <Plus className="h-4 w-4 mr-1" />Add Director
                </Button>
              </div>
              
              {directors.map((director, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Director {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDirector(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    <Input
                      placeholder="Full Name"
                      value={director.full_name}
                      onChange={(e) => updateDirector(index, "full_name", e.target.value)}
                    />
                    <Input
                      placeholder="NIN (11 digits)"
                      value={director.nin}
                      maxLength={11}
                      onChange={(e) => updateDirector(index, "nin", e.target.value)}
                    />
                    <Input
                      placeholder="Phone"
                      value={director.phone}
                      onChange={(e) => updateDirector(index, "phone", e.target.value)}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={director.email}
                      onChange={(e) => updateDirector(index, "email", e.target.value)}
                    />
                    <Input
                      placeholder="Address"
                      value={director.address}
                      onChange={(e) => updateDirector(index, "address", e.target.value)}
                    />
                    <div>
                      <Label>Photo (optional)</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) updateDirector(index, "photoFile", file);
                        }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
              
              {directors.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No directors added yet. Click "Add Director" to begin.
                </p>
              )}
            </div>
          )}

          {!isIndividual && step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Company Representative</h3>
              <div className="grid gap-4">
                <Input
                  placeholder="Full Name"
                  value={representative.full_name}
                  onChange={(e) => setRepresentative({ ...representative, full_name: e.target.value })}
                />
                <Input
                  placeholder="NIN (11 digits)"
                  value={representative.nin}
                  maxLength={11}
                  onChange={(e) => setRepresentative({ ...representative, nin: e.target.value })}
                />
                <Input
                  placeholder="Phone"
                  value={representative.phone}
                  onChange={(e) => setRepresentative({ ...representative, phone: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={representative.email}
                  onChange={(e) => setRepresentative({ ...representative, email: e.target.value })}
                />
                <Input
                  placeholder="Address"
                  value={representative.address}
                  onChange={(e) => setRepresentative({ ...representative, address: e.target.value })}
                />
                <div>
                  <Label>Authorization Letter (optional)</Label>
                  <Input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setRepDocFile(file);
                    }}
                  />
                  {repDocFile && <p className="text-sm text-green-600 mt-1">✓ {repDocFile.name}</p>}
                </div>
              </div>
            </div>
          )}

          {!isIndividual && step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Review & Submit</h3>
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <p className="font-semibold">CAC Documents:</p>
                  <p className="text-sm">{cacDocuments.length} file(s) uploaded</p>
                </div>
                <div>
                  <p className="font-semibold">Directors:</p>
                  <p className="text-sm">{directors.length} director(s) added</p>
                </div>
                <div>
                  <p className="font-semibold">Representative:</p>
                  <p className="text-sm">{representative.full_name}</p>
                </div>
              </div>
              <Button
                onClick={handleCorporateSubmit}
                disabled={submitCorporate.isPending}
                className="w-full"
              >
                {submitCorporate.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                ) : (
                  "Submit for Approval"
                )}
              </Button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
            {step < totalSteps && (
              <Button
                onClick={() => setStep(step + 1)}
                className="ml-auto"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
