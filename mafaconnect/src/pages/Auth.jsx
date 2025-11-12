import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { Loader2, Moon, Sun } from "lucide-react";
import mafaLogo from "@/assets/mafa-logo.png";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [customerType, setCustomerType] = useState("individual");
  const [resetEmail, setResetEmail] = useState("");

  const API_URL = import.meta.env.VITE_HOME_OO;

  // ✅ LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/login/user`, {
        account_number: loginEmail,
        password: loginPassword,
      });

      if (res.data.accessToken) {
        localStorage.setItem("ACCESS_TOKEN", res.data.accessToken);

        toast({
          title: "✅ Login Successful",
          description: `Welcome back, ${res.data.admin?.name || "User"}`,
        });

        // Redirect based on role
        const role = res.data.admin?.role || "user";
        if (role === "admin") navigate("/admin");
        else if (role === "manager") navigate("/manager");
        else if (role === "sales_agent") navigate("/sales");
        else if (role === "user") navigate('/customer-dashboard')
        // else navigate("/customer-dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      toast({
        title: "❌ Login failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ SIGNUP
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/register`, {
        name: signupFullName,
        email: signupEmail,
        phone: signupPhone,
        password: signupPassword,
        customer_type: customerType,
      });

      toast({
        title: "🎉 Account Created",
        description: "You can now log in with your credentials.",
      });

      // ✅ Show popup and redirect to Login tab
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        const loginTab = document.querySelector('[data-state="login"]');
        if (loginTab) loginTab.click();
      }, 2500);

      setSignupEmail("");
      setSignupPassword("");
      setSignupFullName("");
      setSignupPhone("");
    } catch (err) {
      toast({
        title: "Signup Failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ PASSWORD RESET
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/reset-password`, {
        email: resetEmail,
      });

      toast({
        title: "📧 Reset Email Sent",
        description:
          res.data.message || "Check your inbox for reset instructions.",
      });
      setResetEmail("");
    } catch (err) {
      toast({
        title: "Reset Failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      {/* 🔆 Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="fixed top-4 right-4"
      >
        {theme === "light" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </Button>

      {/* 🔐 Auth Card */}
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-3 text-3xl font-bold">
            <img src={mafaLogo} alt="MAFA Logo" className="h-12 w-12" />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              MAFA Connect
            </span>
          </CardTitle>
          <CardDescription>Sales Management & Loyalty System</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="reset">Reset</TabsTrigger>
            </TabsList>

            {/* ✅ LOGIN TAB */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="text"
                    placeholder="0000001 or you@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* ✅ SIGNUP TAB */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={`p-3 border rounded-lg text-sm transition-colors ${
                        customerType === "individual"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setCustomerType("individual")}
                    >
                      👤 Individual
                    </button>
                    <button
                      type="button"
                      className={`p-3 border rounded-lg text-sm transition-colors ${
                        customerType === "corporate"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setCustomerType("corporate")}
                    >
                      🏢 Corporate
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone (optional)</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* ✅ RESET PASSWORD TAB */}
            <TabsContent value="reset">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter your email to receive a password reset link.
                </p>
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 🎉 SUCCESS POPUP */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm text-center border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              🎉 Sign-Up Successful!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Redirecting you to the login page...
            </p>
            <div className="flex justify-center">
              <div className="h-6 w-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// import React, { useState } from "react";
// import { data, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useToast } from "@/hooks/use-toast";
// import { useTheme } from "@/hooks/useTheme";
// import { Loader2, Moon, Sun } from "lucide-react";
// import mafaLogo from "@/assets/mafa-logo.png";

// export default function Auth() {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const { theme, toggleTheme } = useTheme();
//   const [loading, setLoading] = useState(false);

//   // States
//   const [loginEmail, setLoginEmail] = useState("");
//   const [loginPassword, setLoginPassword] = useState("");
//   const [signupEmail, setSignupEmail] = useState("");
//   const [signupPassword, setSignupPassword] = useState("");
//   const [signupFullName, setSignupFullName] = useState("");
//   const [signupPhone, setSignupPhone] = useState("");
//   const [customerType, setCustomerType] = useState("individual");
//   const [resetEmail, setResetEmail] = useState("");

//   const API_URL = import.meta.env.VITE_HOME_OO;

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const res = await axios.post(`${API_URL}/login`, {
//         account_number: loginEmail,
//         password: loginPassword,
//       });

//       if (res.data.accessToken) {
//         localStorage.setItem("ACCESS_TOKEN", res.data.accessToken);

//         toast({
//           title: "✅ Login Successful",
//           description: `Welcome back, ${res.data.admin?.name || "User"}`,
//         });

//         // Redirect based on role
//         const role = res.data.admin?.role || "user";
//         if (role === "admin") navigate("/admin");
//         else if (role === "manager") navigate("/manager");
//         else if (role === "sales_agent") navigate("/sales");
//         else navigate("/portal");
//       } else {
//         throw new Error("Invalid response from server");
//       }
//     } catch (err) {
//       toast({
//         title: "❌ Login failed",
//         description: err.response?.data?.message || err.message,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ SIGNUP
//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const res = await axios.post(`${API_URL}/register`, {
//         name: signupFullName,
//         email: signupEmail,
//         phone: signupPhone,
//         password: signupPassword,
//         customer_type: customerType,
//       });

//       toast({
//         title: "🎉 Account Created",
//         description: "You can now log in with your credentials.",
//       });
//       setSignupEmail("");
//       setSignupPassword("");
//       setSignupFullName("");
//       setSignupPhone("");
//     } catch (err) {
//       toast({
//         title: "Signup Failed",
//         description: err.response?.data?.message || err.message,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ PASSWORD RESET (custom backend)
//   const handleResetPassword = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const res = await axios.post(`${API_URL}/auth/reset-password`, {
//         email: resetEmail,
//       });

//       toast({
//         title: "📧 Reset Email Sent",
//         description:
//           res.data.message || "Check your inbox for reset instructions.",
//       });
//       setResetEmail("");
//     } catch (err) {
//       toast({
//         title: "Reset Failed",
//         description: err.response?.data?.message || err.message,
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
//         {theme === "light" ? (
//           <Moon className="h-5 w-5" />
//         ) : (
//           <Sun className="h-5 w-5" />
//         )}
//       </Button>

//       <Card className="w-full max-w-md shadow-elegant">
//         <CardHeader className="space-y-1">
//           <CardTitle className="flex items-center gap-3 text-3xl font-bold">
//             <img src={mafaLogo} alt="MAFA Logo" className="h-12 w-12" />
//             <span className="bg-gradient-primary bg-clip-text text-transparent">
//               MAFA Connect
//             </span>
//           </CardTitle>
//           <CardDescription>Sales Management & Loyalty System</CardDescription>
//         </CardHeader>

//         <CardContent>
//           <Tabs defaultValue="login" className="w-full">
//             <TabsList className="grid w-full grid-cols-3">
//               <TabsTrigger value="login">Login</TabsTrigger>
//               <TabsTrigger value="signup">Sign Up</TabsTrigger>
//               <TabsTrigger value="reset">Reset</TabsTrigger>
//             </TabsList>

//             {/* ✅ LOGIN TAB */}
//             <TabsContent value="login">
//               <form onSubmit={handleLogin} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="login-email">Email</Label>
//                   <Input
//                     id="login-email"
//                     type="text"
//                     placeholder="0000001 or you@email.com  "
//                     value={loginEmail}
//                     onChange={(e) => setLoginEmail(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="login-password">Password</Label>
//                   <Input
//                     id="login-password"
//                     type="password"
//                     placeholder="••••••••"
//                     value={loginPassword}
//                     onChange={(e) => setLoginPassword(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <Button
//                   type="submit"
//                   className="w-full bg-gradient-primary"
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Logging in...
//                     </>
//                   ) : (
//                     "Login"
//                   )}
//                 </Button>
//               </form>
//             </TabsContent>

//             {/* ✅ SIGNUP TAB */}
//             <TabsContent value="signup">
//               <form onSubmit={handleSignup} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label>Account Type</Label>
//                   <div className="grid grid-cols-2 gap-3">
//                     <button
//                       type="button"
//                       className={`p-3 border rounded-lg text-sm transition-colors ${
//                         customerType === "individual"
//                           ? "border-primary bg-primary/10"
//                           : "border-border hover:border-primary/50"
//                       }`}
//                       onClick={() => setCustomerType("individual")}
//                     >
//                       👤 Individual
//                     </button>
//                     <button
//                       type="button"
//                       className={`p-3 border rounded-lg text-sm transition-colors ${
//                         customerType === "corporate"
//                           ? "border-primary bg-primary/10"
//                           : "border-border hover:border-primary/50"
//                       }`}
//                       onClick={() => setCustomerType("corporate")}
//                     >
//                       🏢 Corporate
//                     </button>
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="signup-name">Full Name</Label>
//                   <Input
//                     id="signup-name"
//                     type="text"
//                     placeholder="John Doe"
//                     value={signupFullName}
//                     onChange={(e) => setSignupFullName(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="signup-phone">Phone (optional)</Label>
//                   <Input
//                     id="signup-phone"
//                     type="tel"
//                     placeholder="+234 800 000 0000"
//                     value={signupPhone}
//                     onChange={(e) => setSignupPhone(e.target.value)}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="signup-email">Email</Label>
//                   <Input
//                     id="signup-email"
//                     type="email"
//                     placeholder="you@email.com"
//                     value={signupEmail}
//                     onChange={(e) => setSignupEmail(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="signup-password">Password</Label>
//                   <Input
//                     id="signup-password"
//                     type="password"
//                     placeholder="••••••••"
//                     value={signupPassword}
//                     onChange={(e) => setSignupPassword(e.target.value)}
//                     required
//                     minLength={6}
//                   />
//                 </div>
//                 <Button
//                   type="submit"
//                   className="w-full bg-gradient-primary"
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Creating account...
//                     </>
//                   ) : (
//                     "Sign Up"
//                   )}
//                 </Button>
//               </form>
//             </TabsContent>

//             {/* ✅ RESET PASSWORD TAB */}
//             <TabsContent value="reset">
//               <form onSubmit={handleResetPassword} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="reset-email">Email</Label>
//                   <Input
//                     id="reset-email"
//                     type="email"
//                     placeholder="you@email.com"
//                     value={resetEmail}
//                     onChange={(e) => setResetEmail(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <p className="text-sm text-muted-foreground">
//                   Enter your email to receive a password reset link.
//                 </p>
//                 <Button
//                   type="submit"
//                   className="w-full bg-gradient-primary"
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Sending link...
//                     </>
//                   ) : (
//                     "Send Reset Link"
//                   )}
//                 </Button>
//               </form>
//             </TabsContent>
//           </Tabs>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";

// import { Button } from "@/components/uisbefore/Button";
// import { Input } from "@/components/uisbefore/Input";
// import { Label } from "@/components/uisbefore/Label";
// // import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/Card";
// import { Card } from "@/components/uisbefore/Card";
// import { CardContent } from "@/components/uisbefore/Card";
// import { CardHeader } from "@/components/uisbefore/Card";
// import { CardTitle } from "@/components/uisbefore/Card";
// import { CardDescription } from "@/components/uisbefore/Card";
// // import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";
// import { Tabs,TabsList, TabsTrigger, TabsContent } from "@/components/uisbefore/Tabs";

// // import { useToast } from "@/hooks/useToast";
// // import { useTheme } from "@/hooks/useTheme";
// // import { useToast } from "@/hooks/useToast";
// import { useToast } from "@/hookss/useToast";
// import { useTheme } from "@/hookss/useTheme";
// // import { useToast } from "@/hooks/useToast";
// import mafaLogo from "@/assets/mafa-logo.png";
// import { Loader2, Moon, Sun } from "lucide-react";

// export default function Auth() {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const { theme, toggleTheme } = useTheme();

//   const [loading, setLoading] = useState(false);
//   const [loginEmail, setLoginEmail] = useState("");
//   const [loginPassword, setLoginPassword] = useState("");
//   const [signupEmail, setSignupEmail] = useState("");
//   const [signupPassword, setSignupPassword] = useState("");
//   const [signupFullName, setSignupFullName] = useState("");
//   const [signupPhone, setSignupPhone] = useState("");
//   const [customerType, setCustomerType] = useState("individual");
//   const [resetEmail, setResetEmail] = useState("");

//   // 🧠 Replace this with your Node backend base URL
//   const API_BASE = import.meta.env.VITE_HOME_OO || "http://localhost:8000/api";

//   // ✅ Login
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await fetch(`${API_BASE}/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email: loginEmail,
//           password: loginPassword,
//         }),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || "Login failed");

//       localStorage.setItem("ACCESS_TOKEN", data.accessToken);
//       localStorage.setItem("user", JSON.stringify(data.user));

//       toast({
//         title: "Login Successful ✅",
//         description: "Redirecting to dashboard...",
//       });

//       navigate("/dashboard");
//     } catch (err) {
//       toast({
//         title: "Login Failed",
//         description: err.message,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Signup
//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await fetch(`${API_BASE}/auth/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: signupFullName,
//           phone: signupPhone,
//           email: signupEmail,
//           password: signupPassword,
//           customerType,
//         }),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || "Signup failed");

//       toast({
//         title: "Account Created 🎉",
//         description: "You can now log in to your account.",
//       });

//       setSignupEmail("");
//       setSignupPassword("");
//       setSignupFullName("");
//       setSignupPhone("");
//     } catch (err) {
//       toast({
//         title: "Signup Failed",
//         description: err.message,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Reset Password
//   const handleResetPassword = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await fetch(`${API_BASE}/auth/reset-password`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: resetEmail }),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || "Reset request failed");

//       toast({
//         title: "Password Reset Email Sent",
//         description: "Check your inbox for the reset link.",
//       });

//       setResetEmail("");
//     } catch (err) {
//       toast({
//         title: "Reset Failed",
//         description: err.message,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
//       {/* Theme Toggle */}
//       <Button
//         variant="ghost"
//         size="icon"
//         onClick={toggleTheme}
//         className="fixed top-4 right-4"
//       >
//         {theme === "light" ? (
//           <Moon className="h-5 w-5" />
//         ) : (
//           <Sun className="h-5 w-5" />
//         )}
//       </Button>

//       <Card className="w-full max-w-md shadow-elegant">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-3 text-3xl font-bold">
//             <img src={mafaLogo} alt="MAFA Logo" className="h-12 w-12" />
//             <span className="bg-gradient-primary bg-clip-text text-transparent">
//               MAFA Connect
//             </span>
//           </CardTitle>
//           <CardDescription>
//             Sales Management & Loyalty System
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <Tabs defaultValue="login">
//             <TabsList className="grid grid-cols-3 w-full mb-4">
//               <TabsTrigger value="login">Login</TabsTrigger>
//               <TabsTrigger value="signup">Sign Up</TabsTrigger>
//               <TabsTrigger value="reset">Reset</TabsTrigger>
//             </TabsList>

//             {/* Login */}
//             <TabsContent value="login">
//               <form onSubmit={handleLogin} className="space-y-4">
//                 <div>
//                   <Label>Email or Account Number</Label>
//                   <Input
//                     type="text"
//                     value={loginEmail}
//                     onChange={(e) => setLoginEmail(e.target.value)}
//                     placeholder="example@email.com or 00000001"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label>Password</Label>
//                   <Input
//                     type="password"
//                     value={loginPassword}
//                     onChange={(e) => setLoginPassword(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <Button
//                   type="submit"
//                   className="w-full bg-gradient-primary"
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging
//                       in...
//                     </>
//                   ) : (
//                     "Login"
//                   )}
//                 </Button>
//               </form>
//             </TabsContent>

//             {/* Signup */}
//             <TabsContent value="signup">
//               <form onSubmit={handleSignup} className="space-y-4">
//                 <div>
//                   <Label>Full Name</Label>
//                   <Input
//                     type="text"
//                     value={signupFullName}
//                     onChange={(e) => setSignupFullName(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label>Phone (optional)</Label>
//                   <Input
//                     type="tel"
//                     value={signupPhone}
//                     onChange={(e) => setSignupPhone(e.target.value)}
//                   />
//                 </div>
//                 <div>
//                   <Label>Email</Label>
//                   <Input
//                     type="email"
//                     value={signupEmail}
//                     onChange={(e) => setSignupEmail(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label>Password</Label>
//                   <Input
//                     type="password"
//                     value={signupPassword}
//                     onChange={(e) => setSignupPassword(e.target.value)}
//                     required
//                     minLength={6}
//                   />
//                 </div>
//                 <div>
//                   <Label>Account Type</Label>
//                   <div className="grid grid-cols-2 gap-3">
//                     <Button
//                       type="button"
//                       variant={
//                         customerType === "individual" ? "default" : "outline"
//                       }
//                       onClick={() => setCustomerType("individual")}
//                     >
//                       👤 Individual
//                     </Button>
//                     <Button
//                       type="button"
//                       variant={
//                         customerType === "corporate" ? "default" : "outline"
//                       }
//                       onClick={() => setCustomerType("corporate")}
//                     >
//                       🏢 Corporate
//                     </Button>
//                   </div>
//                 </div>
//                 <Button
//                   type="submit"
//                   className="w-full bg-gradient-primary"
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
//                     </>
//                   ) : (
//                     "Sign Up"
//                   )}
//                 </Button>
//               </form>
//             </TabsContent>

//             {/* Reset Password */}
//             <TabsContent value="reset">
//               <form onSubmit={handleResetPassword} className="space-y-4">
//                 <Label>Email</Label>
//                 <Input
//                   type="email"
//                   value={resetEmail}
//                   onChange={(e) => setResetEmail(e.target.value)}
//                   required
//                 />
//                 <Button
//                   type="submit"
//                   className="w-full bg-gradient-primary"
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
//                     </>
//                   ) : (
//                     "Send Reset Link"
//                   )}
//                 </Button>
//               </form>
//             </TabsContent>
//           </Tabs>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
