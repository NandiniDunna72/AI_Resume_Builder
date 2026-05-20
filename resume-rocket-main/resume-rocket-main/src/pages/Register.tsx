import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(name, email, password);
    if (success) {
      navigate("/login");
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
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>Join us and manage your career tools easily</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                type="text" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full gradient-primary" size="lg">
              Sign Up
            </Button>
            <div className="text-center text-sm text-muted-foreground mt-6">
              Already have an account? <Link to="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
