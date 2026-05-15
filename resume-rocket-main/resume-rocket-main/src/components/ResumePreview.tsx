import { ResumeData } from "./ResumeForm";

// Font size step → actual pixel size
const FS_MAP = [8, 9, 10, 10.5, 11, 11.5, 12, 13, 14];
// Line height step → value
const LH_MAP = [1.0, 1.1, 1.15, 1.2, 1.3, 1.4, 1.5, 1.7, 2.0];
// Margin steps → mm string values
const MH_MAP = ["6mm","8mm","10mm","12mm","14mm","16mm","18mm","22mm","28mm"];
const MV_MAP = ["6mm","8mm","10mm","12mm","14mm","16mm","18mm","22mm","28mm"];
// Entry spacing steps → px gap values
const ES_MAP = [0, 2, 4, 6, 8, 10, 12, 16, 20];

export const ResumePreview = ({ data }: { data: ResumeData }) => {
  const template = data.templateId || "modern";
  const sw = data.sidebarWidth ?? 33;
  const mainWidth = 100 - sw;

  // Spacing / typography
  const fsStep = data.fontSize ?? 5;            // step index 0–8
  const lhStep = data.lineHeight ?? 5;          // step index 0–8
  const fs = FS_MAP[Math.min(8, Math.max(0, fsStep))];
  const lh = LH_MAP[Math.min(8, Math.max(0, lhStep))];

  // Margins
  const mhStep = data.marginH ?? 2;
  const mvStep = data.marginV ?? 3;
  const mh = MH_MAP[Math.min(8, Math.max(0, mhStep))];
  const mv = MV_MAP[Math.min(8, Math.max(0, mvStep))];
  const esgap = ES_MAP[Math.min(8, Math.max(0, data.entrySpacing ?? 0))];

  // Design
  const accent = data.accentColor ?? "#1d4ed8";
  const headingStyle = data.headingStyle ?? "thinLine";
  const headingCaps  = data.headingCaps  ?? "capitalize";
  const headingSize  = data.headingSize  ?? "xl";

  // Name size multiplier
  const nameSizeMap: Record<string, number> = { xs: 1.5, s: 1.8, m: 2.2, l: 2.8, xl: 3.2 };
  const nameMult = nameSizeMap[data.nameSize ?? "s"] ?? 1.8;

  // Header alignment
  const headerAlign = data.headerAlign ?? "left";

  // Heading font size from headingSize
  const hsFontMult: Record<string, number> = { s: 0.95, m: 1.05, l: 1.15, xl: 1.25 };
  const hsFm = hsFontMult[headingSize] ?? 1.05;

  // Apply accent flags
  const applyAccentName     = data.accentName     ?? true;
  const applyAccentHeadings = data.accentHeadings ?? true;
  const applyAccentLine     = data.accentHeadingLine ?? true;

  // fontFamily: user pick overrides template default
  const defaultFont: Record<string, string> = {
    simple:      "Georgia, serif",
    modern:      "'Inter', sans-serif",
    creative:    "'Inter', sans-serif",
    executive:   "Georgia, serif",
    bold:        "'Inter', sans-serif",
    compact:     "Arial, sans-serif",
    academic:    "'EB Garamond', 'Times New Roman', serif",
    elegant:     "Lora, Georgia, serif",
    timeline:    "'Inter', sans-serif",
    infographic: "'Inter', sans-serif",
  };
  const ff = data.fontFamily || defaultFont[template] || "'Inter', sans-serif";

  // Heading text transform
  const capStyle: React.CSSProperties = {
    textTransform: headingCaps === "uppercase" ? "uppercase" : headingCaps === "capitalize" ? "capitalize" : "none",
    letterSpacing: headingCaps === "uppercase" ? "0.08em" : "0.04em",
  };

  // Heading decoration
  const HeadingLine = ({ color = accent }: { color?: string }) => {
    if (!applyAccentLine || headingStyle === "simple") return null;
    if (headingStyle === "underline" || headingStyle === "thickShortUnderline")
      return <div style={{ height: headingStyle === "thickShortUnderline" ? "4px" : "2.5px", width: "40px", background: color, marginTop: "2px" }} />;
    if (headingStyle === "box") return null;
    if (headingStyle === "topBottomLine") return null; // top line handled in wrapper
    return <div style={{ height: headingStyle === "thinLine" ? "1px" : "2px", background: color, marginTop: "3px", width: "100%" }} />;
  };

  // Section heading wrapper
  const SectionHeading = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => {
    const base: React.CSSProperties = {
      fontSize: `${fs * hsFm}px`,
      marginBottom: "8px",
      color: light ? "white" : (applyAccentHeadings ? accent : "#111"),
      fontWeight: "bold",
      ...capStyle,
    };
    if (headingStyle === "box") {
      return (
        <div style={{ border: `1.5px solid ${light ? "rgba(255,255,255,0.3)" : accent}`, borderRadius: "4px", padding: "2px 8px", display: "inline-block", marginBottom: "8px" }}>
          <span style={base}>{children}</span>
        </div>
      );
    }
    if (headingStyle === "topBottomLine") {
      return (
        <div style={{ borderTop: `2px solid ${light ? "rgba(255,255,255,0.4)" : accent}`, borderBottom: `2px solid ${light ? "rgba(255,255,255,0.4)" : accent}`, padding: "3px 0", marginBottom: "8px" }}>
          <span style={base}>{children}</span>
        </div>
      );
    }
    return (
      <div style={{ marginBottom: "8px" }}>
        <div style={base}>{children}</div>
        <HeadingLine color={light ? "rgba(255,255,255,0.4)" : accent} />
      </div>
    );
  };

  // List item bullet/hyphen
  const bullet = data.listStyle === "hyphen" ? "– " : "• ";


  if (template === "simple") {
    return (
      <div id="resume-preview" className="bg-white text-black max-w-[210mm] min-h-[297mm] shadow-lg mx-auto" style={{ fontFamily: ff, fontSize: `${fs}px`, lineHeight: lh, padding: `${mv} ${mh}` }}>
        <div className="mb-6 border-b-2 border-black pb-4" style={{ textAlign: headerAlign as any }}>
          <h1 style={{ fontSize: `${fs * nameMult}px`, color: applyAccentName ? accent : "#111" }} className="font-bold uppercase tracking-wider">{data.fullName || "Your Name"}</h1>
          <p className="mt-2 text-gray-600" style={{ fontSize: `${fs * 0.9}px` }}>{data.email} | {data.phone}</p>
        </div>
        {data.summary && (<div className="mb-5"><h2 className="font-bold border-b border-gray-300 mb-2 uppercase tracking-wide" style={{ fontSize: `${fs * 1.05}px` }}>Professional Summary</h2><p className="text-gray-700 leading-relaxed" style={{ fontSize: `${fs * 0.9}px` }}>{data.summary}</p></div>)}
        {data.skills && (<div className="mb-5"><h2 className="font-bold border-b border-gray-300 mb-2 uppercase tracking-wide" style={{ fontSize: `${fs * 1.05}px` }}>Core Competencies</h2><p className="text-gray-700" style={{ fontSize: `${fs * 0.9}px` }}>{data.skills}</p></div>)}
        {data.experience.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold border-b border-gray-300 mb-3 uppercase tracking-wide" style={{ fontSize: `${fs * 1.05}px` }}>Professional Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between font-bold text-black"><span>{exp.title}</span><span style={{ fontSize: `${fs * 0.85}px` }}>{exp.duration}</span></div>
                  <div className="italic text-gray-600 mb-1" style={{ fontSize: `${fs * 0.9}px` }}>{exp.company}</div>
                  <p className="text-gray-700 leading-relaxed" style={{ fontSize: `${fs * 0.85}px` }}>{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.education.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold border-b border-gray-300 mb-3 uppercase tracking-wide" style={{ fontSize: `${fs * 1.05}px` }}>Education</h2>
            {data.education.map((edu, i) => (
              <div key={i} className="flex justify-between"><div><div className="font-bold">{edu.degree}</div><div className="italic text-gray-600" style={{ fontSize: `${fs * 0.9}px` }}>{edu.institution}</div></div><span style={{ fontSize: `${fs * 0.85}px` }} className="font-bold">{edu.year}</span></div>
            ))}
          </div>
        )}
        {data.projects.length > 0 && (
          <div>
            <h2 className="font-bold border-b border-gray-300 mb-3 uppercase tracking-wide" style={{ fontSize: `${fs * 1.05}px` }}>Projects</h2>
            <div className="space-y-3">
              {data.projects.map((proj, i) => (
                <div key={i}><div className="font-bold">{proj.name}</div><div className="italic text-gray-500" style={{ fontSize: `${fs * 0.85}px` }}>Tech: {proj.technologies}</div><p className="text-gray-700 leading-relaxed" style={{ fontSize: `${fs * 0.85}px` }}>{proj.description}</p></div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ──── 2. CREATIVE (Purple accents, two-col lower body) ────
  if (template === "creative") {
    const accent = "#6366f1";
    return (
      <div id="resume-preview" className="bg-white text-black max-w-[210mm] min-h-[297mm] shadow-lg mx-auto relative overflow-hidden" style={{ fontFamily: ff, fontSize: `${fs}px` }}>
        <div className="h-3 w-full absolute top-0 left-0" style={{ background: accent }} />
        <div className="p-8 pt-11 flex items-center gap-6 bg-gray-50 border-b">
          {data.imageBase64 && <img src={data.imageBase64} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white shadow object-cover" />}
          <div><h1 style={{ fontSize: `${fs * 2.4}px` }} className="font-extrabold text-gray-900 tracking-tight">{data.fullName || "Your Name"}</h1><p className="mt-1 font-semibold" style={{ color: accent, fontSize: `${fs * 0.85}px` }}>{data.email} • {data.phone}</p></div>
        </div>
        <div className="p-8 space-y-5">
          {data.summary && (<div><span className="px-3 py-1 rounded uppercase font-bold tracking-widest inline-block mb-2" style={{ background: `${accent}1a`, color: accent, fontSize: `${fs * 0.7}px` }}>Profile</span><p className="text-gray-600 leading-relaxed font-medium" style={{ fontSize: `${fs * 0.92}px` }}>{data.summary}</p></div>)}
          {data.skills && (<div><span className="px-3 py-1 rounded uppercase font-bold tracking-widest inline-block mb-2" style={{ background: `${accent}1a`, color: accent, fontSize: `${fs * 0.7}px` }}>Skills</span><div className="flex flex-wrap gap-2">{data.skills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => <span key={i} className="bg-gray-100 border border-gray-200 text-gray-700 px-2 py-0.5 rounded font-semibold" style={{ fontSize: `${fs * 0.8}px` }}>{s}</span>)}</div></div>)}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div>
              {data.experience.length > 0 && (<div><span className="px-3 py-1 rounded uppercase font-bold tracking-widest inline-block mb-3" style={{ background: `${accent}1a`, color: accent, fontSize: `${fs * 0.7}px` }}>Experience</span><div className="border-l-2 border-gray-100 pl-4 space-y-4">{data.experience.map((exp, i) => <div key={i} className="relative"><div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full" style={{ background: accent }} /><div className="font-bold text-gray-900">{exp.title}</div><div className="font-semibold mb-1" style={{ color: accent, fontSize: `${fs * 0.8}px` }}>{exp.company} | {exp.duration}</div><p className="text-gray-500 leading-relaxed" style={{ fontSize: `${fs * 0.82}px` }}>{exp.description}</p></div>)}</div></div>)}
            </div>
            <div>
              {data.education.length > 0 && (<div className="mb-4"><span className="px-3 py-1 rounded uppercase font-bold tracking-widest inline-block mb-3" style={{ background: `${accent}1a`, color: accent, fontSize: `${fs * 0.7}px` }}>Education</span>{data.education.map((edu, i) => <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-2"><div className="font-bold text-gray-900" style={{ fontSize: `${fs * 0.95}px` }}>{edu.degree}</div><div className="text-gray-500" style={{ fontSize: `${fs * 0.8}px` }}>{edu.institution}</div><div className="font-semibold" style={{ color: accent, fontSize: `${fs * 0.8}px` }}>{edu.year}</div></div>)}</div>)}
              {data.projects.length > 0 && (<div><span className="px-3 py-1 rounded uppercase font-bold tracking-widest inline-block mb-3" style={{ background: `${accent}1a`, color: accent, fontSize: `${fs * 0.7}px` }}>Projects</span>{data.projects.map((proj, i) => <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-2"><div className="font-bold text-gray-900">{proj.name}</div><div className="font-bold uppercase" style={{ color: accent, fontSize: `${fs * 0.72}px` }}>{proj.technologies}</div><p className="text-gray-500 leading-relaxed" style={{ fontSize: `${fs * 0.82}px` }}>{proj.description}</p></div>)}</div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──── 3. EXECUTIVE (Bold header band, clean single column) ────
  if (template === "executive") {
    return (
      <div id="resume-preview" className="bg-white text-black max-w-[210mm] min-h-[297mm] shadow-lg mx-auto" style={{ fontFamily: ff, fontSize: `${fs}px` }}>
        {/* Header Band */}
        <div className="bg-[#0f172a] text-white px-10 py-8">
          {data.imageBase64 && <img src={data.imageBase64} alt="Profile" className="w-20 h-20 rounded-full border-2 border-slate-500 object-cover float-right ml-4" />}
          <h1 style={{ fontSize: `${fs * 2.5}px` }} className="font-bold tracking-wide uppercase">{data.fullName || "Your Name"}</h1>
          <p className="mt-2 text-slate-400" style={{ fontSize: `${fs * 0.88}px` }}>{data.email} &nbsp;|&nbsp; {data.phone}</p>
          {data.summary && <p className="mt-4 text-slate-300 leading-relaxed italic" style={{ fontSize: `${fs * 0.88}px` }}>{data.summary}</p>}
        </div>
        {/* Skills band */}
        {data.skills && (
          <div className="bg-[#1e3a5f] text-white px-10 py-3 flex flex-wrap gap-3">
            {data.skills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => <span key={i} className="text-slate-200" style={{ fontSize: `${fs * 0.82}px` }}>◆ {s}</span>)}
          </div>
        )}
        {/* Body */}
        <div className="px-10 py-6 space-y-6">
          {data.experience.length > 0 && (
            <div>
              <h2 className="font-bold text-[#0f172a] uppercase tracking-widest border-b-2 border-[#0f172a] pb-1 mb-4" style={{ fontSize: `${fs * 1.05}px` }}>Experience</h2>
              <div className="space-y-5">
                {data.experience.map((exp, i) => (
                  <div key={i}><div className="flex justify-between font-bold text-[#0f172a]"><span style={{ fontSize: `${fs * 1.02}px` }}>{exp.title}</span><span className="text-gray-500 font-normal" style={{ fontSize: `${fs * 0.85}px` }}>{exp.duration}</span></div><div className="text-[#1e3a5f] font-semibold mb-1" style={{ fontSize: `${fs * 0.9}px` }}>{exp.company}</div><p className="text-gray-600 leading-relaxed" style={{ fontSize: `${fs * 0.87}px` }}>{exp.description}</p></div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-8">
            {data.education.length > 0 && (
              <div>
                <h2 className="font-bold text-[#0f172a] uppercase tracking-widest border-b-2 border-[#0f172a] pb-1 mb-3" style={{ fontSize: `${fs * 1.05}px` }}>Education</h2>
                {data.education.map((edu, i) => <div key={i} className="mb-2"><div className="font-bold">{edu.degree}</div><div className="text-gray-500 italic" style={{ fontSize: `${fs * 0.88}px` }}>{edu.institution} · {edu.year}</div></div>)}
              </div>
            )}
            {data.projects.length > 0 && (
              <div>
                <h2 className="font-bold text-[#0f172a] uppercase tracking-widest border-b-2 border-[#0f172a] pb-1 mb-3" style={{ fontSize: `${fs * 1.05}px` }}>Projects</h2>
                {data.projects.map((proj, i) => <div key={i} className="mb-2"><div className="font-bold">{proj.name}</div><div className="text-[#1e3a5f]" style={{ fontSize: `${fs * 0.82}px` }}>{proj.technologies}</div><p className="text-gray-500" style={{ fontSize: `${fs * 0.85}px` }}>{proj.description}</p></div>)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ──── 4. BOLD (Left teal accent bar, striking typography) ────
  if (template === "bold") {
    return (
      <div id="resume-preview" className="bg-white text-black max-w-[210mm] min-h-[297mm] shadow-lg mx-auto flex" style={{ fontFamily: ff, fontSize: `${fs}px` }}>
        {/* Thin left color bar */}
        <div className="w-3 bg-[#0891b2] shrink-0" />
        <div className="flex-1">
          {/* Header */}
          <div className="px-8 pt-8 pb-5 border-b-4 border-[#0891b2]">
            <div className="flex items-start justify-between">
              <div>
                <h1 style={{ fontSize: `${fs * 2.8}px` }} className="font-black text-gray-900 leading-none tracking-tight">{data.fullName || "YOUR NAME"}</h1>
                <p className="mt-2 text-[#0891b2] font-bold" style={{ fontSize: `${fs * 0.85}px` }}>{data.email} • {data.phone}</p>
              </div>
              {data.imageBase64 && <img src={data.imageBase64} alt="Profile" className="w-20 h-20 rounded-full border-4 border-[#0891b2] object-cover" />}
            </div>
            {data.summary && <p className="mt-4 text-gray-600 leading-relaxed" style={{ fontSize: `${fs * 0.88}px` }}>{data.summary}</p>}
          </div>
          {/* Content */}
          <div className="px-8 py-6 space-y-5">
            {data.skills && (
              <div><h2 className="font-black text-[#0891b2] uppercase tracking-widest mb-2" style={{ fontSize: `${fs * 0.78}px` }}>Skills</h2><div className="flex flex-wrap gap-2">{data.skills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => <span key={i} className="border-2 border-[#0891b2] text-[#0891b2] px-2 py-0.5 rounded font-bold" style={{ fontSize: `${fs * 0.8}px` }}>{s}</span>)}</div></div>
            )}
            {data.experience.length > 0 && (
              <div><h2 className="font-black text-[#0891b2] uppercase tracking-widest mb-3" style={{ fontSize: `${fs * 0.78}px` }}>Experience</h2><div className="space-y-4">{data.experience.map((exp, i) => <div key={i}><div className="flex justify-between items-baseline"><span className="font-bold text-gray-900" style={{ fontSize: `${fs * 1.05}px` }}>{exp.title}</span><span className="text-gray-400" style={{ fontSize: `${fs * 0.82}px` }}>{exp.duration}</span></div><div className="font-semibold text-gray-500 mb-1" style={{ fontSize: `${fs * 0.88}px` }}>{exp.company}</div><p className="text-gray-600 leading-relaxed" style={{ fontSize: `${fs * 0.85}px` }}>{exp.description}</p></div>)}</div></div>
            )}
            <div className="grid grid-cols-2 gap-6">
              {data.education.length > 0 && (<div><h2 className="font-black text-[#0891b2] uppercase tracking-widest mb-3" style={{ fontSize: `${fs * 0.78}px` }}>Education</h2>{data.education.map((edu, i) => <div key={i} className="mb-2"><div className="font-bold">{edu.degree}</div><div className="text-gray-500" style={{ fontSize: `${fs * 0.88}px` }}>{edu.institution} · {edu.year}</div></div>)}</div>)}
              {data.projects.length > 0 && (<div><h2 className="font-black text-[#0891b2] uppercase tracking-widest mb-3" style={{ fontSize: `${fs * 0.78}px` }}>Projects</h2>{data.projects.map((proj, i) => <div key={i} className="mb-2"><div className="font-bold">{proj.name}</div><div className="text-[#0891b2]" style={{ fontSize: `${fs * 0.8}px` }}>{proj.technologies}</div><p className="text-gray-500" style={{ fontSize: `${fs * 0.85}px` }}>{proj.description}</p></div>)}</div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──── 5. COMPACT (Dense info-packed, green accent) ────
  if (template === "compact") {
    return (
      <div id="resume-preview" className="bg-white text-black max-w-[210mm] min-h-[297mm] shadow-lg mx-auto" style={{ fontFamily: ff, fontSize: `${fs}px` }}>
        <div className="bg-[#16a34a] text-white px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ fontSize: `${fs * 1.9}px` }} className="font-bold tracking-wide">{data.fullName || "Your Name"}</h1>
              <p style={{ fontSize: `${fs * 0.82}px` }} className="mt-1 text-green-100">{data.email} | {data.phone}</p>
            </div>
            {data.imageBase64 && <img src={data.imageBase64} alt="Profile" className="w-16 h-16 rounded-full border-2 border-green-300 object-cover" />}
          </div>
        </div>
        <div className="flex">
          {/* Left sidebar */}
          <div className="p-5 bg-green-50 border-r border-green-100 shrink-0" style={{ width: `${sw}%` }}>
            {data.skills && (<div className="mb-4"><h2 className="font-bold text-[#16a34a] uppercase tracking-wide border-b border-green-200 pb-1 mb-2" style={{ fontSize: `${fs * 0.82}px` }}>Skills</h2>{data.skills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => <div key={i} className="text-gray-700 py-0.5 flex items-center gap-1" style={{ fontSize: `${fs * 0.82}px` }}><span className="text-[#16a34a]">▸</span> {s}</div>)}</div>)}
            {data.education.length > 0 && (<div><h2 className="font-bold text-[#16a34a] uppercase tracking-wide border-b border-green-200 pb-1 mb-2" style={{ fontSize: `${fs * 0.82}px` }}>Education</h2>{data.education.map((edu, i) => <div key={i} className="mb-2"><div className="font-bold" style={{ fontSize: `${fs * 0.88}px` }}>{edu.degree}</div><div className="text-gray-500" style={{ fontSize: `${fs * 0.78}px` }}>{edu.institution}</div><div className="text-[#16a34a] font-semibold" style={{ fontSize: `${fs * 0.78}px` }}>{edu.year}</div></div>)}</div>)}
          </div>
          {/* Right main */}
          <div className="p-5 flex-1">
            {data.summary && (<div className="mb-4"><h2 className="font-bold text-[#16a34a] uppercase tracking-wide border-b border-gray-200 pb-1 mb-2" style={{ fontSize: `${fs * 0.82}px` }}>Summary</h2><p className="text-gray-700 leading-relaxed" style={{ fontSize: `${fs * 0.88}px` }}>{data.summary}</p></div>)}
            {data.experience.length > 0 && (<div className="mb-4"><h2 className="font-bold text-[#16a34a] uppercase tracking-wide border-b border-gray-200 pb-1 mb-2" style={{ fontSize: `${fs * 0.82}px` }}>Experience</h2><div className="space-y-3">{data.experience.map((exp, i) => <div key={i}><div className="flex justify-between font-bold" style={{ fontSize: `${fs * 0.92}px` }}><span>{exp.title}</span><span className="text-gray-400 font-normal" style={{ fontSize: `${fs * 0.78}px` }}>{exp.duration}</span></div><div className="text-gray-500 mb-0.5" style={{ fontSize: `${fs * 0.82}px` }}>{exp.company}</div><p className="text-gray-600" style={{ fontSize: `${fs * 0.82}px` }}>{exp.description}</p></div>)}</div></div>)}
            {data.projects.length > 0 && (<div><h2 className="font-bold text-[#16a34a] uppercase tracking-wide border-b border-gray-200 pb-1 mb-2" style={{ fontSize: `${fs * 0.82}px` }}>Projects</h2><div className="space-y-2">{data.projects.map((proj, i) => <div key={i}><span className="font-bold" style={{ fontSize: `${fs * 0.9}px` }}>{proj.name}</span> <span className="text-[#16a34a]" style={{ fontSize: `${fs * 0.78}px` }}>({proj.technologies})</span><p className="text-gray-600" style={{ fontSize: `${fs * 0.82}px` }}>{proj.description}</p></div>)}</div></div>)}
          </div>
        </div>
      </div>
    );
  }

  // ──── 7. ACADEMIC (EB Garamond, ivory bg, double-rule header) ────
  if (template === "academic") {
    return (
      <div id="resume-preview" className="text-black max-w-[210mm] min-h-[297mm] shadow-lg mx-auto" style={{ fontFamily: ff, fontSize: `${fs}px`, lineHeight: lh, padding: `${mv} ${mh}`, background: "#fffdf7" }}>
        {/* Header */}
        <div className="mb-5 pb-3" style={{ textAlign: headerAlign as any }}>
          <h1 className="font-bold uppercase tracking-widest" style={{ fontSize: `${fs * nameMult}px`, color: applyAccentName ? accent : "#111" }}>{data.fullName || "Your Name"}</h1>
          <div className="my-1 border-t-2 border-b border-black py-0.5 border-b-black/30" style={{ textAlign: "center" as any }}>
            <span className="text-gray-600" style={{ fontSize: `${fs * 0.85}px` }}>{data.email}  ·  {data.phone}</span>
          </div>
        </div>
        {data.summary && (<div className="mb-5"><SectionHeading>Summary</SectionHeading><p className="text-gray-700 leading-relaxed" style={{ fontSize: `${fs * 0.92}px` }}>{data.summary}</p></div>)}
        {data.skills && (<div className="mb-5"><SectionHeading>Core Skills</SectionHeading><p className="text-gray-700" style={{ fontSize: `${fs * 0.9}px` }}>{data.skills}</p></div>)}
        {data.experience.length > 0 && (
          <div className="mb-5">
            <SectionHeading>Experience</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: `${esgap + 6}px` }}>
              {data.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold" style={{ fontSize: `${fs}px` }}>{exp.title}</span>
                    <span className="italic text-gray-500" style={{ fontSize: `${fs * 0.85}px` }}>{exp.duration}</span>
                  </div>
                  <div className="italic text-gray-600 mb-1" style={{ fontSize: `${fs * 0.9}px` }}>{exp.company}</div>
                  <p className="text-gray-700" style={{ fontSize: `${fs * 0.88}px` }}>{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.education.length > 0 && (
          <div className="mb-5">
            <SectionHeading>Education</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: `${esgap + 4}px` }}>
              {data.education.map((edu, i) => (
                <div key={i} className="flex justify-between items-baseline">
                  <div><span className="font-bold" style={{ fontSize: `${fs}px` }}>{edu.degree}</span><span className="text-gray-600 ml-2 italic" style={{ fontSize: `${fs * 0.9}px` }}>{edu.institution}</span></div>
                  <span className="text-gray-500" style={{ fontSize: `${fs * 0.85}px` }}>{edu.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.projects.length > 0 && (
          <div>
            <SectionHeading>Research & Projects</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: `${esgap + 6}px` }}>
              {data.projects.map((proj, i) => (
                <div key={i}>
                  <span className="font-bold" style={{ fontSize: `${fs}px` }}>{proj.name}</span>
                  <span className="italic text-gray-500 ml-2" style={{ fontSize: `${fs * 0.85}px` }}>({proj.technologies})</span>
                  <p className="text-gray-700 mt-0.5" style={{ fontSize: `${fs * 0.88}px` }}>{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ──── 8. ELEGANT (Centered header, thin ornamental lines) ────
  if (template === "elegant") {
    return (
      <div id="resume-preview" className="text-black max-w-[210mm] min-h-[297mm] shadow-lg mx-auto" style={{ fontFamily: ff, fontSize: `${fs}px`, lineHeight: lh, padding: `${mv} ${mh}`, background: "#fafaf9" }}>
        {/* Centered header */}
        <div className="text-center mb-6">
          <h1 className="font-bold tracking-[0.18em] uppercase" style={{ fontSize: `${fs * nameMult}px`, color: applyAccentName ? accent : "#292524" }}>{data.fullName || "Your Name"}</h1>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div style={{ flex: 1, height: "0.5px", background: "#d6d3d1" }} />
            <span className="text-stone-400 tracking-widest text-[10px]" style={{ fontSize: `${fs * 0.82}px` }}>{data.email}  ✦  {data.phone}</span>
            <div style={{ flex: 1, height: "0.5px", background: "#d6d3d1" }} />
          </div>
        </div>
        {data.summary && (<div className="mb-6 text-center"><p className="text-stone-500 italic leading-relaxed mx-auto" style={{ fontSize: `${fs * 0.9}px`, maxWidth: "80%" }}>{data.summary}</p></div>)}
        {data.skills && (
          <div className="mb-6">
            <SectionHeading>Skills & Expertise</SectionHeading>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {data.skills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => (
                <span key={i} className="text-stone-600" style={{ fontSize: `${fs * 0.9}px` }}>✦ {s}</span>
              ))}
            </div>
          </div>
        )}
        {data.experience.length > 0 && (
          <div className="mb-6">
            <SectionHeading>Professional Experience</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: `${esgap + 6}px` }}>
              {data.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold tracking-wide" style={{ fontSize: `${fs}px`, color: accent }}>{exp.title}</span>
                    <span className="text-stone-400 italic" style={{ fontSize: `${fs * 0.85}px` }}>{exp.duration}</span>
                  </div>
                  <div className="text-stone-500 mb-1" style={{ fontSize: `${fs * 0.88}px` }}>{exp.company}</div>
                  <p className="text-stone-600 leading-relaxed" style={{ fontSize: `${fs * 0.88}px` }}>{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.education.length > 0 && (
          <div className="mb-6">
            <SectionHeading>Education</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: `${esgap + 4}px` }}>
              {data.education.map((edu, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <div className="font-semibold tracking-wide" style={{ color: accent, fontSize: `${fs}px` }}>{edu.degree}</div>
                    <div className="text-stone-500" style={{ fontSize: `${fs * 0.88}px` }}>{edu.institution}</div>
                  </div>
                  <div className="italic text-stone-400" style={{ fontSize: `${fs * 0.85}px` }}>{edu.year}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.projects.length > 0 && (
          <div>
            <SectionHeading>Notable Projects</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: `${esgap + 6}px` }}>
              {data.projects.map((proj, i) => (
                <div key={i}>
                  <div className="font-semibold tracking-wide" style={{ color: accent, fontSize: `${fs}px` }}>{proj.name}</div>
                  <div className="text-stone-400 italic" style={{ fontSize: `${fs * 0.82}px` }}>{proj.technologies}</div>
                  <p className="text-stone-600 leading-relaxed" style={{ fontSize: `${fs * 0.88}px` }}>{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ──── 9. TIMELINE (Left timeline, dot milestones) ────
  if (template === "timeline") {
    return (
      <div id="resume-preview" className="bg-white text-black max-w-[210mm] min-h-[297mm] shadow-lg mx-auto" style={{ fontFamily: ff, fontSize: `${fs}px`, lineHeight: lh, padding: `${mv} ${mh}` }}>
        {/* Header */}
        <div className="mb-5 pb-3 border-b-2" style={{ borderColor: accent, textAlign: headerAlign as any }}>
          <h1 className="font-black" style={{ fontSize: `${fs * nameMult}px`, color: applyAccentName ? accent : "#0f172a" }}>{data.fullName || "Your Name"}</h1>
          <p className="text-slate-500 mt-1" style={{ fontSize: `${fs * 0.85}px` }}>{data.email}  ·  {data.phone}</p>
          {data.summary && <p className="text-slate-600 mt-2 leading-relaxed" style={{ fontSize: `${fs * 0.88}px` }}>{data.summary}</p>}
        </div>
        {data.skills && (
          <div className="mb-6">
            <SectionHeading>Skills</SectionHeading>
            <div className="flex flex-wrap gap-2">
              {data.skills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full border" style={{ fontSize: `${fs * 0.82}px`, borderColor: accent, color: accent }}>{s}</span>
              ))}
            </div>
          </div>
        )}
        {/* Experience timeline */}
        {data.experience.length > 0 && (
          <div className="mb-6">
            <SectionHeading>Experience</SectionHeading>
            <div className="relative ml-4">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
              <div style={{ display: "flex", flexDirection: "column", gap: `${esgap + 10}px` }}>
                {data.experience.map((exp, i) => (
                  <div key={i} className="relative pl-7">
                    <div className="absolute left-[-5px] top-1.5 w-3 h-3 rounded-full border-2 border-white" style={{ background: accent }} />
                    <div className="font-bold" style={{ fontSize: `${fs * 0.95}px`, color: "#0f172a" }}>{exp.title}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500" style={{ fontSize: `${fs * 0.85}px` }}>{exp.company}</span>
                      <span className="text-xs px-1.5 rounded" style={{ background: `${accent}1a`, color: accent, fontSize: `${fs * 0.78}px` }}>{exp.duration}</span>
                    </div>
                    <p className="text-slate-500 mt-1 leading-relaxed" style={{ fontSize: `${fs * 0.83}px` }}>{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {data.projects.length > 0 && (
          <div className="mb-6">
            <SectionHeading>Projects</SectionHeading>
            <div className="relative ml-4">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
              <div style={{ display: "flex", flexDirection: "column", gap: `${esgap + 10}px` }}>
                {data.projects.map((proj, i) => (
                  <div key={i} className="relative pl-7">
                    <div className="absolute left-[-5px] top-1.5 w-3 h-3 rounded-full border-2 border-white" style={{ background: accent }} />
                    <div className="font-bold" style={{ fontSize: `${fs * 0.95}px` }}>{proj.name}</div>
                    <div style={{ color: accent, fontSize: `${fs * 0.82}px` }}>{proj.technologies}</div>
                    <p className="text-slate-500 leading-relaxed" style={{ fontSize: `${fs * 0.83}px` }}>{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {data.education.length > 0 && (
          <div>
            <SectionHeading>Education</SectionHeading>
            <div className="relative ml-4">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
              <div style={{ display: "flex", flexDirection: "column", gap: `${esgap + 8}px` }}>
                {data.education.map((edu, i) => (
                  <div key={i} className="relative pl-7">
                    <div className="absolute left-[-5px] top-1.5 w-3 h-3 rounded-full border-2 border-white" style={{ background: accent }} />
                    <div className="font-bold" style={{ fontSize: `${fs * 0.92}px` }}>{edu.degree}</div>
                    <div className="text-slate-500" style={{ fontSize: `${fs * 0.85}px` }}>{edu.institution}  ·  {edu.year}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ──── 10. INFOGRAPHIC (Dark sidebar with skill bars, profile circle) ────
  if (template === "infographic") {
    return (
      <div id="resume-preview" className="bg-white text-black max-w-[210mm] min-h-[297mm] shadow-lg mx-auto flex" style={{ fontFamily: ff, fontSize: `${fs}px`, lineHeight: lh }}>
        {/* Dark left sidebar */}
        <div className="text-white p-5 shrink-0 flex flex-col" style={{ width: `${sw}%`, background: "#0f172a" }}>
          {data.imageBase64 ? (
            <div className="flex justify-center mb-4">
              <img src={data.imageBase64} alt="Profile" className="rounded-full border-4 border-slate-600 object-cover" style={{ width: `${sw * 2.5}px`, height: `${sw * 2.5}px` }} />
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-600" style={{ width: `${sw * 2.5}px`, height: `${sw * 2.5}px` }}>
                <span style={{ fontSize: `${fs * 2}px`, color: "#94a3b8" }}>👤</span>
              </div>
            </div>
          )}
          <div className="text-center mb-5">
            <div className="font-bold text-white" style={{ fontSize: `${fs * 1.1}px` }}>{data.fullName || "Your Name"}</div>
            <div className="text-slate-400 mt-1" style={{ fontSize: `${fs * 0.78}px` }}>{data.email}</div>
            <div className="text-slate-400" style={{ fontSize: `${fs * 0.78}px` }}>{data.phone}</div>
          </div>
          {/* Skill bars */}
          {data.skills && (
            <div className="mb-5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3" style={{ ...capStyle, fontSize: `${fs * 0.82}px`, color: applyAccentHeadings ? accent : "#cbd5e1" }}>Skills</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {data.skills.split(",").map(s => s.trim()).filter(Boolean).slice(0, 8).map((s, i) => {
                  const pct = Math.max(60, 100 - i * 8);
                  return (
                    <div key={i}>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-slate-300" style={{ fontSize: `${fs * 0.78}px` }}>{s}</span>
                        <span className="text-slate-500" style={{ fontSize: `${fs * 0.72}px` }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ ...capStyle, fontSize: `${fs * 0.82}px`, color: applyAccentHeadings ? accent : "#cbd5e1" }}>Education</div>
              <div style={{ display: "flex", flexDirection: "column", gap: `${esgap + 6}px` }}>
                {data.education.map((edu, i) => (
                  <div key={i}>
                    <div className="font-bold text-white" style={{ fontSize: `${fs * 0.88}px` }}>{edu.degree}</div>
                    <div className="text-slate-400" style={{ fontSize: `${fs * 0.78}px` }}>{edu.institution}</div>
                    <div style={{ color: accent, fontSize: `${fs * 0.78}px` }}>{edu.year}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Main content */}
        <div className="flex-1" style={{ padding: `${mv} ${mh}` }}>
          {data.summary && (
            <div className="mb-5 pb-4" style={{ borderBottom: `1px solid #e2e8f0` }}>
              <p className="text-slate-600 leading-relaxed" style={{ fontSize: `${fs * 0.9}px` }}>{data.summary}</p>
            </div>
          )}
          {data.experience.length > 0 && (
            <div className="mb-5">
              <SectionHeading>Experience</SectionHeading>
              <div style={{ display: "flex", flexDirection: "column", gap: `${esgap + 6}px` }}>
                {data.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="font-bold text-slate-800" style={{ fontSize: `${fs * 0.95}px` }}>{exp.title}</div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-500" style={{ fontSize: `${fs * 0.82}px` }}>{exp.company}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: `${accent}18`, color: accent, fontSize: `${fs * 0.75}px` }}>{exp.duration}</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed" style={{ fontSize: `${fs * 0.83}px` }}>{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.projects.length > 0 && (
            <div>
              <SectionHeading>Projects</SectionHeading>
              <div style={{ display: "flex", flexDirection: "column", gap: `${esgap + 6}px` }}>
                {data.projects.map((proj, i) => (
                  <div key={i}>
                    <div className="font-bold text-slate-800" style={{ fontSize: `${fs * 0.95}px` }}>{proj.name}</div>
                    <div style={{ color: accent, fontSize: `${fs * 0.82}px` }} className="mb-1">{proj.technologies}</div>
                    <p className="text-slate-500 leading-relaxed" style={{ fontSize: `${fs * 0.83}px` }}>{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──── 6. MODERN (default — accent sidebar, dynamic width) ────
  return (
    <div id="resume-preview" className="bg-white text-black flex max-w-[210mm] min-h-[297mm] shadow-lg mx-auto" style={{ fontFamily: ff, fontSize: `${fs}px`, lineHeight: lh }}>
      {/* Left Sidebar */}
      <div className="text-white p-6 shrink-0" style={{ width: `${sw}%`, background: accent }}>
        {data.imageBase64 && (<div className="flex justify-center mb-5"><img src={data.imageBase64} alt="Profile" className="rounded-full border-4 border-white/20 object-cover" style={{ width: `${sw * 2.8}px`, height: `${sw * 2.8}px` }} /></div>)}
        <div className="mb-5">
          <h1 className="font-bold" style={{ fontSize: `${fs * nameMult}px`, color: "white" }}>{data.fullName || "Your Name"}</h1>
          <div className="mt-1 opacity-75" style={{ fontSize: `${fs * 0.82}px` }}>{data.email}<br />{data.phone}</div>
        </div>
        {data.skills && (<div className="mb-5"><SectionHeading light>Skills</SectionHeading><div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>{data.skills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => <span key={i} className="bg-white/10 text-white px-2 py-0.5 rounded" style={{ fontSize: `${fs * 0.78}px` }}>{bullet}{s}</span>)}</div></div>)}
        {data.education.length > 0 && (<div><SectionHeading light>Education</SectionHeading><div style={{ display: "flex", flexDirection: "column", gap: `${esgap}px` }}>{data.education.map((edu, i) => (<div key={i}><div className="text-white/60" style={{ fontSize: `${fs * 0.78}px` }}>{edu.year}</div><div className="font-bold" style={{ fontSize: `${fs * 0.9}px` }}>{edu.degree}</div><div className="text-white/80" style={{ fontSize: `${fs * 0.82}px` }}>{edu.institution}</div></div>))}</div></div>)}
      </div>
      {/* Right Content */}
      <div className="bg-white" style={{ width: `${mainWidth}%`, padding: `${mv} ${mh}` }}>
        {data.summary && <p className="text-gray-500 leading-relaxed mb-6" style={{ fontSize: `${fs * 0.88}px`, textAlign: headerAlign as any }}>{data.summary}</p>}
        {data.experience.length > 0 && (<div className="mb-6"><SectionHeading>Experience</SectionHeading><div style={{ display: "flex", flexDirection: "column", gap: `${esgap}px` }}>{data.experience.map((exp, i) => (<div key={i}><div className="font-bold text-gray-900" style={{ fontSize: `${fs * 0.95}px` }}>{exp.title}</div><div className="font-semibold text-gray-400 mb-1" style={{ fontSize: `${fs * 0.85}px` }}>{exp.company} | {exp.duration}</div><p className="text-gray-500 leading-relaxed" style={{ fontSize: `${fs * 0.83}px` }}>{exp.description}</p></div>))}</div></div>)}
        {data.projects.length > 0 && (<div className="mb-6"><SectionHeading>Projects</SectionHeading><div style={{ display: "flex", flexDirection: "column", gap: `${esgap}px` }}>{data.projects.map((proj, i) => (<div key={i}><div className="font-bold text-gray-900" style={{ fontSize: `${fs * 0.95}px` }}>{proj.name}</div><div className="font-semibold mb-1" style={{ color: accent, fontSize: `${fs * 0.82}px` }}>{proj.technologies}</div><p className="text-gray-500 leading-relaxed" style={{ fontSize: `${fs * 0.83}px` }}>{proj.description}</p></div>))}</div></div>)}
      </div>
    </div>
  );
};
