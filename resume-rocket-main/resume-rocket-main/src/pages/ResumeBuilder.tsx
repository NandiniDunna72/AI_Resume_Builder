import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResumeForm, { ResumeData } from "@/components/ResumeForm";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResumePreview } from "@/components/ResumePreview";
import { CustomizationPanel } from "@/components/CustomizationPanel";
import { ArrowRight, FileText, Lightbulb, X, History as HistoryIcon, Trash2, Download, Printer, Plus, SlidersHorizontal, Eye, Undo2, Redo2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildResumeText } from "@/lib/analyzer";
import { toast } from "sonner";
import { ResumeUploader } from "@/components/ResumeUploader";
import { getStorageItem, setStorageItem } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { Save } from "lucide-react";

const emptyResume: ResumeData = {
  fullName: "",
  email: "",
  phone: "",
  summary: "",
  skills: "",
  experience: [],
  education: [],
  projects: [],
  templateId: "modern"
};

const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(emptyResume);
  const [analysisSuggestions, setAnalysisSuggestions] = useState<string[]>([]);
  const [resumeHistory, setResumeHistory] = useState<Array<{ id: number, title: string, date: string, data: ResumeData }>>([]);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [previewTab, setPreviewTab] = useState<"preview" | "customize">("preview");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Undo/Redo HistoryIcon
  const [history, setHistory] = useState<ResumeData[]>([emptyResume]);
  const [pointer, setPointer] = useState(0);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);

  // Memoized version of setResumeData that doesn't trigger the history effect
  const handleSetResumeData = (newData: ResumeData | ((prev: ResumeData) => ResumeData)) => {
    if (typeof newData === 'function') {
      setResumeData(prev => newData(prev));
    } else {
      setResumeData(newData);
    }
  };

  useEffect(() => {
    if (isUndoRedoAction) {
      setIsUndoRedoAction(false);
      return;
    }
    
    // Add to history if data changed significantly (simple JSON check)
    if (JSON.stringify(resumeData) !== JSON.stringify(history[pointer])) {
      const newHistory = history.slice(0, pointer + 1);
      newHistory.push(JSON.parse(JSON.stringify(resumeData))); // Deep clone
      
      // Limit history to 50 states
      if (newHistory.length > 50) newHistory.shift();
      
      setHistory(newHistory);
      setPointer(newHistory.length - 1);
    }
  }, [resumeData]);

  const handleUndo = () => {
    if (pointer > 0) {
      setIsUndoRedoAction(true);
      const prevState = history[pointer - 1];
      setResumeData(prevState);
      setPointer(pointer - 1);
      toast.info("Step Undone", { duration: 1000 });
    }
  };

  const handleRedo = () => {
    if (pointer < history.length - 1) {
      setIsUndoRedoAction(true);
      const nextState = history[pointer + 1];
      setResumeData(nextState);
      setPointer(pointer + 1);
      toast.info("Step Redone", { duration: 1000 });
    }
  };

  const fetchResumesFromServer = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('/api/resumes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch resumes');
      const data = await response.json();
      
      const serverHistory = data.map((r: any) => ({
        id: r.id,
        title: r.title || (r.data?.fullName + " - Resume") || "Untitled Resume",
        date: r.date || new Date(r.updated_at).toLocaleString(),
        data: r.data // The actual resume data is in the 'data' field
      }));
      setResumeHistory(serverHistory);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchResumesFromServer();
    }
  }, [currentUser]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pointer, history]);

  useEffect(() => {
    const stored = sessionStorage.getItem("resumeData");
    if (stored) {
      try {
        setResumeData(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored resume data", e);
      }
    }
    const storedSuggestions = sessionStorage.getItem("analysisSuggestions");
    if (storedSuggestions) {
      try {
        setAnalysisSuggestions(JSON.parse(storedSuggestions));
      } catch (e) {
        console.error("Failed to parse stored suggestions", e);
      }
    }
    const storedHistory = getStorageItem("resumeHistory");
    if (storedHistory) {
      try {
        setResumeHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleAnalyze = () => {
    if (!resumeData.fullName || !resumeData.skills) {
      toast.error("Please fill in at least your name and skills");
      return;
    }
    const resumeText = buildResumeText(resumeData);

    const newId = Date.now();
    const historyItem = { id: newId, title: resumeData.fullName + " - Resume", date: new Date().toLocaleString(), data: resumeData };
    const history = JSON.parse(getStorageItem("resumeHistory") || "[]");
    const updatedHistory = [historyItem, ...history.filter((h: { title: string }) => h.title !== historyItem.title)];
    setStorageItem("resumeHistory", JSON.stringify(updatedHistory));
    setResumeHistory(updatedHistory);

    // Store in sessionStorage for analyzer page
    sessionStorage.setItem("resumeData", JSON.stringify(resumeData));
    sessionStorage.setItem("resumeText", resumeText);
    navigate("/analyzer");
  };

  const handleDeleteHistory = async (id: any) => {
    try {
      const token = localStorage.getItem('token');
      if (token && typeof id === 'string') {
        const response = await fetch(`/api/resumes/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) toast.success("Resume deleted from database");
      }
      
      const newHistory = resumeHistory.filter(item => item.id !== id);
      setResumeHistory(newHistory);
      setStorageItem("resumeHistory", JSON.stringify(newHistory));
      if (!token) toast.success("Saved resume deleted");
    } catch (err) {
      toast.error("Failed to delete resume");
    }
  };

  const handleSaveToDatabase = async () => {
    if (!currentUser) {
      toast.error("Please login to save your resume to the database");
      return;
    }
    
    const resumeId = resumeData.id || Date.now();
    const { id, ...restOfResume } = resumeData; // Exclude it from the rest to avoids duplicates
    const saveBody = {
      id: resumeId,
      title: resumeData.fullName + " - Resume",
      date: new Date().toLocaleString(),
      ...restOfResume
    };

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saveBody)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save');
      
      setResumeData({ ...resumeData, id: resumeId });
      toast.success("Resume saved to database!");
      fetchResumesFromServer();
    } catch (err: any) {
      console.error("Save Error:", err);
      toast.error(err.message || "Failed to save to database - check console for details");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadHistory = async (item: any) => {
    try {
      const token = localStorage.getItem('token');
      if (token && (typeof item.id === 'string' || typeof item.id === 'number')) {
        const response = await fetch(`/api/resumes/${String(item.id)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const fullData = await response.json();
          // The backend returns { ...resume_history_fields, ...data_fields }
          // Or just use the 'data' field directly if we want
          setResumeData(fullData.data || fullData);
        } else {
          setResumeData(item.data);
        }
      } else {
        setResumeData(item.data);
      }
      
      setShowStartScreen(false);
      toast.success("Previous resume configuration loaded!");
    } catch (err) {
      setResumeData(item.data);
      setShowStartScreen(false);
    }
  };

  const startNewResume = () => {
    setResumeData(emptyResume);
    setShowStartScreen(false);
  };

  const loadSample = () => {
    setResumeData({
      fullName: "Your Full Name",
      email: "youremail@gmail.com",
      phone: "+91 9XXXXXXXXX",
      summary: "Results-driven Software Engineer and Machine Learning Developer with strong foundations in Data Structures & Algorithms, full-stack web development (React, Node.js, Flask), and end-to-end ML model integration (XGBoost, scikit-learn). Experienced in building real-world AI-powered applications from data pipeline to deployed UI. Passionate about solving complex problems at the intersection of AI and software engineering. Actively seeking Software Engineering / ML roles to deliver scalable, impactful solutions.",
      skills: "Python, JavaScript, C, C++, Java, React.js, Node.js, Express.js, Flask, REST API, HTML5, CSS3, Tailwind CSS, XGBoost, scikit-learn, pandas, NumPy, matplotlib, seaborn, Data Structures & Algorithms, Git, GitHub, MySQL, MongoDB, Postman, VS Code",
      experience: [],
      education: [
        {
          degree: "B.Tech / B.E. in Computer Science (or your field)",
          institution: "Your College / University Name",
          year: "20XX – 20XX",
        },
      ],
      projects: [
        {
          name: "Hybrid ML Model for Crop Yield Prediction & GHG Emissions Tradeoff",
          technologies: "Python, XGBoost, scikit-learn, Flask, React.js, Node.js, pandas, NumPy, REST API, Matplotlib",
          description:
            "Developed a hybrid machine learning model (XGBoost + ensemble methods) achieving 94%+ R² accuracy in predicting crop yield based on soil, weather, and fertilizer parameters. " +
            "Engineered a RESTful Flask API backend to serve real-time ML inference results, integrated with a React.js frontend delivering interactive charts and farmer-friendly dashboards. " +
            "Implemented GHG emissions tradeoff analysis module enabling data-driven decision-making for sustainable agricultural practices, reducing fertilizer overuse by identifying optimal input ranges. " +
            "Designed and built a full Node.js backend with MySQL for persisting user queries and prediction history; optimized API response time by 40% through data preprocessing pipelines.",
        },
        {
          name: "AI Resume Builder Web Application",
          technologies: "React.js, TypeScript, Tailwind CSS, Node.js, Google Gemini API, localStorage",
          description:
            "Built a full-stack AI-powered resume builder featuring real-time live preview with 6 professional templates (Modern, Creative, Executive, Bold, Compact, Minimalist) and per-template font/size customization. " +
            "Integrated Google Gemini 1.5 API for multilingual meeting/video transcript summarization supporting English, Hindi, and Telugu. " +
            "Implemented persistent resume history using localStorage, ATS job-description keyword analyzer with match scoring, and browser-native PDF export via Tailwind CSS print media queries.",
        },
        {
          name: "Job Description ATS Keyword Analyzer",
          technologies: "TypeScript, React.js, NLP keyword extraction, Synonym mapping",
          description:
            "Developed an NLP-powered resume-to-JD matcher supporting 40+ tech synonym pairs (e.g. ML ↔ Machine Learning, JS ↔ JavaScript) for accurate ATS keyword gap analysis. " +
            "Built a category-wise breakdown dashboard (Programming, Frameworks, Cloud/DevOps, Databases, Soft Skills) with match score percentage and ranked AI suggestions to improve application success rate.",
        },
      ],
      templateId: "modern",
      fontSize: 12,
    });
    setShowStartScreen(false);
    toast.success("ATS-Optimized resume loaded! Update your personal info and education.");
  };

  const handlePrint = () => {
    const previewEl = document.getElementById("resume-preview");
    if (!previewEl) {
      toast.error("Resume preview not found. Please add your details first.");
      return;
    }

    const previewHTML = previewEl.outerHTML;

    const printWindow = window.open("", "_blank", "width=900,height=750");
    if (!printWindow) {
      toast.error("Popup blocked. Please allow popups for this site and try again.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Resume</title>
          <script src="https://cdn.tailwindcss.com"><\/script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
          <style>
            *, *::before, *::after {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: white;
              font-family: 'Inter', sans-serif;
            }
            #resume-preview {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              box-shadow: none !important;
            }
            @media print {
              html, body { margin: 0; padding: 0; }
              #resume-preview {
                width: 210mm;
                min-height: 297mm;
                box-shadow: none !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              @page { size: A4; margin: 0; }
            }
          </style>
        </head>
        <body>
          ${previewHTML}
          <script>
            // Wait for Tailwind and fonts to load then print
            window.addEventListener('load', () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 800);
            });
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // If we are on the start screen, render the welcome selection
  if (showStartScreen) {
    return (
      <div className="container max-w-4xl py-20 flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
        <div className="text-center mb-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-4">
            Welcome to the Builder
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {resumeHistory.length > 0
              ? "Choose whether to start fresh or continue from a previously saved resume."
              : "Create a new professional resume and get started instantly."}
          </p>
        </div>

        <div className={`grid grid-cols-1 gap-8 w-full ${resumeHistory.length > 0 ? "md:grid-cols-3 lg:grid-cols-3" : "md:grid-cols-2 max-w-2xl mx-auto"}`}>
          <Card className="shadow-card hover:shadow-card-hover transition-all cursor-pointer border-primary/20 bg-primary/5 group" onClick={startNewResume}>
            <CardContent className="p-8 flex flex-col items-center text-center h-full justify-center">
              <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Create New Resume</h2>
              <p className="text-muted-foreground">Start fresh with a blank canvas</p>
            </CardContent>
          </Card>

          <ResumeUploader onLoad={(data) => {
            setResumeData(data);
            setShowStartScreen(false);
          }} />

          {resumeHistory.length > 0 && (
            <Card className="shadow-card border-border overflow-hidden flex flex-col">
              <CardHeader className="bg-muted/10 border-b py-4">
                <CardTitle className="text-lg flex items-center justify-center gap-2">
                  <HistoryIcon className="h-5 w-5 text-primary" />
                  Load Previous Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto max-h-[300px]">
                <div className="divide-y">
                  {resumeHistory.map(item => (
                    <div key={item.id} className="p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer" onClick={() => handleLoadHistory(item)}>
                      <div>
                        <h3 className="font-semibold text-sm">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                      <Button size="sm" variant="outline" className="shrink-0" onClick={(e) => { e.stopPropagation(); handleLoadHistory(item); }}>
                        <Download className="h-4 w-4 mr-2" /> Load
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-[1600px] py-10 w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-8 animate-fade-in text-center lg:text-left">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Resume Builder
            </h1>
            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleUndo} 
                disabled={pointer === 0}
                className="h-8 w-8"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRedo} 
                disabled={pointer >= history.length - 1}
                className="h-8 w-8"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={loadSample}>
              Load Sample
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowStartScreen(true)}
              className="text-muted-foreground"
            >
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              Back
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left Side: Form Elements */}
        <div className="space-y-8 flex-1 w-full max-w-full">
          {analysisSuggestions.length > 0 && (
            <Card className="border-primary/20 shadow-sm relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground" 
                onClick={() => setAnalysisSuggestions([])}>
                <X className="h-4 w-4" />
              </Button>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-warning" />
                  AI Suggestions for Editing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisSuggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] text-primary font-medium">
                        {i + 1}
                      </span>
                      <span className="text-foreground">{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {resumeHistory.length > 0 && (
            <Card className="border-border shadow-sm">
              <CardHeader className="bg-muted/10 border-b py-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <HistoryIcon className="h-5 w-5 text-primary" />
                  Previously Saved Resumes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid gap-3">
                {resumeHistory.map(item => (
                  <div key={item.id} className="flex flex-col xl:flex-row items-start xl:items-center justify-between p-3 border rounded-lg bg-background hover:border-primary/50 transition-colors">
                    <div>
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-3 xl:mt-0">
                      <Button variant="outline" size="sm" onClick={() => handleLoadHistory(item)} className="h-8">
                        <Download className="h-4 w-4 mr-2" /> Load
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteHistory(item.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <ResumeForm data={resumeData} onChange={setResumeData} />

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 pb-8 border-t border-border">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleSaveToDatabase} 
              disabled={isSaving}
              className="border-primary/20 hover:border-primary/50 h-12 px-8 w-full sm:w-auto"
            >
              <Save className={`mr-2 h-5 w-5 ${isSaving ? 'animate-pulse' : ''}`} />
              {isSaving ? 'Saving...' : 'Save to DB'}
            </Button>
            <Button size="lg" onClick={handleAnalyze} className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90 h-12 px-8 w-full sm:w-auto">
              Analyze Resume
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Right Side: Preview + Customize Tabs */}
        <div className="lg:sticky lg:top-8 w-full print:static">
          <Card className="shadow-card border-primary/20 bg-muted/30 overflow-hidden">
            <CardHeader className="bg-background border-b py-3 space-y-3">
              {/* Tab switcher + Download */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      previewTab === "preview"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("customize")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      previewTab === "customize"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" /> Customize
                  </button>
                </div>
                <Button onClick={handlePrint} size="sm" className="bg-foreground text-background hover:bg-foreground/90 gap-1.5">
                  <Printer className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>

              {/* Template selector — always visible */}
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <span className="text-xs font-semibold text-muted-foreground">Template:</span>
                <Select value={resumeData.templateId || "modern"} onValueChange={(val) => setResumeData({...resumeData, templateId: val})}>
                  <SelectTrigger className="h-7 w-[155px] text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">📄 Minimalist</SelectItem>
                    <SelectItem value="modern">🎨 Modern</SelectItem>
                    <SelectItem value="creative">✨ Creative</SelectItem>
                    <SelectItem value="executive">👔 Executive</SelectItem>
                    <SelectItem value="bold">⚡ Bold</SelectItem>
                    <SelectItem value="compact">📋 Compact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            {/* Preview tab — A4 live document */}
            {previewTab === "preview" && (
              <CardContent className="p-4 bg-muted/30 flex justify-center items-start overflow-auto" style={{ minHeight: "500px" }}>
                <div
                  className="scale-[0.4] sm:scale-[0.45] md:scale-[0.5] lg:scale-[0.45] xl:scale-[0.55] transition-transform duration-300"
                  style={{
                    width: "210mm",
                    minHeight: "297mm",
                    transformOrigin: "top center",
                  }}
                >
                  <ResumePreview data={resumeData} />
                </div>
              </CardContent>
            )}

            {/* Customize tab — FlowCV-style panel */}
            {previewTab === "customize" && (
              <CardContent className="p-5 bg-muted/10 overflow-y-auto" style={{ maxHeight: "80vh" }}>
                <CustomizationPanel data={resumeData} onChange={setResumeData} />
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
