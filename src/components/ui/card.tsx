import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      "backdrop-blur-sm border rounded-lg p-8",
      className
    )}>
      {children}
    </div>
  );
}
