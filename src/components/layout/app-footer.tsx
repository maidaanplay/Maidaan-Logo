import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppFooterProps {
  children: ReactNode;
  className?: string;
}

export default function AppFooter({ children, className }: AppFooterProps) {
  return (
    <div className={cn("bg-white dark:bg-gray-900 border-t p-4", className)}>
      <div className="container mx-auto">
        {children}
      </div>
    </div>
  );
}
