import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_HOME_OO;

/* 🟩 FETCH: KYC STATUS */
export function useKYCStatus() {
  return useQuery({
    queryKey: ["kyc-status"],
    queryFn: async () => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const { data } = await axios.get(`${API_BASE}/api/kyc/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
  });
}

/* 🟩 FETCH: KYC DOCUMENTS */
export function useKYCDocuments() {
  return useQuery({
    queryKey: ["kyc-documents"],
    queryFn: async () => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const { data } = await axios.get(`${API_BASE}/api/kyc/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
  });
}

/* 🟩 FETCH: DIRECTORS */
export function useDirectors() {
  return useQuery({
    queryKey: ["kyc-directors"],
    queryFn: async () => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const { data } = await axios.get(`${API_BASE}/api/kyc/directors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
  });
}

/* 🟩 FETCH: REPRESENTATIVE */
export function useRepresentative() {
  return useQuery({
    queryKey: ["kyc-representative"],
    queryFn: async () => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const { data } = await axios.get(`${API_BASE}/api/kyc/representative`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
  });
}

/* 🟩 MUTATION: UPLOAD DOCUMENT */
export function useUploadKYCDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, category }) => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const { data } = await axios.post(`${API_BASE}/api/kyc/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
    onError: (err) => {
      toast.error("Upload failed", { description: err.message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["kyc-documents"]);
      toast.success("Document uploaded successfully");
    },
  });
}

/* 🟩 MUTATION: SUBMIT INDIVIDUAL KYC */
export function useSubmitIndividualKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("ACCESS_TOKEN");

      const formData = new FormData();
      formData.append("nin", data.nin);
      formData.append("photo", data.photoFile);

      await axios.post(`${API_BASE}/api/kyc/submit-individual`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["kyc-status"]);
      toast.success("✅ KYC submitted successfully", {
        description: "Your documents are under review.",
      });
    },
    onError: (err) => {
      toast.error("Submission failed", { description: err.message });
    },
  });
}

/* 🟩 MUTATION: SUBMIT CORPORATE KYC */
export function useSubmitCorporateKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("ACCESS_TOKEN");

      const formData = new FormData();
      formData.append("company_name", data.companyName);
      formData.append("representative_name", data.representative.full_name);
      formData.append("representative_email", data.representative.email);
      formData.append("representative_nin", data.representative.nin);

      data.cacDocuments.forEach((file) => {
        formData.append("cacDocuments", file);
      });

      data.directors.forEach((director, index) => {
        formData.append(`directors[${index}][full_name]`, director.full_name);
        formData.append(`directors[${index}][nin]`, director.nin);
        if (director.photoFile)
          formData.append(`directors[${index}][photo]`, director.photoFile);
      });

      await axios.post(`${API_BASE}/api/kyc/submit-corporate`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["kyc-status"]);
      queryClient.invalidateQueries(["kyc-documents"]);
      queryClient.invalidateQueries(["kyc-directors"]);
      queryClient.invalidateQueries(["kyc-representative"]);
      toast.success("🏢 Corporate KYC submitted successfully", {
        description: "Your documents are under review.",
      });
    },
    onError: (err) => {
      toast.error("Submission failed", { description: err.message });
    },
  });
}

/* 🟩 MUTATION: APPROVE KYC (Admin) */
export function useApproveKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, notes }) => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      await axios.post(
        `${API_BASE}/api/kyc/approve`,
        { userId, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["pending-kyc"]);
      toast.success("✅ KYC approved successfully");
    },
    onError: (err) => {
      toast.error("Approval failed", { description: err.message });
    },
  });
}

/* 🟩 MUTATION: REJECT KYC (Admin) */
export function useRejectKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, notes }) => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      await axios.post(
        `${API_BASE}/api/kyc/reject`,
        { userId, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["pending-kyc"]);
      toast.success("❌ KYC rejected");
    },
    onError: (err) => {
      toast.error("Rejection failed", { description: err.message });
    },
  });
}

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// import { toast } from "sonner";









// export function useKYCStatus() {
//   return useQuery({
//     queryKey: ["kyc-status"],
//     queryFn: async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("Not authenticated");

//       const { data, error } = await supabase
//         .from("profiles")
//         .select("customer_type, kyc_status, nin, kyc_submitted_at, kyc_reviewed_at, kyc_notes")
//         .eq("id", user.id)
//         .single();

//       if (error) throw error;
//       return data;
//     },
//   });
// }

// export function useKYCDocuments() {
//   return useQuery({
//     queryKey: ["kyc-documents"],
//     queryFn: async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("Not authenticated");

//       const { data, error } = await supabase
//         .from("corporate_documents")
//         .select("*")
//         .eq("profile_id", user.id)
//         .order("uploaded_at", { ascending: false });

//       if (error) throw error;
//       return data;
//     },
//   });
// }

// export function useDirectors() {
//   return useQuery({
//     queryKey: ["directors"],
//     queryFn: async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("Not authenticated");

//       const { data, error } = await supabase
//         .from("corporate_directors")
//         .select("*")
//         .eq("profile_id", user.id)
//         .order("created_at", { ascending: true });

//       if (error) throw error;
//       return data;
//     },
//   });
// }

// export function useRepresentative() {
//   return useQuery({
//     queryKey: ["representative"],
//     queryFn: async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("Not authenticated");

//       const { data, error } = await supabase
//         .from("company_representatives")
//         .select("*")
//         .eq("profile_id", user.id)
//         .maybeSingle();

//       if (error) throw error;
//       return data;
//     },
//   });
// }

// export function useUploadKYCDocument() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ file, path }: { file: File; path: string }) => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("Not authenticated");

//       const filePath = `${user.id}/${path}`;
//       const { error: uploadError } = await supabase.storage
//         .from("kyc-documents")
//         .upload(filePath, file, { upsert: true });

//       if (uploadError) throw uploadError;

//       const { data: { publicUrl } } = supabase.storage
//         .from("kyc-documents")
//         .getPublicUrl(filePath);

//       return publicUrl;
//     },
//     onError: (error: Error) => {
//       toast.error("Upload failed", { description: error.message });
//     },
//   });
// }

// export function useSubmitIndividualKYC() {
//   const queryClient = useQueryClient();
//   const uploadDocument = useUploadKYCDocument();

//   return useMutation({
//     mutationFn: async (data: IndividualKYCData) => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("Not authenticated");

//       // Upload photo
//       const photoUrl = await uploadDocument.mutateAsync({
//         file: data.photoFile,
//         path: `individual/photo.${data.photoFile.name.split('.').pop()}`,
//       });

//       // Update profile with NIN and KYC status
//       const { error } = await supabase
//         .from("profiles")
//         .update({
//           nin: data.nin,
//           kyc_status: "submitted",
//           kyc_submitted_at: new Date().toISOString(),
//         })
//         .eq("id", user.id);

//       if (error) throw error;

//       return { photoUrl };
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["kyc-status"] });
//       toast.success("KYC submitted successfully", {
//         description: "Your documents are under review",
//       });
//     },
//     onError: (error: Error) => {
//       toast.error("Submission failed", { description: error.message });
//     },
//   });
// }

// export function useSubmitCorporateKYC() {
//   const queryClient = useQueryClient();
//   const uploadDocument = useUploadKYCDocument();

//   return useMutation({
//     mutationFn: async (data: CorporateKYCData) => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("Not authenticated");

//       // Upload CAC documents
//       const cacUploads = await Promise.all(
//         data.cacDocuments.map(async (file, index) => {
//           const url = await uploadDocument.mutateAsync({
//             file,
//             path: `corporate/cac_${index}.${file.name.split('.').pop()}`,
//           });

//           return {
//             profile_id: user.id,
//             document_type = == 0 ? "cac_certificate" : `cac_form_${index + 1}`,
//             document_url: url,
//             document_name: file.name,
//           };
//         })
//       );

//       // Insert CAC documents
//       const { error: cacError } = await supabase
//         .from("corporate_documents")
//         .insert(cacUploads);

//       if (cacError) throw cacError;

//       // Upload and insert directors
//       for (const director of data.directors) {
//         let photoUrl = null;
//         if (director.photoFile) {
//           photoUrl = await uploadDocument.mutateAsync({
//             file: director.photoFile,
//             path: `corporate/directors/${director.nin}_photo.${director.photoFile.name.split('.').pop()}`,
//           });
//         }

//         const { error: directorError } = await supabase
//           .from("corporate_directors")
//           .insert({
//             profile_id: user.id,
//             full_name: director.full_name,
//             nin: director.nin,
//             phone: director.phone,
//             email: director.email,
//             address: director.address,
//             photo_url: photoUrl,
//           });

//         if (directorError) throw directorError;
//       }

//       // Upload and insert representative
//       let docUrl = null;
//       if (data.representative.documentationFile) {
//         docUrl = await uploadDocument.mutateAsync({
//           file: data.representative.documentationFile,
//           path: `corporate/representative_doc.${data.representative.documentationFile.name.split('.').pop()}`,
//         });
//       }

//       const { error: repError } = await supabase
//         .from("company_representatives")
//         .upsert({
//           profile_id: user.id,
//           full_name: data.representative.full_name,
//           nin: data.representative.nin,
//           phone: data.representative.phone,
//           email: data.representative.email,
//           address: data.representative.address,
//           documentation_url: docUrl,
//         });

//       if (repError) throw repError;

//       // Update profile KYC status
//       const { error: profileError } = await supabase
//         .from("profiles")
//         .update({
//           kyc_status: "submitted",
//           kyc_submitted_at: new Date().toISOString(),
//         })
//         .eq("id", user.id);

//       if (profileError) throw profileError;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["kyc-status"] });
//       queryClient.invalidateQueries({ queryKey: ["kyc-documents"] });
//       queryClient.invalidateQueries({ queryKey: ["directors"] });
//       queryClient.invalidateQueries({ queryKey: ["representative"] });
//       toast.success("Corporate KYC submitted successfully", {
//         description: "Your documents are under review",
//       });
//     },
//     onError: (error: Error) => {
//       toast.error("Submission failed", { description: error.message });
//     },
//   });
// }

// export function useApproveKYC() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ userId, notes }: { userId; notes?: string }) => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("Not authenticated");

//       // Get customer info for email
//       const { data: profile } = await supabase
//         .from("profiles")
//         .select("email, full_name")
//         .eq("id", userId)
//         .single();

//       const { error } = await supabase
//         .from("profiles")
//         .update({
//           kyc_status: "approved",
//           kyc_reviewed_at: new Date().toISOString(),
//           kyc_reviewed_by: user.id,
//           kyc_notes: notes,
//         })
//         .eq("id", userId);

//       if (error) throw error;

//       // Send approval email
//       if (profile?.email) {
//         try {
//           await supabase.functions.invoke("send-order-email", {
//             body: {
//               type: "kyc_approved",
//               to_email: profile.email,
//               customer_name: profile.full_name,
//             },
//           });
//         } catch (emailError) {
//           console.error("Failed to send KYC approval email:", emailError);
//         }
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["pending-kyc"] });
//       toast.success("KYC approved successfully");
//     },
//     onError: (error: Error) => {
//       toast.error("Approval failed", { description: error.message });
//     },
//   });
// }

// export function useRejectKYC() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ userId, notes }: { userId; notes: string }) => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("Not authenticated");

//       const { error } = await supabase
//         .from("profiles")
//         .update({
//           kyc_status: "rejected",
//           kyc_reviewed_at: new Date().toISOString(),
//           kyc_reviewed_by: user.id,
//           kyc_notes: notes,
//         })
//         .eq("id", userId);

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["pending-kyc"] });
//       toast.success("KYC rejected");
//     },
//     onError: (error: Error) => {
//       toast.error("Rejection failed", { description: error.message });
//     },
//   });
// }
