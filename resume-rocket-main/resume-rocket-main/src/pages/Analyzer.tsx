import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeResume, AnalysisResult } from "@/lib/analyzer";
import AnalysisDashboard from "@/components/AnalysisDashboard";
import { Search, FileText, ClipboardPaste, Download, Edit } from "lucide-react";
import { toast } from "sonner";
import { ResumeTextExtractor } from "@/components/ResumeTextExtractor";

const sampleJobDescriptions = [
  {
    title: "Full Stack Developer",
    text: `We are looking for a Full Stack Developer proficient in React, Node.js, TypeScript, and PostgreSQL. Experience with AWS, Docker, and CI/CD pipelines required. Must have strong skills in REST API design, GraphQL, and Agile methodologies. Knowledge of machine learning and Python is a plus. Strong communication and teamwork skills needed.`,
  },
  {
    title: "Data Scientist",
    text: `Seeking a Data Scientist with expertise in Python, machine learning, deep learning, and NLP. Experience with TensorFlow, PyTorch, scikit-learn, pandas, and numpy required. Must be proficient in SQL and data visualization. Cloud experience (AWS or GCP) preferred. Strong analytical skills and communication abilities expected.`,
  },
  {
    title: "Frontend Engineer",
    text: `Frontend Engineer needed with expertise in React, TypeScript, JavaScript, HTML, CSS, and Tailwind CSS. Experience with Next.js, testing (Jest, Cypress), and Figma preferred. Must understand REST APIs, Git, and Agile development. Strong problem solving and communication skills required.`,
  },
];

const Analyzer = () => {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("resumeText");
    if (stored) {
      setResumeText(stored);
      sessionStorage.removeItem("resumeText");
    }
  }, []);

  const handleAnalyze = () => {
    if (!resumeText.trim()) {
      toast.error("Please enter your resume text");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    setIsAnalyzing(true);
    // Simulate brief processing
    setTimeout(() => {
      const analysisResult = analyzeResume(resumeText, jobDescription);
      setResult(analysisResult);
      sessionStorage.setItem("analysisSuggestions", JSON.stringify(analysisResult.suggestions));
      setIsAnalyzing(false);
      toast.success("Analysis complete!");
    }, 800);
  };

  const loadSampleJD = (sample: typeof sampleJobDescriptions[0]) => {
    setJobDescription(sample.text);
    toast.success(`Loaded: ${sample.title}`);
  };

  const handleExportPDF = () => {
    // With FlowCV-style advanced templates, PDF generation happens cleanly in the builder
    const resumeDataStr = sessionStorage.getItem("resumeData");
    if (resumeDataStr) {
      try {
        const parsed = JSON.parse(resumeDataStr);
        if (result?.suggestedTemplateId) {
          parsed.templateId = result.suggestedTemplateId;
          sessionStorage.setItem("resumeData", JSON.stringify(parsed));
        }
      } catch (e) {
        console.error("Failed to parse resumeData setting templateId", e);
      }
    }
    toast.success("Ready to Print! Ensure your template looks perfect before downloading.", { duration: 5000 });
    navigate("/builder");
  };

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Search className="h-8 w-8 text-primary" />
          Resume Analyzer
        </h1>
        <p className="mt-2 text-muted-foreground">Paste your resume and a job description to get your match score</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Resume Input */}
        <Card className="shadow-card animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-lg my-0 pb-0">
              <FileText className="h-5 w-5 text-primary" />
              Your Resume
            </CardTitle>
            <ResumeTextExtractor onTextExtracted={(text) => setResumeText(text)} />
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your resume text here, or use the Resume Builder to auto-fill..."
              rows={12}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              className="resize-none"
            />
            <p className="mt-2 text-xs text-muted-foreground">{resumeText.split(/\s+/).filter(Boolean).length} words</p>
          </CardContent>
        </Card>

        {/* Job Description Input */}
        <Card className="shadow-card animate-slide-up" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardPaste className="h-5 w-5 text-primary" />
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste the job description here..."
              rows={12}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              className="resize-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {sampleJobDescriptions.map((s, i) => (
                <Button key={i} variant="outline" size="sm" onClick={() => loadSampleJD(s)} className="text-xs">
                  {s.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-10">
        <Button
          size="lg"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90 h-12 px-8"
        >
          {isAnalyzing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Analyze Match
            </>
          )}
        </Button>
        {result && (
          <div className="flex gap-4">
            <Button size="lg" variant="outline" onClick={() => navigate("/builder")} className="h-12 px-8">
              <Edit className="mr-2 h-5 w-5" />
              Edit Resume
            </Button>
            <Button size="lg" variant="outline" onClick={handleExportPDF} className="h-12 px-8">
              <Download className="mr-2 h-5 w-5" />
              Apply Template & Print
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      {result && <AnalysisDashboard result={result} />}
    </div>
  );
};

export default Analyzer;
