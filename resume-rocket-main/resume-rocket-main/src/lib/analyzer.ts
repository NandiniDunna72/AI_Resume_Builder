// Synonym mapping for common tech terms
const SYNONYMS: Record<string, string[]> = {
  "machine learning": ["ml", "machine-learning"],
  "artificial intelligence": ["ai", "artificial-intelligence"],
  "natural language processing": ["nlp"],
  "deep learning": ["dl", "deep-learning"],
  "javascript": ["js"],
  "typescript": ["ts"],
  "python": ["py"],
  "react.js": ["react", "reactjs"],
  "node.js": ["node", "nodejs"],
  "next.js": ["next", "nextjs"],
  "vue.js": ["vue", "vuejs"],
  "angular.js": ["angular", "angularjs"],
  "database": ["db"],
  "postgresql": ["postgres", "psql"],
  "mongodb": ["mongo"],
  "amazon web services": ["aws"],
  "google cloud platform": ["gcp"],
  "microsoft azure": ["azure"],
  "continuous integration": ["ci"],
  "continuous deployment": ["cd"],
  "ci/cd": ["ci cd", "cicd"],
  "restful api": ["rest api", "rest", "restful"],
  "graphql": ["gql"],
  "docker": ["containerization"],
  "kubernetes": ["k8s"],
  "test driven development": ["tdd"],
  "object oriented programming": ["oop"],
  "user experience": ["ux"],
  "user interface": ["ui"],
  "data science": ["data-science"],
  "data engineering": ["data-engineering"],
  "project management": ["pm"],
  "agile": ["scrum", "kanban"],
  "version control": ["git", "github", "gitlab", "bitbucket"],
  "sql": ["structured query language"],
  "html": ["html5"],
  "css": ["css3", "cascading style sheets"],
  "sass": ["scss"],
  "tailwind css": ["tailwind", "tailwindcss"],
  "material ui": ["mui"],
};

// Common tech skills to extract
const SKILL_PATTERNS = [
  "javascript", "typescript", "python", "java", "c\\+\\+", "c#", "ruby", "go", "rust", "swift", "kotlin", "php", "scala",
  "react", "angular", "vue", "next\\.js", "node\\.js", "express", "django", "flask", "spring", "laravel",
  "html", "css", "sass", "tailwind", "bootstrap", "material ui",
  "sql", "nosql", "mongodb", "postgresql", "mysql", "redis", "elasticsearch",
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins", "ci/cd",
  "git", "github", "gitlab", "bitbucket",
  "machine learning", "deep learning", "nlp", "computer vision", "data science",
  "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
  "agile", "scrum", "kanban", "jira", "confluence",
  "rest api", "graphql", "microservices", "serverless",
  "testing", "unit testing", "integration testing", "selenium", "cypress", "jest",
  "figma", "sketch", "adobe xd", "photoshop", "illustrator",
  "communication", "leadership", "teamwork", "problem solving", "critical thinking",
  "project management", "time management", "analytical skills",
];

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s/+#.-]/g, " ").replace(/\s+/g, " ").trim();
}

function extractKeywords(text: string): string[] {
  const normalized = normalizeText(text);
  const found: Set<string> = new Set();

  for (const pattern of SKILL_PATTERNS) {
    const regex = new RegExp(`\\b${pattern}\\b`, "gi");
    if (regex.test(normalized)) {
      found.add(pattern.replace(/\\\./g, ".").replace(/\\\+/g, "+"));
    }
  }

  // Extract additional multi-word phrases (2-3 word combos)
  const words = normalized.split(" ");
  for (let i = 0; i < words.length; i++) {
    if (words[i].length > 2) {
      const twoWord = words.slice(i, i + 2).join(" ");
      const threeWord = words.slice(i, i + 3).join(" ");
      if (SKILL_PATTERNS.some(p => p === twoWord || p === threeWord)) {
        found.add(twoWord.length > threeWord.length ? twoWord : threeWord);
      }
    }
  }

  return Array.from(found);
}

function areSynonyms(word1: string, word2: string): boolean {
  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();
  if (w1 === w2) return true;

  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    const allForms = [key, ...synonyms];
    if (allForms.includes(w1) && allForms.includes(w2)) return true;
  }
  return false;
}

function findMatchingSkill(skill: string, resumeSkills: string[]): string | null {
  for (const rs of resumeSkills) {
    if (areSynonyms(skill, rs)) return rs;
  }
  return null;
}

export interface AnalysisResult {
  matchScore: number;
  foundSkills: string[];
  missingSkills: string[];
  jobKeywords: string[];
  resumeKeywords: string[];
  suggestions: string[];
  suggestedTemplateId?: string;
  categoryScores: { category: string; score: number; max: number }[];
}

export function analyzeResume(resumeText: string, jobDescription: string): AnalysisResult {
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);

  const foundSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const jk of jobKeywords) {
    const match = findMatchingSkill(jk, resumeKeywords);
    if (match) {
      foundSkills.push(jk);
    } else {
      missingSkills.push(jk);
    }
  }

  const matchScore = jobKeywords.length > 0
    ? Math.round((foundSkills.length / jobKeywords.length) * 100)
    : 0;

  // Generate suggestions
  const suggestions: string[] = [];
  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 3);
    suggestions.push(`Add these key skills to your resume: ${topMissing.join(", ")}`);
  }
  if (missingSkills.some(s => ["machine learning", "deep learning", "data science", "nlp"].includes(s))) {
    suggestions.push("Add relevant AI/ML projects to strengthen your profile");
  }
  if (missingSkills.some(s => ["aws", "azure", "gcp", "docker", "kubernetes"].includes(s))) {
    suggestions.push("Include cloud/DevOps certifications or project experience");
  }
  if (missingSkills.some(s => ["agile", "scrum", "kanban"].includes(s))) {
    suggestions.push("Mention Agile/Scrum methodology experience in your work history");
  }
  if (matchScore < 50) {
    suggestions.push("Consider tailoring your resume more specifically to this job description");
  }
  if (matchScore >= 50 && matchScore < 75) {
    suggestions.push("Good match! Focus on adding the missing keywords to push above 75%");
  }
  if (matchScore >= 75) {
    suggestions.push("Great match! Fine-tune your resume with quantifiable achievements");
  }
  if (suggestions.length === 0) {
    suggestions.push("Your resume looks well-matched. Consider adding more quantifiable results.");
  }

  // Template suggestions based on job description keywords
  let suggestedTemplateId = "modern";
  if (jobKeywords.some(s => ["figma", "sketch", "adobe", "css", "tailwind", "design", "ux", "ui"].includes(s.toLowerCase()))) {
    suggestions.push("We recommend using the Creative template since this is a Design/Creative role requiring visual flair.");
    suggestedTemplateId = "creative";
  } else if (jobKeywords.some(s => ["java", "c++", "go", "rust", "aws", "docker", "kubernetes", "sql", "python"].includes(s.toLowerCase()))) {
    suggestions.push("For strict technical/engineering roles, we recommend clicking 'Load' on the Minimalist template styles.");
    suggestedTemplateId = "simple";
  } else if (jobKeywords.some(s => ["manager", "management", "leadership", "agile"].includes(s.toLowerCase()))) {
    suggestions.push("For leadership roles, use a professional executive template highlighting high-level impact and ROI.");
    suggestedTemplateId = "modern";
  }

  // Category breakdown
  const categories = [
    { category: "Programming Languages", keywords: ["javascript", "typescript", "python", "java", "c\\+\\+", "c#", "ruby", "go", "rust", "swift", "kotlin", "php"] },
    { category: "Frameworks & Libraries", keywords: ["react", "angular", "vue", "next\\.js", "node\\.js", "express", "django", "flask", "spring"] },
    { category: "Cloud & DevOps", keywords: ["aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd", "jenkins"] },
    { category: "Databases", keywords: ["sql", "nosql", "mongodb", "postgresql", "mysql", "redis", "elasticsearch"] },
    { category: "Soft Skills", keywords: ["communication", "leadership", "teamwork", "problem solving", "project management"] },
  ];

  const categoryScores = categories.map(cat => {
    const relevant = jobKeywords.filter(jk => cat.keywords.some(ck => areSynonyms(jk, ck.replace(/\\\./g, ".").replace(/\\\+/g, "+"))));
    const matched = relevant.filter(r => foundSkills.includes(r));
    return { category: cat.category, score: matched.length, max: relevant.length };
  }).filter(c => c.max > 0);

  return { matchScore, foundSkills, missingSkills, jobKeywords, resumeKeywords, suggestions, suggestedTemplateId, categoryScores };
}

export function buildResumeText(data: {
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  skills: string;
  experience: { title: string; company: string; duration: string; description: string }[];
  education: { degree: string; institution: string; year: string }[];
  projects: { name: string; description: string; technologies: string }[];
}): string {
  let text = `${data.fullName}\n${data.email} | ${data.phone}\n\n`;
  if (data.summary) text += `SUMMARY\n${data.summary}\n\n`;
  if (data.skills) text += `SKILLS\n${data.skills}\n\n`;
  if (data.experience.length > 0) {
    text += "EXPERIENCE\n";
    data.experience.forEach(e => {
      text += `${e.title} at ${e.company} (${e.duration})\n${e.description}\n\n`;
    });
  }
  if (data.education.length > 0) {
    text += "EDUCATION\n";
    data.education.forEach(e => {
      text += `${e.degree} - ${e.institution} (${e.year})\n`;
    });
    text += "\n";
  }
  if (data.projects.length > 0) {
    text += "PROJECTS\n";
    data.projects.forEach(p => {
      text += `${p.name}: ${p.description}\nTechnologies: ${p.technologies}\n\n`;
    });
  }
  return text;
}
