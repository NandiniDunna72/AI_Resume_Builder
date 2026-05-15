import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, User, Briefcase, GraduationCap, FolderOpen, Camera } from "lucide-react";
import { toast } from "sonner";
import { AIProjectEnhancer } from "@/components/AIProjectEnhancer";

export interface ResumeData {
  id?: number | string;
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  skills: string;
  experience: { title: string; company: string; duration: string; description: string }[];
  education: { degree: string; institution: string; year: string }[];
  projects: { name: string; description: string; technologies: string }[];
  imageBase64?: string;
  templateId?: string;

  // ── Basics / Spacing ──────────────────────────
  sidebarWidth?: number;       // 20–45 %
  fontSize?: number;           // 8–16 px (maps to ~8.5–14pt)
  lineHeight?: number;         // 1.0–2.0
  marginH?: number;            // 0–8 steps → 8–28mm horizontal margin
  marginV?: number;            // 0–8 steps → 8–28mm vertical margin
  entrySpacing?: number;       // 0–8 steps, space between entries

  // ── Design / Font ─────────────────────────────
  fontFamily?: string;         // full font-family string
  accentColor?: string;        // hex e.g. "#1d4ed8"

  // ── Design / Accent color apply ───────────────
  accentName?: boolean;        // apply accent to name
  accentHeadings?: boolean;    // apply accent to headings
  accentHeadingLine?: boolean; // apply accent to heading line
  accentJobTitle?: boolean;    // apply accent to job title

  // ── Section Headings ──────────────────────────
  headingStyle?: string;       // 'thinLine'|'line'|'underline'|'box'|'simple'|'topBottomLine'|'thickShortUnderline'|'zigZagLine'
  headingCaps?: string;        // 'capitalize'|'uppercase'|'none'
  headingSize?: string;        // 's'|'m'|'l'|'xl'

  // ── Entry / Layout ────────────────────────────
  columns?: string;            // 'one'|'two'|'mix'
  entryLayout?: string;        // 'dateLocationRight'|'dateLocationLeft'|'fullWidth'
  subtitleStyle?: string;      // 'normal'|'bold'|'italic'
  listStyle?: string;          // 'bullet'|'hyphen'

  // ── Header ────────────────────────────────────
  headerAlign?: string;        // 'left'|'center'|'right'
  nameSize?: string;           // 'xs'|'s'|'m'|'l'|'xl'

  // ── Skills section ────────────────────────────
  skillDisplay?: string;       // 'grid'|'level'|'text'|'bubble'
  skillColumns?: string;       // 'one'|'two'|'three'|'four'
}


interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const ResumeForm = ({ data, onChange }: ResumeFormProps) => {
  const update = (field: keyof ResumeData, value: unknown) => onChange({ ...data, [field]: value });

  const addExperience = () => update("experience", [...data.experience, { title: "", company: "", duration: "", description: "" }]);
  const addEducation = () => update("education", [...data.education, { degree: "", institution: "", year: "" }]);
  const addProject = () => update("projects", [...data.projects, { name: "", description: "", technologies: "" }]);

  const removeExperience = (i: number) => update("experience", data.experience.filter((_, idx) => idx !== i));
  const removeEducation = (i: number) => update("education", data.education.filter((_, idx) => idx !== i));
  const removeProject = (i: number) => update("projects", data.projects.filter((_, idx) => idx !== i));

  const updateExperience = (i: number, field: string, value: string) => {
    const updated = [...data.experience];
    updated[i] = { ...updated[i], [field]: value };
    update("experience", updated);
  };

  const updateEducation = (i: number, field: string, value: string) => {
    const updated = [...data.education];
    updated[i] = { ...updated[i], [field]: value };
    update("education", updated);
  };

  const updateProject = (i: number, field: string, value: string) => {
    const updated = [...data.projects];
    updated[i] = { ...updated[i], [field]: value };
    update("projects", updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      update("imageBase64", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Personal Info */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Full Name" value={data.fullName} onChange={e => update("fullName", e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="Email" type="email" value={data.email} onChange={e => update("email", e.target.value)} />
            <Input placeholder="Phone" value={data.phone} onChange={e => update("phone", e.target.value)} />
          </div>
          <Textarea placeholder="Professional Summary" rows={3} value={data.summary} onChange={e => update("summary", e.target.value)} />
          <Textarea placeholder="Skills (comma-separated: Python, React, AWS...)" rows={2} value={data.skills} onChange={e => update("skills", e.target.value)} />
          
          <div className="pt-2 border-t">
            <label className="flex items-center gap-2 text-sm font-medium mb-2 mt-2">
              <Camera className="h-4 w-4" /> Profile Picture (Max 2MB)
            </label>
            <div className="flex items-center gap-4">
              {data.imageBase64 && (
                <div className="relative h-16 w-16 rounded-full overflow-hidden border">
                  <img src={data.imageBase64} alt="Profile preview" className="object-cover h-full w-full" />
                </div>
              )}
              <div className="flex-1">
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
              </div>
              {data.imageBase64 && (
                <Button variant="ghost" size="icon" onClick={() => update("imageBase64", "")} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="shadow-card">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-primary" />
            Experience
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addExperience}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.experience.map((exp, i) => (
            <div key={i} className="space-y-3 p-4 rounded-lg bg-muted/50 relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeExperience(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-10">
                <Input placeholder="Job Title" value={exp.title} onChange={e => updateExperience(i, "title", e.target.value)} />
                <Input placeholder="Company" value={exp.company} onChange={e => updateExperience(i, "company", e.target.value)} />
              </div>
              <Input placeholder="Duration (e.g., Jan 2022 - Present)" value={exp.duration} onChange={e => updateExperience(i, "duration", e.target.value)} />
              <Textarea placeholder="Description" rows={2} value={exp.description} onChange={e => updateExperience(i, "description", e.target.value)} />
            </div>
          ))}
          {data.experience.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No experience added yet</p>}
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="shadow-card">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-primary" />
            Education
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addEducation}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.education.map((edu, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input placeholder="Degree" value={edu.degree} onChange={e => updateEducation(i, "degree", e.target.value)} />
                <Input placeholder="Institution" value={edu.institution} onChange={e => updateEducation(i, "institution", e.target.value)} />
                <Input placeholder="Year" value={edu.year} onChange={e => updateEducation(i, "year", e.target.value)} />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeEducation(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {data.education.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No education added yet</p>}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card className="shadow-card">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="h-5 w-5 text-primary" />
            Projects
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addProject}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.projects.map((proj, i) => (
            <div key={i} className="space-y-3 p-4 rounded-lg bg-muted/50 relative border border-transparent hover:border-primary/20 transition-colors">
              <div className="flex items-start justify-between gap-2 pr-8">
                <Input
                  placeholder="Project Name"
                  value={proj.name}
                  onChange={e => updateProject(i, "name", e.target.value)}
                  className="flex-1"
                />
                <AIProjectEnhancer
                  projectName={proj.name}
                  technologies={proj.technologies}
                  onApply={(desc) => updateProject(i, "description", desc)}
                />
              </div>
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeProject(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Textarea placeholder="Description (or use ✨ AI Enhance above)" rows={3} value={proj.description} onChange={e => updateProject(i, "description", e.target.value)} />
              <Input placeholder="Technologies Used (e.g. Python, React, XGBoost)" value={proj.technologies} onChange={e => updateProject(i, "technologies", e.target.value)} />
            </div>
          ))}
          {data.projects.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No projects added yet</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeForm;
