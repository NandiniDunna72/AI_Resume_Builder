import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import Tesseract from "tesseract.js";

// configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

interface Props {
  onTextExtracted: (text: string) => void;
}

export function ResumeTextExtractor({ onTextExtracted }: Props) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("pdf") && !file.type.includes("image") && !file.type.includes("text")) {
      toast.error("Please upload a PDF, image, or text file.");
      return;
    }

    setLoading(true);
    try {
      let extractedText = "";

      if (file.type.includes("text")) {
        extractedText = await file.text();
      } else if (file.type.includes("pdf")) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pageText = textContent.items.map((item: any) => item.str || "").join(" ");
          
          if (pageText.trim()) {
            fullText += pageText + "\n";
          } else {
            toast.info(`Processing scanned page ${i} with OCR...`, { id: `ocr-toast-${i}` });
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (context) {
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              await page.render({ canvasContext: context, viewport }).promise;
              const result = await Tesseract.recognize(canvas, "eng", {
                logger: m => console.log(m)
              });
              fullText += result.data.text + "\n";
            }
            toast.dismiss(`ocr-toast-${i}`);
          }
        }
        extractedText = fullText;
      } else if (file.type.includes("image")) {
        toast.info("Processing image with OCR. This may take a moment...", { id: "ocr-toast" });
        const result = await Tesseract.recognize(file, "eng", {
          logger: m => console.log(m)
        });
        extractedText = result.data.text;
        toast.dismiss("ocr-toast");
      }

      if (!extractedText.trim()) throw new Error("No text found in document");

      onTextExtracted(extractedText.trim());
      toast.success("Text extracted successfully!");
    } catch (err: any) {
      console.error("Extraction error:", err);
      toast.error(`Failed to extract text: ${err.message || 'Please try again or paste manually.'}`);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="application/pdf,image/*,text/plain"
        onChange={handleFileUpload}
      />
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {loading ? "Extracting..." : "Upload File"}
      </Button>
    </>
  );
}
