import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgot, setIsForgot] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await login(email, password)) {
      navigate("/");
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await resetPassword(email, newPassword)) {
      setIsForgot(false);
      setNewPassword("");
    }
  };

  return (
    <div className="container max-w-md py-10 animate-fade-in flex flex-col items-center justify-center min-h-[90vh] relative">
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>
      <Card className="w-full shadow-card border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-8 border-b bg-muted/10 mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{isForgot ? "Reset Password" : "Welcome Back"}</CardTitle>
          <CardDescription>
            {isForgot ? "Enter your email and new password" : "Enter your credentials to access your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isForgot ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Password</label>
                  <button 
                    type="button" 
                    onClick={() => setIsForgot(true)} 
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full gradient-primary" size="lg">
                Sign In
              </Button>
              <div className="text-center text-sm text-muted-foreground mt-6">
                Don't have an account? <Link to="/register" className="text-primary hover:underline font-semibold">Sign up</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full gradient-primary" size="lg">
                Reset Password
              </Button>
              <div className="text-center text-sm text-muted-foreground mt-6">
                Back to <button type="button" onClick={() => setIsForgot(false)} className="text-primary hover:underline font-semibold">Sign in</button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
