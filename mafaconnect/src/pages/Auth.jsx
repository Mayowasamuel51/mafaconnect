import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Tabs,TabsList, TabsTrigger, TabsContent } from "@/components/uisbefore/Tabs";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
import { Card } from "@/components/uisbefore/Card";
import { CardContent } from "@/components/uisbefore/Card";
import { CardHeader } from "@/components/uisbefore/Card";
import { CardTitle } from "@/components/uisbefore/Card";
import { CardDescription } from "@/components/uisbefore/Card";
// import { Button } from "@/components/ui/button";

import { Button } from "@/components/uisbefore/Button";
import { Link } from "react-router-dom";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import { KYCManagement } from "@/components/admin/KYCManagement";
// import { UserManagement } from "@/components/admin/UserManagement";
// import { SystemSettings } from "@/components/admin/SystemSettings";
// import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
// import { BulkOperations } from "@/components/admin/BulkOperations";
// import { KYCManagement } from "@/components/admin/KYCManagement";

import BulkOperations from "@/components/admin/BulkOperations";
import {
  Shield,
  Users,
  Settings,
  FileText,
  Database,
  Receipt,
  ArrowRight,
  Wrench,
  CheckSquare,
} from "lucide-react";

// import { toast } from "@/hooks/use-toast"; // ✅ your own global toast hook
// import Toast  
import { useToast } from "@/hookss/useToast";
export default function Admin() {
  const [isBackfilling, setIsBackfilling] = useState(false);

  // ✅ React Query mutation for backfilling invoices
  const backfillInvoices = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/backfill-invoices`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to backfill invoices");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Invoices Backfilled",
        description: `Successfully processed ${data?.results?.length || 0} orders.`,
      });
    },
    onError: (err) => {
      useToast({
        title: "Failed to Backfill Invoices",
        description: err.message,
        variant: "destructive",
      });
    },
    onSettled: () => setIsBackfilling(false),
  });

  const handleBackfillInvoices = () => {
    setIsBackfilling(true);
    backfillInvoices.mutate();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Shield className="h-10 w-10 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground">
          Manage users, configure system settings, and monitor activities
        </p>
      </div>

      {/* Quick Access Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Unified Transaction System
          </CardTitle>
          <CardDescription>
            Sales, invoices, and quotes now managed in one place with multi-location support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              The new Transactions system merges sales and invoices with powerful features:
            </p>
            <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
              <li>Unified workflow for cash sales, credit sales, and invoices</li>
              <li>Location-based stock validation and management</li>
              <li>Automatic invoice numbering and payment tracking</li>
              <li>Support for quotes and payment terms</li>
            </ul>
            <Link to="/transactions">
              <Button className="mt-4">
                Go to Transactions <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="kyc" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            KYC
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <FileText className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-2">
            <Database className="h-4 w-4" />
            Bulk Ops
          </TabsTrigger>
          <TabsTrigger value="tools" className="gap-2">
            <Wrench className="h-4 w-4" />
            Tools
          </TabsTrigger>
        </TabsList>

        {/* Tabs Content */}
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="kyc">
          <KYCManagement />
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogViewer />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkOperations />
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Invoice Generation Tools
              </CardTitle>
              <CardDescription>
                Administrative tools for managing invoices and orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg space-y-3 bg-card">
                <div className="flex items-start gap-3">
                  <Receipt className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold">Backfill Missing Invoices</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Generate invoices for paid orders that don't have invoices yet.
                      This will create sales records, invoice records, and notify customers.
                    </p>
                    <Button
                      onClick={handleBackfillInvoices}
                      disabled={isBackfilling}
                      variant="outline"
                    >
                      {isBackfilling ? "Processing..." : "Backfill Invoices"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                <p className="font-semibold mb-1">Note</p>
                <p>
                  Use this when invoice generation was recently updated and older paid
                  orders still need invoices created retroactively.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useToast } from "@/hooks/use-toast";
// import { useTheme } from "@/hooks/useTheme";
// import mafaLogo from "@/assets/mafa-logo.png";
// import { Loader2, Moon, Sun, Eye, EyeOff } from "lucide-react";

// export default function Auth() {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const { theme, toggleTheme } = useTheme();
//   const [loading, setLoading] = React.useState(false);
//   const [loginEmail, setLoginEmail] = React.useState("");
//   const [loginPassword, setLoginPassword] = React.useState("");
//   const [signupEmail, setSignupEmail] = React.useState("");
//   const [signupPassword, setSignupPassword] = React.useState("");
//   const [signupFullName, setSignupFullName] = React.useState("");
//   const [signupPhone, setSignupPhone] = React.useState("");
//   const [customerType, setCustomerType] = React.useState("individual");
//   const [resetEmail, setResetEmail] = React.useState("");
//   const [isRecoveryMode, setIsRecoveryMode] = React.useState(false);
//   const [isWaitingForRecovery, setIsWaitingForRecovery] = React.useState(false);
//   const [newPassword, setNewPassword] = React.useState("");
//   const [confirmPassword, setConfirmPassword] = React.useState("");
//   const [showPassword, setShowPassword] = React.useState(false);

//   React.useEffect(() => {
//     // Check URL hash for recovery token (Supabase sends token in hash fragment)
//     const hashParams = new URLSearchParams(window.location.hash.substring(1));
//     const accessToken = hashParams.get('access_token');
//     const hashType = hashParams.get('type');
    
//     // Also check query params for type=recovery (from redirectTo)
//     const queryParams = new URLSearchParams(window.location.search);
//     const queryType = queryParams.get('type');
    
//     if ((hashType === 'recovery' || queryType === 'recovery') && accessToken) {
//       // We have a recovery token, wait for Supabase to process it
//       setIsWaitingForRecovery(true);
//     }

//     // Listen for auth state changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
//       console.log('Auth event:', event, 'Session:', session ? 'exists' : 'none');
      
//       if (event === "PASSWORD_RECOVERY") {
//         // Token has been exchanged, session is ready
//         setIsRecoveryMode(true);
//         setIsWaitingForRecovery(false);
//       }
      
//       if (event === "SIGNED_IN" && session?.user && !isRecoveryMode && !isWaitingForRecovery) {
//         navigate("/");
//       }
//     });

//     // Check if user is already logged in and redirect
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       if (session?.user && !isRecoveryMode && !isWaitingForRecovery) {
//         navigate("/");
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, [navigate]);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       let emailToUse = loginEmail;
      
//       // Check if user entered 8-digit account number
//       if (/^\d{8}$/.test(loginEmail.trim())) {
//         const { data, error } = await supabase
//           .rpc('lookup_email_by_account_number', {
//             account_num: loginEmail.trim()
//           });
          
//         if (error) {
//           throw new Error('Error looking up account number. Please try again.');
//         }
        
//         if (!data) {
//           throw new Error(`Account number ${loginEmail.trim()} not found. Please verify your 8-digit account number or try logging in with your email instead.`);
//         }
        
//         emailToUse = data; // RPC function returns the email string directly
//       }
      
//       const { error } = await supabase.auth.signInWithPassword({
//         email: emailToUse,
//         password: loginPassword,
//       });

//       if (error) throw error;

//       toast({
//         title: "Welcome back!",
//         description: "You have successfully logged in.",
//       });
//     } catch (error) {
//       toast({
//         title: "Login failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const { data: signupData, error } = await supabase.auth.signUp({
//         email: signupEmail,
//         password: signupPassword,
//         options: {
//           emailRedirectTo: `${window.location.origin}/`,
//           data: {
//             full_name: signupFullName,
//             phone: signupPhone,
//             customer_type: customerType,
//           },
//         },
//       });

//       if (error) throw error;

//       // Fetch the newly created account number
//       if (signupData.user) {
//         const { data: profile } = await supabase
//           .from('profiles')
//           .select('account_number')
//           .eq('id', signupData.user.id)
//           .single();

//         // Send welcome email with account number
//         if (profile?.account_number) {
//           try {
//             await supabase.functions.invoke("send-welcome-email", {
//               body: {
//                 email: signupEmail,
//                 full_name: signupFullName,
//                 account_number: profile.account_number,
//               },
//             });
//           } catch (emailError) {
//             console.error("Failed to send welcome email:", emailError);
//           }

//           toast({
//             title: "Account created!",
//             description: `Your account number is MFC-${profile.account_number}. Use the 8 digits (${profile.account_number}) to login.`,
//             duration: 10000,
//           });
//         }
//       }
//     } catch (error) {
//       toast({
//         title: "Signup failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResetPassword = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // Generate reset link from Supabase
//       const { data, error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
//         redirectTo: `${window.location.origin}/auth?type=recovery`,
//       });

//       if (error) throw error;

//       // Note: In production, you would call your edge function here to send the email
//       // For now, Supabase will handle the email sending
//       // To use custom Resend emails, uncomment the code below:
      
//       /*
//       // Call edge function to send custom email
//       const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-password-reset`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
//         },
//         body: JSON.stringify({
//           email: resetEmail,
//           resetLink: `${window.location.origin}/auth?type=recovery`
//         })
//       });

//       if (!response.ok) {
//         throw new Error('Failed to send reset email');
//       }
//       */

//       toast({
//         title: "Reset email sent!",
//         description: "Check your email for the password reset link.",
//       });
//       setResetEmail("");
//     } catch (error) {
//       toast({
//         title: "Reset failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdatePassword = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // Validate passwords match
//       if (newPassword !== confirmPassword) {
//         throw new Error("Passwords do not match");
//       }

//       // Validate password strength
//       if (newPassword.length < 6) {
//         throw new Error("Password must be at least 6 characters");
//       }

//       // Verify we have an active session
//       const { data: { session } } = await supabase.auth.getSession();
//       if (!session) {
//         throw new Error("Recovery session expired. Please request a new password reset link.");
//       }

//       // Update password using Supabase
//       const { error } = await supabase.auth.updateUser({
//         password: newPassword
//       });

//       if (error) {
//         // Provide specific error messages
//         if (error.message.includes('session')) {
//           throw new Error("Your reset link has expired. Please request a new one.");
//         }
//         throw error;
//       }

//       toast({
//         title: "Password updated!",
//         description: "Your password has been successfully changed.",
//       });

//       // Clear recovery mode and redirect
//       setIsRecoveryMode(false);
//       setNewPassword("");
//       setConfirmPassword("");
      
//       // Remove recovery query parameter and hash
//       window.history.replaceState({}, '', '/auth');
      
//       // Redirect to home
//       setTimeout(() => {
//         navigate('/');
//       }, 2000);

//     } catch (error) {
//       toast({
//         title: "Update failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
//       <Button
//         variant="ghost"
//         size="icon"
//         onClick={toggleTheme}
//         className="fixed top-4 right-4"
//       >
//         {theme === "light" ? <Moon className="h-5 w-5" />  = "h-5 w-5" />}
//       </Button>
//       <Card className="w-full max-w-md shadow-elegant">
//         <CardHeader className="space-y-1">
//           <CardTitle className="flex items-center gap-3 text-3xl font-bold">
//             <img src={mafaLogo} alt="MAFA Logo" className="h-12 w-12" />
//             <span className="bg-gradient-primary bg-clip-text text-transparent">MAFA Connect</span>
//           </CardTitle>
//           <CardDescription>
//             Sales Management & Loyalty System
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {isWaitingForRecovery ? (
//             // Loading state while waiting for token exchange
//             <div className="space-y-4 mt-6 text-center">
//               <div className="space-y-2 mb-6">
//                 <h2 className="text-2xl font-bold">Verifying Reset Link</h2>
//                 <p className="text-sm text-muted-foreground">
//                   Please wait while we verify your password reset link...
//                 </p>
//               </div>
//               <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
//             </div>
//           ) : isRecoveryMode ? (
//             // Password Recovery Form
//             <div className="space-y-4 mt-6">
//               <div className="space-y-2 text-center mb-6">
//                 <h2 className="text-2xl font-bold">Set New Password</h2>
//                 <p className="text-sm text-muted-foreground">
//                   Enter your new password below
//                 </p>
//               </div>
              
//               <form onSubmit={handleUpdatePassword} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="new-password">New Password</Label>
//                   <div className="relative">
//                     <Input
//                       id="new-password"
//                       type={showPassword ? "text" : "password"}
//                       placeholder="••••••••"
//                       value={newPassword}
//                       onChange={(e) => setNewPassword(e.target.value)}
//                       required
//                       minLength={6}
//                       className="h-11 pr-10"
//                       autoComplete="new-password"
//                     />
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-0 top-0 h-11 w-10"
//                     >
//                       {showPassword ? <EyeOff className="h-4 w-4" />  = "h-4 w-4" />}
//                     </Button>
//                   </div>
//                   <p className="text-xs text-muted-foreground">
//                     Must be at least 6 characters
//                   </p>
//                 </div>
                
//                 <div className="space-y-2">
//                   <Label htmlFor="confirm-password">Confirm New Password</Label>
//                   <Input
//                     id="confirm-password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="••••••••"
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     required
//                     minLength={6}
//                     className="h-11"
//                     autoComplete="new-password"
//                   />
//                 </div>

//                 {/* Password strength indicator */}
//                 {newPassword && (
//                   <div className="space-y-1">
//                     <div className="flex gap-1">
//                       <div className={`h-1 flex-1 rounded ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-muted'}`} />
//                       <div className={`h-1 flex-1 rounded ${newPassword.length >= 10 ? 'bg-green-500' : 'bg-muted'}`} />
//                       <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-muted'}`} />
//                     </div>
//                     <p className="text-xs text-muted-foreground">
//                       {newPassword.length < 6 && "Password too short"}
//                       {newPassword.length >= 6 && newPassword.length < 10 && "Good password"}
//                       {newPassword.length >= 10 && "Strong password"}
//                     </p>
//                   </div>
//                 )}
                
//                 <Button
//                   type="submit"
//                   className="w-full bg-gradient-primary"
//                   disabled={loading || !newPassword || !confirmPassword}
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Updating password...
//                     </>
//                   ) : (
//                     "Update Password"
//                   )}
//                 </Button>

//                 <Button
//                   type="button"
//                   variant="ghost"
//                   className="w-full"
//                   onClick={() => {
//                     setIsRecoveryMode(false);
//                     window.history.replaceState({}, '', '/auth');
//                   }}
//                 >
//                   Cancel
//                 </Button>
//               </form>
//             </div>
//           ) : (
//             // Normal Tabs
//             <Tabs defaultValue="login" className="w-full">
//               <TabsList className="grid w-full grid-cols-3">
//                 <TabsTrigger value="login">Login</TabsTrigger>
//                 <TabsTrigger value="signup">Sign Up</TabsTrigger>
//                 <TabsTrigger value="reset">Reset</TabsTrigger>
//               </TabsList>

//               <TabsContent value="login">
//                 <form onSubmit={handleLogin} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="login-email">Account Number or Email</Label>
//                     <Input
//                       id="login-email"
//                       type="text"
//                       placeholder="00000001 or your@email.com"
//                       value={loginEmail}
//                       onChange={(e) => setLoginEmail(e.target.value)}
//                       required
//                     />
//                     <p className="text-xs text-muted-foreground">
//                       Enter your 8-digit account number or email
//                     </p>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="login-password">Password</Label>
//                     <Input
//                       id="login-password"
//                       type="password"
//                       placeholder="••••••••"
//                       value={loginPassword}
//                       onChange={(e) => setLoginPassword(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <Button
//                     type="submit"
//                     className="w-full bg-gradient-primary"
//                     disabled={loading}
//                   >
//                     {loading ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Logging in...
//                       </>
//                     ) : (
//                       "Login"
//                     )}
//                   </Button>
//                 </form>
//               </TabsContent>

//               <TabsContent value="signup">
//                 <form onSubmit={handleSignup} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label>Account Type</Label>
//                     <div className="grid grid-cols-2 gap-3">
//                       <button
//                         type="button"
//                         className={`p-3 border rounded-lg text-sm transition-colors ${
//                           customerType === "individual"
//                             ? "border-primary bg-primary/10"
//                             : "border-border hover:border-primary/50"
//                         }`}
//                         onClick={() => setCustomerType("individual")}
//                       >
//                         👤 Individual
//                       </button>
//                       <button
//                         type="button"
//                         className={`p-3 border rounded-lg text-sm transition-colors ${
//                           customerType === "corporate"
//                             ? "border-primary bg-primary/10"
//                             : "border-border hover:border-primary/50"
//                         }`}
//                         onClick={() => setCustomerType("corporate")}
//                       >
//                         🏢 Corporate
//                       </button>
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="signup-name">Full Name</Label>
//                     <Input
//                       id="signup-name"
//                       type="text"
//                       placeholder="John Doe"
//                       value={signupFullName}
//                       onChange={(e) => setSignupFullName(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="signup-phone">Phone (optional)</Label>
//                     <Input
//                       id="signup-phone"
//                       type="tel"
//                       placeholder="+234 800 000 0000"
//                       value={signupPhone}
//                       onChange={(e) => setSignupPhone(e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="signup-email">Email</Label>
//                     <Input
//                       id="signup-email"
//                       type="email"
//                       placeholder="your@email.com"
//                       value={signupEmail}
//                       onChange={(e) => setSignupEmail(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="signup-password">Password</Label>
//                     <Input
//                       id="signup-password"
//                       type="password"
//                       placeholder="••••••••"
//                       value={signupPassword}
//                       onChange={(e) => setSignupPassword(e.target.value)}
//                       required
//                       minLength={6}
//                     />
//                   </div>
//                   <Button
//                     type="submit"
//                     className="w-full bg-gradient-primary"
//                     disabled={loading}
//                   >
//                     {loading ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Creating account...
//                       </>
//                     ) : (
//                       "Sign Up"
//                     )}
//                   </Button>
//                 </form>
//               </TabsContent>

//               <TabsContent value="reset">
//                 <form onSubmit={handleResetPassword} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="reset-email">Email</Label>
//                     <Input
//                       id="reset-email"
//                       type="email"
//                       placeholder="your@email.com"
//                       value={resetEmail}
//                       onChange={(e) => setResetEmail(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <p className="text-sm text-muted-foreground">
//                     Enter your email address and we'll send you a link to reset your password.
//                   </p>
//                   <Button
//                     type="submit"
//                     className="w-full bg-gradient-primary"
//                     disabled={loading}
//                   >
//                     {loading ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Sending reset link...
//                       </>
//                     ) : (
//                       "Send Reset Link"
//                     )}
//                   </Button>
//                 </form>
//               </TabsContent>
//             </Tabs>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
