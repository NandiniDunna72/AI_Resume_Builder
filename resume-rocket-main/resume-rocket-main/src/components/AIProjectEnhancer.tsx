import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, X, Copy, CheckCircle2, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const API_KEY = "AIzaSyAAXwtYGrgG3o_G_N_sMyATYdl9Kv-ck8A";

interface Props {
  projectName: string;
  technologies: string;
  onApply: (description: string) => void;
}

export const AIProjectEnhancer = ({ projectName, technologies, onApply }: Props) => {
  const [open, setOpen] = useState(false);
  const [rawInput, setRawInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!rawInput.trim() && !projectName.trim()) {
      toast.error("Please describe what you did in this project");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const prompt = `You are an expert resume writer helping a software/ML engineering student create a world-class resume.

Project Title: ${projectName || "Untitled Project"}
Technologies Used: ${technologies || "Not specified"}
Raw description / notes from developer:
${rawInput || "(No additional notes — infer from project title and technologies)"}

Your task:
1. Generate a professional, 1-line project title (clean, ATS-optimized)
2. Write a 1–2 line professional project summary
3. Generate 3–5 impactful resume bullet points that:
   - Start with strong action verbs (Developed, Built, Implemented, Optimized, Engineered, Designed, Deployed)
   - Clearly describe what was done and the technical approach
   - Highlight key technologies used naturally within the sentence
   - Include measurable impact where possible (accuracy %, performance gain, latency reduction)
   - Are concise (max 1–2 lines each)
   - Are ATS-optimized for Software Engineering and ML roles
   - Sound credible and grounded — do NOT fabricate features or fake metrics

Format your response EXACTLY like this (use these exact headers):

**TITLE:** [Professional project title]

**SUMMARY:** [1–2 line project description]

**BULLETS:**
• [Bullet 1]
• [Bullet 2]
• [Bullet 3]
• [Bullet 4 if applicable]
• [Bullet 5 if applicable]

Keep everything concise, professional, and impactful.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
      if (!res.ok) throw new Error("Gemini API error");
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No response from AI");
      setResult(text);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate bullets. Check your API key or network.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    // Extract just the bullets section to paste into the description field
    const bulletsMatch = result.match(/\*\*BULLETS:\*\*\n([\s\S]*)/);
    const summaryMatch = result.match(/\*\*SUMMARY:\*\*\s*(.+)/);
    const summary = summaryMatch?.[1]?.trim() || "";
    const bullets = bulletsMatch?.[1]?.trim() || result;
    const combined = summary ? `${summary}\n\n${bullets}` : bullets;
    onApply(combined);
    setOpen(false);
    toast.success("AI-generated description applied to your project!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  // Parse sections for nicer display
  const titleMatch = result.match(/\*\*TITLE:\*\*\s*(.+)/);
  const summaryMatch = result.match(/\*\*SUMMARY:\*\*\s*(.+)/);
  const bulletsMatch = result.match(/\*\*BULLETS:\*\*\n([\s\S]*)/);
  const bullets = bulletsMatch?.[1]
    ?.trim()
    .split("\n")
    .filter((l) => l.startsWith("•"))
    .map((l) => l.replace(/^•\s*/, ""));

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="h-3 w-3" />
        AI Enhance
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-background border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">AI Project Enhancer</h2>
                  <p className="text-xs text-muted-foreground">Gemini-powered resume bullet generator</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Project Context */}
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Project</p>
                <p className="text-sm font-semibold text-foreground">{projectName || "Untitled Project"}</p>
                {technologies && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Tech:</span> {technologies}
                  </p>
                )}
              </div>

              {/* Raw Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Describe what you did <span className="text-muted-foreground font-normal">(optional — paste rough notes, features, results)</span>
                </label>
                <Textarea
                  placeholder={`Examples:\n- Built ML model using XGBoost, got 94% accuracy\n- Made Flask API, integrated with React frontend\n- Solved crop yield prediction problem for farmers`}
                  rows={5}
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  className="text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  💡 The more notes you add, the better the output. Even rough bullet points or tech details help.
                </p>
              </div>

              <Button
                className="w-full gradient-primary text-primary-foreground font-semibold h-10"
                onClick={generate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating bullets...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate ATS-Optimized Bullets
                  </>
                )}
              </Button>

              {/* Results */}
              {result && (
                <div className="space-y-4 animate-fade-in">
                  <div className="h-px bg-border" />

                  {titleMatch?.[1] && (
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                      <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Suggested Title</p>
                      <p className="text-sm font-semibold text-foreground">{titleMatch[1]}</p>
                    </div>
                  )}

                  {summaryMatch?.[1] && (
                    <div className="rounded-lg bg-muted/30 border border-border p-3">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Summary</p>
                      <p className="text-sm text-foreground leading-relaxed">{summaryMatch[1]}</p>
                    </div>
                  )}

                  {bullets && bullets.length > 0 && (
                    <div className="rounded-lg bg-muted/30 border border-border p-4 space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Resume Bullets</p>
                      {bullets.map((b, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span className="leading-relaxed">{b}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={handleCopy}>
                      {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy All"}
                    </Button>
                    <Button size="sm" className="flex-1 gradient-primary text-primary-foreground gap-1.5" onClick={handleApply}>
                      <Sparkles className="h-4 w-4" />
                      Apply to Project
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
