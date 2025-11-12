import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ✅ KYC STATUS
export function useKYCStatus() {
  return useQuery({
    queryKey: ["kyc-status"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "customer_type, kyc_status, nin, kyc_submitted_at, kyc_reviewed_at, kyc_notes"
        )
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}

// ✅ KYC DOCUMENTS
export function useKYCDocuments() {
  return useQuery({
    queryKey: ["kyc-documents"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("corporate_documents")
        .select("*")
        .eq("profile_id", user.id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// ✅ DIRECTORS
export function useDirectors() {
  return useQuery({
    queryKey: ["directors"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("corporate_directors")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// ✅ REPRESENTATIVE
export function useRepresentative() {
  return useQuery({
    queryKey: ["representative"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("company_representatives")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}

// ✅ UPLOAD DOCUMENT
export function useUploadKYCDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, path }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const filePath = `${user.id}/${path}`;
      const { error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("kyc-documents")
        .getPublicUrl(filePath);

      return publicUrl;
    },
    onError: (error) => {
      toast.error("Upload failed", { description: error.message });
    },
  });
}

// ✅ SUBMIT INDIVIDUAL KYC
export function useSubmitIndividualKYC() {
  const queryClient = useQueryClient();
  const uploadDocument = useUploadKYCDocument();

  return useMutation({
    mutationFn: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const photoUrl = await uploadDocument.mutateAsync({
        file: data.photoFile,
        path: `individual/photo.${data.photoFile.name.split(".").pop()}`,
      });

      const { error } = await supabase
        .from("profiles")
        .update({
          nin: data.nin,
          kyc_status: "submitted",
          kyc_submitted_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      return { photoUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-status"] });
      toast.success("KYC submitted successfully", {
        description: "Your documents are under review",
      });
    },
    onError: (error) => {
      toast.error("Submission failed", { description: error.message });
    },
  });
}

// ✅ SUBMIT CORPORATE KYC
export function useSubmitCorporateKYC() {
  const queryClient = useQueryClient();
  const uploadDocument = useUploadKYCDocument();

  return useMutation({
    mutationFn: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload CAC docs
      const cacUploads = await Promise.all(
        data.cacDocuments.map(async (file, index) => {
          const url = await uploadDocument.mutateAsync({
            file,
            path: `corporate/cac_${index}.${file.name.split(".").pop()}`,
          });

          return {
            profile_id: user.id,
            document_type:
              index === 0 ? "cac_certificate" : `cac_form_${index + 1}`,
            document_url: url,
            document_name: file.name,
          };
        })
      );

      const { error: cacError } = await supabase
        .from("corporate_documents")
        .insert(cacUploads);
      if (cacError) throw cacError;

      // Upload & insert directors
      for (const director of data.directors) {
        let photoUrl = null;
        if (director.photoFile) {
          photoUrl = await uploadDocument.mutateAsync({
            file: director.photoFile,
            path: `corporate/directors/${director.nin}_photo.${director.photoFile.name.split(".").pop()}`,
          });
        }

        const { error: directorError } = await supabase
          .from("corporate_directors")
          .insert({
            profile_id: user.id,
            full_name: director.full_name,
            nin: director.nin,
            phone: director.phone,
            email: director.email,
            address: director.address,
            photo_url: photoUrl,
          });
        if (directorError) throw directorError;
      }

      // Upload & insert representative
      let docUrl = null;
      if (data.representative.documentationFile) {
        docUrl = await uploadDocument.mutateAsync({
          file: data.representative.documentationFile,
          path: `corporate/representative_doc.${data.representative.documentationFile.name.split(".").pop()}`,
        });
      }

      const { error: repError } = await supabase
        .from("company_representatives")
        .upsert({
          profile_id: user.id,
          full_name: data.representative.full_name,
          nin: data.representative.nin,
          phone: data.representative.phone,
          email: data.representative.email,
          address: data.representative.address,
          documentation_url: docUrl,
        });

      if (repError) throw repError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          kyc_status: "submitted",
          kyc_submitted_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-status"] });
      queryClient.invalidateQueries({ queryKey: ["kyc-documents"] });
      queryClient.invalidateQueries({ queryKey: ["directors"] });
      queryClient.invalidateQueries({ queryKey: ["representative"] });
      toast.success("Corporate KYC submitted successfully", {
        description: "Your documents are under review",
      });
    },
    onError: (error) => {
      toast.error("Submission failed", { description: error.message });
    },
  });
}

// ✅ APPROVE KYC
export function useApproveKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, notes }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", userId)
        .single();

      const { error } = await supabase
        .from("profiles")
        .update({
          kyc_status: "approved",
          kyc_reviewed_at: new Date().toISOString(),
          kyc_reviewed_by: user.id,
          kyc_notes: notes,
        })
        .eq("id", userId);

      if (error) throw error;

      if (profile?.email) {
        try {
          await supabase.functions.invoke("send-order-email", {
            body: {
              type: "kyc_approved",
              to_email: profile.email,
              customer_name: profile.full_name,
            },
          });
        } catch (emailError) {
          console.error("Failed to send KYC approval email:", emailError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-kyc"] });
      toast.success("KYC approved successfully");
    },
    onError: (error) => {
      toast.error("Approval failed", { description: error.message });
    },
  });
}

// ✅ REJECT KYC
export function useRejectKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, notes }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          kyc_status: "rejected",
          kyc_reviewed_at: new Date().toISOString(),
          kyc_reviewed_by: user.id,
          kyc_notes: notes,
        })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-kyc"] });
      toast.success("KYC rejected");
    },
    onError: (error) => {
      toast.error("Rejection failed", { description: error.message });
    },
  });
}
