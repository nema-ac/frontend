import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      "bg-matrix-terminal/50 backdrop-blur-sm border border-matrix-green/20 rounded-lg p-8",
      className
    )}>
      {children}
    </div>
  );
}
