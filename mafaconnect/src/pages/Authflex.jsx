import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

import { Button } from "@/components/uisbefore/Button";
import { Input } from "@/components/uisbefore/Input";
import { Label } from "@/components/uisbefore/Label";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/Card";
import { Card } from "@/components/uisbefore/Card";
import { CardContent } from "@/components/uisbefore/Card";
import { CardHeader } from "@/components/uisbefore/Card";
import { CardTitle } from "@/components/uisbefore/Card";
import { CardDescription } from "@/components/uisbefore/Card";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";
import { Tabs,TabsList, TabsTrigger, TabsContent } from "@/components/uisbefore/Tabs";

// import { useToast } from "@/hooks/useToast";
// import { useTheme } from "@/hooks/useTheme";
// import { useToast } from "@/hooks/useToast";
import { useToast } from "@/hookss/useToast";
import { useTheme } from "@/hookss/useTheme";
// import { useToast } from "@/hooks/useToast";
import mafaLogo from "@/assets/mafa-logo.png";
import { Loader2, Moon, Sun } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [customerType, setCustomerType] = useState("individual");
  const [resetEmail, setResetEmail] = useState("");

  // 🧠 Replace this with your Node backend base URL
  const API_BASE = import.meta.env.VITE_HOME_OO || "http://localhost:8000/api";

  // ✅ Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("ACCESS_TOKEN", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Login Successful ✅",
        description: "Redirecting to dashboard...",
      });

      navigate("/dashboard");
    } catch (err) {
      toast({
        title: "Login Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupFullName,
          phone: signupPhone,
          email: signupEmail,
          password: signupPassword,
          customerType,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");

      toast({
        title: "Account Created 🎉",
        description: "You can now log in to your account.",
      });

      setSignupEmail("");
      setSignupPassword("");
      setSignupFullName("");
      setSignupPhone("");
    } catch (err) {
      toast({
        title: "Signup Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Reset request failed");

      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for the reset link.",
      });

      setResetEmail("");
    } catch (err) {
      toast({
        title: "Reset Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      {/* Theme Toggle */}
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

      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl font-bold">
            <img src={mafaLogo} alt="MAFA Logo" className="h-12 w-12" />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              MAFA Connect
            </span>
          </CardTitle>
          <CardDescription>
            Sales Management & Loyalty System
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-3 w-full mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="reset">Reset</TabsTrigger>
            </TabsList>

            {/* Login */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label>Email or Account Number</Label>
                  <Input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="example@email.com or 00000001"
                    required
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging
                      in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Signup */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Phone (optional)</Label>
                  <Input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label>Account Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={
                        customerType === "individual" ? "default" : "outline"
                      }
                      onClick={() => setCustomerType("individual")}
                    >
                      👤 Individual
                    </Button>
                    <Button
                      type="button"
                      variant={
                        customerType === "corporate" ? "default" : "outline"
                      }
                      onClick={() => setCustomerType("corporate")}
                    >
                      🏢 Corporate
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Reset Password */}
            <TabsContent value="reset">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
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
    </div>
  );
}
