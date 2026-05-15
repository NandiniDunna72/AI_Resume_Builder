import { useState, useRef } from "react";
import { Upload, FileType, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ResumeData } from "./ResumeForm";
import { Card, CardContent } from "@/components/ui/card";

const API_KEY = "AIzaSyAAXwtYGrgG3o_G_N_sMyATYdl9Kv-ck8A";

interface Props {
  onLoad: (data: ResumeData) => void;
}

export function ResumeUploader({ onLoad }: Props) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("pdf") && !file.type.includes("image")) {
      toast.error("Please upload a PDF or an image file.");
      return;
    }

    setLoading(true);
    try {
      const base64Data = await convertFileToBase64(file);
      const dataStr = base64Data.split(",")[1]; // Remove data url prefix

      const prompt = `Extract all the resume information from this document and return it in the following JSON format ONLY:
{
  "fullName": "...",
  "email": "...",
  "phone": "...",
  "summary": "...",
  "skills": "comma separated list of skills",
  "experience": [
    {
      "company": "...",
      "role": "...",
      "duration": "...",
      "description": "..."
    }
  ],
  "education": [
    {
      "institution": "...",
      "degree": "...",
      "year": "..."
    }
  ],
  "projects": [
    {
      "name": "...",
      "technologies": "...",
      "description": "..."
    }
  ],
  "templateId": "modern"
}
IMPORTANT: Return ONLY a valid JSON string. Do not include markdown formatting like \`\`\`json.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: file.type,
                      data: dataStr,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!res.ok) throw new Error("Gemini API error");
      const data = await res.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No response from AI");

      // Clean up markdown markers if Gemini still adds them
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      const parsedData: ResumeData = JSON.parse(text);
      if (!parsedData.experience) parsedData.experience = [];
      if (!parsedData.education) parsedData.education = [];
      if (!parsedData.projects) parsedData.projects = [];
      onLoad(parsedData);
      toast.success("Resume parsed successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to parse the resume. Please try uploading another file or filling it manually.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all cursor-pointer border-primary/20 bg-primary/5 group" onClick={() => fileInputRef.current?.click()}>
      <CardContent className="p-8 flex flex-col items-center text-center h-full justify-center">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="application/pdf,image/*"
          onChange={handleFileUpload}
        />
        {loading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
            <h2 className="text-2xl font-bold mb-2">Parsing Resume...</h2>
            <p className="text-muted-foreground">Using AI to extract your details</p>
          </div>
        ) : (
          <>
            <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Upload Existing Resume</h2>
            <p className="text-muted-foreground">Upload your PDF or Image to extract details magically</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
