import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppFooterProps {
  children: ReactNode;
  className?: string;
  fixed?: boolean;
}

export default function AppFooter({ children, className, fixed = true }: AppFooterProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 border-t-2 border-primary/20 shadow-2xl",
        fixed && "fixed bottom-0 left-0 right-0 z-50",
        className
      )}
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-md mx-auto px-4 pt-4">
        {children}
      </div>
    </div>
  );
}
