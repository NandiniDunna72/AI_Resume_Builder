import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Search, Copy, CheckCircle2, FileText, Sparkles, Trash2, History as HistoryIcon, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStorageItem, setStorageItem } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";

const TranscriptGenerator = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState<{text: string; duration: number; offset: number}[]>([]);
  const [copied, setCopied] = useState(false);

  // Summary State
  const [language, setLanguage] = useState("English");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryHistory, setSummaryHistory] = useState<Array<{ id: number, url: string, language: string, text: string, date: string }>>([]);
  const { currentUser } = useAuth();

  const fetchSummaryHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('/api/summaries', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSummaryHistory(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchSummaryHistory();
    } else {
      const storedHistory = getStorageItem("summaryHistory");
      if (storedHistory) {
        try {
          setSummaryHistory(JSON.parse(storedHistory));
        } catch(e) {
          console.error("Failed to parse history", e);
        }
      }
    }
  }, [currentUser]);

  const handleDeleteHistory = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`/api/summaries/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success("History item deleted from database");
      }
      const newHistory = summaryHistory.filter(item => item.id !== id);
      setSummaryHistory(newHistory);
      if (!token) {
        setStorageItem("summaryHistory", JSON.stringify(newHistory));
        toast.success("History item deleted");
      }
    } catch (err) {
      toast.error("Failed to delete history item");
    }
  };

  const fetchTranscript = async () => {
    if (!url.trim()) {
      toast.error("Please enter a YouTube video URL");
      return;
    }

    try {
      // Validate rough URL structure
      if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
        toast.error("Please enter a valid YouTube URL");
        return;
      }

      setIsLoading(true);
      setTranscript([]);
      
      const response = await fetch(`/api/transcript?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch transcript");
      }

      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No transcript found for this video. It might not have captions enabled.");
      }

      setTranscript(data);
      toast.success("Transcript extracted successfully!");
    } catch (error: unknown) {
      console.error(error);
      const e = error as Error;
      toast.error(e.message || "Could not retrieve transcript");
    } finally {
      setIsLoading(false);
    }
  };

  const fullText = transcript.map(t => t.text).join(" ");

  const copyToClipboard = () => {
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success("Transcript copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareSummary = async (text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Meeting Summary",
          text: text,
        });
        toast.success("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Summary copied to clipboard!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const generateSummary = async () => {
    if (!fullText) return;

    setIsSummarizing(true);
    setSummary("");
    
    try {
      const response = await fetch('/api/summaries/generate', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fullText,
          language: language
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate summary.");
      }

      const data = await response.json();
      const generatedText = data.summary;
      
      if (!generatedText) throw new Error("No summary generated");
      
      setSummary(generatedText);
      
      const newHistoryItem = {
        id: Date.now(),
        url: url,
        language: language,
        text: generatedText,
        date: new Date().toLocaleDateString()
      };
      
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/summaries', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newHistoryItem)
        });
        toast.success("Summary generated and saved to database!");
        fetchSummaryHistory();
      } else {
        const updatedHistory = [newHistoryItem, ...summaryHistory];
        setSummaryHistory(updatedHistory);
        setStorageItem("summaryHistory", JSON.stringify(updatedHistory));
        toast.success("Summary generated and saved to local history!");
      }
    } catch (error: unknown) {
      console.error(error);
      const e = error as Error;
      toast.error(e.message || "Could not generate summary");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8 animate-fade-in text-center flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
          <Video className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">
          Meeting Translate
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Instantly extract transcripts from any YouTube video. Just paste the URL below to get started.
        </p>
      </div>

      <Card className="shadow-card border-primary/20 mb-8 animate-slide-up">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input 
              placeholder="Paste YouTube Video URL here (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 h-12 text-md"
              onKeyDown={(e) => e.key === 'Enter' && fetchTranscript()}
            />
            <Button 
              size="lg" 
              onClick={fetchTranscript}
              disabled={isLoading}
              className="gradient-primary text-primary-foreground shadow-glow h-12 px-8 shrink-0 min-w-[160px]"
            >
              {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Search className="mr-2 h-5 w-5" />
              )}
              {isLoading ? "Extracting..." : "Generate Transcript"}
            </Button>
          </div>
        </CardContent>
      </Card>



      {transcript.length > 0 && (
        <Card className="shadow-card animate-slide-up border-primary/20 mt-8 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b py-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Summary Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!summary ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="text-sm text-muted-foreground flex-1">
                    Select your preferred language for the summary:
                  </div>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Telugu">Telugu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={generateSummary} 
                    disabled={isSummarizing}
                    className="gradient-primary shadow-glow text-primary-foreground min-w-[200px]"
                  >
                    {isSummarizing ? (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    {isSummarizing ? "Generating..." : `Summarize in ${language}`}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                    {language} Summary
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleShareSummary(summary)} className="h-8 gap-1.5">
                      <Share2 className="h-3.5 w-3.5" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSummary("")} className="h-8">
                      Generate Again
                    </Button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed p-4 bg-muted/30 rounded-lg">
                  {summary.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-2 last:mb-0">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {summaryHistory.length > 0 && (
        <div className="mt-12 animate-slide-up">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
            <HistoryIcon className="h-6 w-6 text-primary" />
            Previous Summaries
          </h2>
          <div className="grid gap-4">
            {summaryHistory.map((item) => (
              <Card key={item.id} className="shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/10 border-b py-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium text-primary">
                      {item.language} Summary
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.date} • {item.url}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleShareSummary(item.text)} className="h-8 w-8 hover:bg-primary/10">
                      <Share2 className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteHistory(item.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="prose prose-sm max-w-none text-muted-foreground line-clamp-3">
                    {item.text}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptGenerator;
