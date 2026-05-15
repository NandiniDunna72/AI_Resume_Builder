import { AnalysisResult } from "@/lib/analyzer";
import ScoreCircle from "./ScoreCircle";
import SkillBadge from "./SkillBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Lightbulb, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface AnalysisDashboardProps {
  result: AnalysisResult;
}

const AnalysisDashboard = ({ result }: AnalysisDashboardProps) => {
  const chartData = result.categoryScores.map(c => ({
    name: c.category,
    matched: c.score,
    total: c.max,
    percentage: c.max > 0 ? Math.round((c.score / c.max) * 100) : 0,
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Score Section */}
      <Card className="shadow-card-hover text-center overflow-hidden">
        <div className="gradient-hero p-8">
          <ScoreCircle score={result.matchScore} />
          <p className="mt-4 text-muted-foreground">
            {result.matchScore >= 75
              ? "Excellent match! Your resume aligns well with this role."
              : result.matchScore >= 50
              ? "Good match. Some improvements could help you stand out."
              : "Consider tailoring your resume more to this job."}
          </p>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{result.jobKeywords.length}</p>
              <p className="text-xs text-muted-foreground">Keywords Found</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{result.foundSkills.length}</p>
              <p className="text-xs text-muted-foreground">Skills Matched</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{result.missingSkills.length}</p>
              <p className="text-xs text-muted-foreground">Skills Missing</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Chart */}
      {chartData.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="name" width={140} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Match"]}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                />
                <Bar dataKey="percentage" radius={[0, 6, 6, 0]} maxBarSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.percentage >= 75 ? "hsl(142, 71%, 45%)" : entry.percentage >= 50 ? "hsl(38, 92%, 50%)" : "hsl(0, 84%, 60%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Found Skills */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Matched Skills ({result.foundSkills.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {result.foundSkills.map(s => <SkillBadge key={s} skill={s} variant="found" />)}
            {result.foundSkills.length === 0 && <p className="text-sm text-muted-foreground">No matching skills found</p>}
          </div>
        </CardContent>
      </Card>

      {/* Missing Skills */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Missing Skills ({result.missingSkills.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {result.missingSkills.map(s => <SkillBadge key={s} skill={s} variant="missing" />)}
            {result.missingSkills.length === 0 && <p className="text-sm text-muted-foreground">No missing skills — great job!</p>}
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card className="shadow-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-primary text-xs text-primary-foreground font-medium">
                  {i + 1}
                </span>
                <span className="text-foreground">{s}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisDashboard;
