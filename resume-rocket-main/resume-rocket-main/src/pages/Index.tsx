import { Link } from "react-router-dom";
import { ArrowRight, FileText, Target, Lightbulb, BarChart3, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: FileText, title: "Resume Builder", description: "Create ATS-friendly resumes with our guided form. Enter your details and generate a polished resume.", route: "/builder" },
  { icon: Target, title: "Smart Matching", description: "Compare your resume against job descriptions using NLP-powered keyword extraction and synonym matching.", route: "/analyzer" },
  { icon: BarChart3, title: "Visual Dashboard", description: "See your match score, skill breakdown by category, and detailed analytics in beautiful charts.", route: "/analyzer" },
  { icon: Lightbulb, title: "AI Suggestions", description: "Get actionable recommendations to improve your resume and increase your chances of getting shortlisted.", route: "/analyzer" },
  { icon: Download, title: "PDF Export", description: "Download your improved, ATS-optimized resume as a professional PDF ready to submit.", route: "/builder" },
  { icon: Sparkles, title: "Video Summarizer", description: "Paste any YouTube URL and get an AI-powered multilingual summary in English, Hindi, or Telugu instantly.", route: "/transcript" },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
              <Sparkles className="h-4 w-4" />
              AI-Powered Resume Analysis
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Land Your Dream Job with a{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Perfect Resume
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Analyze your resume against job descriptions, get a match score, identify missing keywords,
              and receive AI-powered suggestions to improve your chances.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/builder">
                <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90 h-12 px-8 text-base">
                  Build Your Resume
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/analyzer">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                  Analyze Existing Resume
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-foreground">Everything You Need to Succeed</h2>
          <p className="mt-3 text-muted-foreground">Powerful tools to optimize your resume for any job application</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Link
              key={i}
              to={f.route}
              className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/40 block"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent group-hover:bg-primary/10 transition-colors">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Go to {f.title} <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="rounded-2xl gradient-primary p-10 md:p-16 text-center shadow-glow">
          <h2 className="text-3xl font-bold text-primary-foreground">Ready to Optimize Your Resume?</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            Join thousands of job seekers who improved their resumes and got more interviews.
          </p>
          <Link to="/builder">
            <Button size="lg" variant="secondary" className="mt-8 h-12 px-8 text-base font-semibold">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AI Resume Builder — AI-Powered Resume & Meeting Tools
        </div>
      </footer>
    </div>
  );
};

export default Index;
