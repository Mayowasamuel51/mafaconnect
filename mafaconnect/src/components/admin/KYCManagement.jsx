import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { CardContent } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/Card";
import { CardTitle } from "@/components/ui/Card";
import { CardDescription } from "@/components/ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, Eye, User, Building2 } from "lucide-react";
import { toast } from "sonner";

// ✅ Dummy API simulation for backend
const fakeFetchKYC = async () => {
  return [
    {
      id: 1,
      full_name: "John Doe",
      email: "john@example.com",
      phone: "08012345678",
      customer_type: "individual",
      nin: "12345678901",
      kyc_status: "submitted",
      kyc_submitted_at: "2025-11-05T08:45:00Z",
    },
    {
      id: 2,
      full_name: "BrightTech Ltd",
      email: "info@brighttech.com",
      phone: "08022233344",
      customer_type: "corporate",
      corporate_documents: [
        { id: 1, document_name: "CAC Certificate", document_url: "#" },
      ],
      corporate_directors: [
        { id: 1, full_name: "Jane Bright", email: "jane@brighttech.com", phone: "08022233345", nin: "98765432109" },
      ],
      company_representatives: [
        { id: 1, full_name: "Mark Obi", email: "mark@brighttech.com", phone: "08099977755", nin: "11223344556" },
      ],
      kyc_status: "submitted",
      kyc_submitted_at: "2025-11-06T10:15:00Z",
    },
  ];
};

export function KYCManagement() {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notes, setNotes] = useState("");
  const [viewingDoc, setViewingDoc] = useState(null);

  useEffect(() => {
    const loadKYC = async () => {
      setLoading(true);
      const data = await fakeFetchKYC();
      setKycList(data);
      setLoading(false);
    };
    loadKYC();
  }, []);

  const handleApprove = (userId) => {
    toast.success(`✅ KYC approved for user ID ${userId}`);
    setSelectedUser(null);
  };

  const handleReject = (userId) => {
    if (!notes.trim()) {
      toast.error("Please provide rejection notes before rejecting.");
      return;
    }
    toast.error(`❌ KYC rejected for user ID ${userId}`);
    setSelectedUser(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "submitted":
        return <Badge variant="secondary">Submitted</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Incomplete</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification Management</CardTitle>
          <CardDescription>
            Review and approve customer verification documents
          </CardDescription>
        </CardHeader>

        <CardContent>
          {kycList.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No pending KYC verifications
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kycList.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.customer_type === "corporate" ? (
                          <>
                            <Building2 className="h-4 w-4" /> Corporate
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4" /> Individual
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.kyc_status)}</TableCell>
                    <TableCell>
                      {user.kyc_submitted_at
                        ? new Date(user.kyc_submitted_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              KYC Review: {selectedUser?.full_name}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer Type</p>
                  <p className="flex items-center gap-2 capitalize">
                    {selectedUser.customer_type === "corporate" ? (
                      <>
                        <Building2 className="h-4 w-4" /> Corporate
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4" /> Individual
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p>{selectedUser.phone || "N/A"}</p>
                </div>
              </div>

              {selectedUser.customer_type === "individual" && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">NIN</p>
                  <p className="font-mono">{selectedUser.nin || "Not provided"}</p>
                </div>
              )}

              {selectedUser.customer_type === "corporate" && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">CAC Documents</p>
                    <div className="space-y-2">
                      {selectedUser.corporate_documents?.map((doc) => (
                        <Button
                          key={doc.id}
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingDoc({ url: doc.document_url, name: doc.document_name })}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {doc.document_name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">
                      Directors ({selectedUser.corporate_directors?.length || 0})
                    </p>
                    {selectedUser.corporate_directors?.map((dir) => (
                      <Card key={dir.id} className="p-3 mb-2">
                        <p className="font-medium">{dir.full_name}</p>
                        <p className="text-sm text-muted-foreground">NIN: {dir.nin}</p>
                        <p className="text-sm text-muted-foreground">
                          {dir.email} • {dir.phone}
                        </p>
                      </Card>
                    ))}
                  </div>

                  {selectedUser.company_representatives?.[0] && (
                    <div>
                      <p className="text-sm font-medium mb-2">Company Representative</p>
                      <Card className="p-3">
                        <p className="font-medium">
                          {selectedUser.company_representatives[0].full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          NIN: {selectedUser.company_representatives[0].nin}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedUser.company_representatives[0].email} •{" "}
                          {selectedUser.company_representatives[0].phone}
                        </p>
                      </Card>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this review..."
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="destructive" onClick={() => handleReject(selectedUser.id)}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={() => handleApprove(selectedUser.id)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Viewer */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-[80%] max-w-3xl">
            <h2 className="text-lg font-semibold mb-2">{viewingDoc.name}</h2>
            <iframe src={viewingDoc.url} className="w-full h-[70vh]" title={viewingDoc.name}></iframe>
            <div className="mt-3 text-right">
              <Button onClick={() => setViewingDoc(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Textarea } from "@/components/ui/textarea";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Loader2, CheckCircle, XCircle, Eye, User, Building2 } from "lucide-react";
// import { useApproveKYC, useRejectKYC } from "@/hooks/useKYC";
// import { DocumentViewer } from "@/components/DocumentViewer";
// import { toast } from "sonner";

// export function KYCManagement() {
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [notes, setNotes] = useState("");
//   const [viewingDoc, setViewingDoc] = useState(null);
//   const approveKYC = useApproveKYC();
//   const rejectKYC = useRejectKYC();

//   // Log sensitive PII access for audit trail
//   const logSensitiveAccess = async (user) => {
//     if (!user) return;
    
//     try {
//       // Log access to company representatives PII
//       if (user.company_representatives && user.company_representatives.length > 0) {
//         for (const rep of user.company_representatives) {
//           await supabase.from("audit_logs").insert({
//             user_id: (await supabase.auth.getUser()).data.user?.id,
//             action: "admin_view_sensitive_pii",
//             object_type: "company_representative",
//             object_id: rep.id,
//             data: {
//               representative_id: rep.id,
//               representative_name: rep.full_name,
//               profile_id: user.id,
//               accessed_at: new Date().toISOString(),
//             },
//           });
//         }
//       }

//       // Log access to corporate directors PII
//       if (user.corporate_directors && user.corporate_directors.length > 0) {
//         for (const director of user.corporate_directors) {
//           await supabase.from("audit_logs").insert({
//             user_id: (await supabase.auth.getUser()).data.user?.id,
//             action: "admin_view_sensitive_pii",
//             object_type: "corporate_director",
//             object_id: director.id,
//             data: {
//               director_id: director.id,
//               director_name: director.full_name,
//               profile_id: user.id,
//               accessed_at: new Date().toISOString(),
//             },
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Failed to log sensitive data access:", error);
//     }
//   };

//   const { data: pendingKYC, isLoading } = useQuery({
//     queryKey: ["pending-kyc"],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("profiles")
//         .select(`
//           *,
//           corporate_directors(*),
//           company_representatives(*),
//           corporate_documents(*)
//         `)
//         .in("kyc_status", ["submitted", "incomplete", "rejected"])
//         .order("kyc_submitted_at", { ascending: false });

//       if (error) throw error;
//       return data;
//     },
//   });

//   const logSensitiveDataAccess = async (userId, userName, dataType) => {
//     try {
//       await supabase.from("audit_logs").insert({
//         action: "admin_view_kyc_sensitive_data",
//         object_type: dataType,
//         object_id: userId,
//         data: {
//           user_name: userName,
//           accessed_at: new Date().toISOString(),
//           access_type: "kyc_review"
//         }
//       });
//     } catch (error) {
//       console.error("Failed to log audit trail:", error);
//     }
//   };

//   const handleApprove = async (userId) => {
//     await approveKYC.mutateAsync({ userId, notes });
//     setSelectedUser(null);
//     setNotes("");
//   };

//   const handleReject = async (userId) => {
//     if (!notes.trim()) {
//       toast.error("Please provide rejection notes");
//       return;
//     }
//     await rejectKYC.mutateAsync({ userId, notes });
//     setSelectedUser(null);
//     setNotes("");
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "submitted" = "secondary">Submitted</Badge>;
//       case "rejected" = "destructive">Rejected</Badge>;
//       default = "outline">Incomplete</Badge>;
//     }
//   };

//   return (
//     <>
//       <Card>
//         <CardHeader>
//           <CardTitle>KYC Verification Management</CardTitle>
//           <CardDescription>
//             Review and approve customer verification documents
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {!pendingKYC || pendingKYC.length === 0 ? (
//             <p className="text-center text-muted-foreground py-8">
//               No pending KYC verifications
//             </p>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Customer</TableHead>
//                   <TableHead>Type</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Submitted</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {pendingKYC.map((user) => (
//                   <TableRow key={user.id}>
//                     <TableCell className="font-medium">{user.full_name}</TableCell>
//                     <TableCell>
//                       <div className="flex items-center gap-2">
//                         {user.customer_type === "corporate" ? (
//                           <><Building2 className="h-4 w-4" /> Corporate</>
//                         ) : (
//                           <><User className="h-4 w-4" /> Individual</>
//                         )}
//                       </div>
//                     </TableCell>
//                     <TableCell>{getStatusBadge(user.kyc_status)}</TableCell>
//                     <TableCell>
//                       {user.kyc_submitted_at ? new Date(user.kyc_submitted_at).toLocaleDateString() : "-"}
//                     </TableCell>
//                     <TableCell>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => {
//                           setSelectedUser(user);
//                           logSensitiveAccess(user);
//                         }}
//                       >
//                         <Eye className="h-4 w-4 mr-1" />
//                         Review
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           )}
//         </CardContent>
//       </Card>

//       {/* Review Dialog */}
//       <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
//         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>
//               KYC Review: {selectedUser?.full_name}
//             </DialogTitle>
//           </DialogHeader>

//           {selectedUser && (
//             <div className="space-y-6">
//               <div className="grid gap-4">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Customer Type</p>
//                   <p className="flex items-center gap-2 capitalize">
//                     {selectedUser.customer_type === "corporate" ? (
//                       <><Building2 className="h-4 w-4" /> Corporate</>
//                     ) : (
//                       <><User className="h-4 w-4" /> Individual</>
//                     )}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Email</p>
//                   <p>{selectedUser.email}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Phone</p>
//                   <p>{selectedUser.phone || "N/A"}</p>
//                 </div>
//               </div>

//               {selectedUser.customer_type === "individual" && (
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground mb-2">NIN</p>
//                   <p className="font-mono">{selectedUser.nin || "Not provided"}</p>
//                 </div>
//               )}

//               {selectedUser.customer_type === "corporate" && (
//                 <>
//                   <div>
//                     <p className="text-sm font-medium mb-2">CAC Documents</p>
//                     <div className="space-y-2">
//                       {selectedUser.corporate_documents?.map((doc) => (
//                         <Button
//                           key={doc.id}
//                           variant="outline"
//                           size="sm"
//                           onClick={() => setViewingDoc({ url: doc.document_url, name: doc.document_name })}
//                         >
//                           <Eye className="h-4 w-4 mr-2" />
//                           {doc.document_name}
//                         </Button>
//                       ))}
//                     </div>
//                   </div>

//                   <div>
//                     <p className="text-sm font-medium mb-2">Directors ({selectedUser.corporate_directors?.length || 0})</p>
//                     {selectedUser.corporate_directors?.map((dir, i) => (
//                       <Card key={dir.id} className="p-3 mb-2">
//                         <p className="font-medium">{dir.full_name}</p>
//                         <p className="text-sm text-muted-foreground">NIN: {dir.nin}</p>
//                         <p className="text-sm text-muted-foreground">{dir.email} • {dir.phone}</p>
//                       </Card>
//                     ))}
//                   </div>

//                   {selectedUser.company_representatives?.[0] && (
//                     <div>
//                       <p className="text-sm font-medium mb-2">Company Representative</p>
//                       <Card className="p-3">
//                         <p className="font-medium">{selectedUser.company_representatives[0].full_name}</p>
//                         <p className="text-sm text-muted-foreground">NIN: {selectedUser.company_representatives[0].nin}</p>
//                         <p className="text-sm text-muted-foreground">
//                           {selectedUser.company_representatives[0].email} • {selectedUser.company_representatives[0].phone}
//                         </p>
//                       </Card>
//                     </div>
//                   )}
//                 </>
//               )}

//               <div>
//                 <label className="text-sm font-medium">Review Notes</label>
//                 <Textarea
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                   placeholder="Add notes about this review..."
//                   className="mt-2"
//                 />
//               </div>
//             </div>
//           )}

//           <DialogFooter className="gap-2">
//             <Button
//               variant="destructive"
//               onClick={() => handleReject(selectedUser.id)}
//               disabled={rejectKYC.isPending}
//             >
//               <XCircle className="h-4 w-4 mr-2" />
//               Reject
//             </Button>
//             <Button
//               onClick={() => handleApprove(selectedUser.id)}
//               disabled={approveKYC.isPending}
//             >
//               <CheckCircle className="h-4 w-4 mr-2" />
//               Approve
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Document Viewer */}
//       {viewingDoc && (
//         <DocumentViewer
//           documentUrl={viewingDoc.url}
//           documentName={viewingDoc.name}
//           open={!!viewingDoc}
//           onOpenChange={() => setViewingDoc(null)}
//         />
//       )}
//     </>
//   );
// }
