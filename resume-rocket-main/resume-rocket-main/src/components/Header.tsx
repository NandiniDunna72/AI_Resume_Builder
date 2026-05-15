import { Sparkles, LogIn, LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/builder", label: "Resume Builder" },
  { path: "/analyzer", label: "Analyzer" },
  { path: "/transcript", label: "Meeting Translate" },
];

const Header = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                <rect x="4" y="2" width="16" height="20" rx="2" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
                <circle cx="12" cy="8.5" r="2.5" fill="white"/>
                <path d="M7.5 14.5C7.5 12.57 9.57 11 12 11C14.43 11 16.5 12.57 16.5 14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="8" y1="17" x2="16" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="8" y1="19.5" x2="13" y2="19.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              AI <span className="text-primary hidden sm:inline">Resume Builder</span>
              <span className="text-primary sm:hidden">Rocket</span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
                <UserIcon className="h-4 w-4 text-primary" />
                {currentUser.name}
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log Out</span>
              </Button>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          )}
          
          <ThemeToggle />
          <Link
            to="/builder"
            className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 shadow-card"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Get Started</span>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-in slide-in-from-top duration-200">
          <div className="container py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-lg text-base font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-border flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            {currentUser && (
              <div className="mt-2 pt-2 border-t border-border flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <UserIcon className="h-4 w-4 text-primary" />
                  {currentUser.name}
                </div>
                <button onClick={logout} className="text-sm text-destructive font-medium flex items-center gap-1">
                  <LogOut className="h-4 w-4" /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
