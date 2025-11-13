import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Moon, Sun, Eye, EyeOff } from "lucide-react";
import mafaLogo from "../assets/mafa-logo.png";

<<<<<<< HEAD
// Replace these with your local components or use HTML equivalents
// import { Button } from "../components/Button";
// import { Input } from "../components/Input";
// import { Label } from "../components/Label";
=======

>>>>>>> 4646d22c81cd92c48b61aac62080ffd4d6e0dc09

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
import { useTheme } from "@/hookss/useTheme";
import { useToast } from "@/hookss/useToast";
// import { useTheme } from "../hooks/useTheme";
// import { useToast } from "../hooks/useToast";


export default function Auth() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [isWaitingForRecovery, setIsWaitingForRecovery] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupFullName, setSignupFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [customerType, setCustomerType] = useState("individual");

  const [resetEmail, setResetEmail] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Simulated Login
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast({
        title: "Welcome back!",
        description: `Logged in as ${loginEmail}`,
      });
      setLoading(false);
      navigate("/");
    }, 1000);
  };

  // Simulated Signup
  const handleSignup = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast({
        title: "Account created!",
        description: `Welcome ${signupFullName}. You can now log in.`,
      });
      setLoading(false);
    }, 1000);
  };

  // Simulated Reset Email
  const handleResetPassword = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast({
        title: "Reset email sent!",
        description: "Check your inbox for the reset link.",
      });
      setLoading(false);
      setResetEmail("");
    }, 1000);
  };

  // Simulated Update Password
  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setLoading(true);
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      setLoading(false);
      return;
    }
    setTimeout(() => {
      toast({
        title: "Password updated!",
        description: "Your password has been successfully changed.",
      });
      setIsRecoveryMode(false);
      setNewPassword("");
      setConfirmPassword("");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="fixed top-4 right-4"
      >
        {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-3 text-3xl font-bold">
            <img src={mafaLogo} alt="MAFA Logo" className="h-12 w-12" />
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              MAFA Connect
            </span>
          </CardTitle>
          <CardDescription>Sales Management & Loyalty System</CardDescription>
        </CardHeader>

        <CardContent>
          {isWaitingForRecovery ? (
            // Waiting for reset verification
            <div className="text-center mt-6 space-y-4">
              <h2 className="text-2xl font-bold">Verifying Reset Link</h2>
              <p className="text-sm text-gray-500">
                Please wait while we verify your password reset link...
              </p>
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </div>
          ) : isRecoveryMode ? (
            // Recovery mode
            <form onSubmit={handleUpdatePassword} className="space-y-4 mt-6">
              <h2 className="text-xl font-semibold text-center">Set New Password</h2>

              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-11 w-10"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11"
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsRecoveryMode(false)}
              >
                Cancel
              </Button>
            </form>
          ) : (
            // Main tabs (login/signup/reset)
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="reset">Reset</TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white"
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

              {/* SIGNUP */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <Label>Account Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={`p-3 border rounded-lg text-sm ${
                        customerType === "individual"
                          ? "border-purple-500 bg-purple-100"
                          : "border-gray-300 hover:border-purple-400"
                      }`}
                      onClick={() => setCustomerType("individual")}
                    >
                      👤 Individual
                    </button>
                    <button
                      type="button"
                      className={`p-3 border rounded-lg text-sm ${
                        customerType === "corporate"
                          ? "border-purple-500 bg-purple-100"
                          : "border-gray-300 hover:border-purple-400"
                      }`}
                      onClick={() => setCustomerType("corporate")}
                    >
                      🏢 Corporate
                    </button>
                  </div>

                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    required
                  />

                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />

                  <Label>Phone (optional)</Label>
                  <Input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                  />

                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={6}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* RESET */}
              <TabsContent value="reset">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Enter your email address and we'll send you a reset link.
                  </p>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
