import { useEffect, useState } from "react";

interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

const ScoreCircle = ({ score, size = 180, strokeWidth = 12 }: ScoreCircleProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = () => {
    if (score >= 75) return "hsl(142, 71%, 45%)";
    if (score >= 50) return "hsl(38, 92%, 50%)";
    return "hsl(0, 84%, 60%)";
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-foreground animate-count-up">{animatedScore}%</span>
        <span className="text-sm text-muted-foreground">Match Score</span>
      </div>
    </div>
  );
};

export default ScoreCircle;
