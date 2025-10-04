"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface PageLayoutProps {
  children: ReactNode;
  /** Show back button in header */
  showBack?: boolean;
  /** Custom back action (defaults to router.back()) */
  onBack?: () => void;
  /** Additional header content (shown after back button) */
  headerContent?: ReactNode;
  /** Show fixed footer at bottom */
  footer?: ReactNode;
  /** Max width of content area */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  /** Background color variant */
  variant?: "default" | "muted";
  /** Additional padding bottom for fixed footers */
  paddingBottom?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full",
};

/**
 * Standard Page Layout Component
 *
 * LAYOUT RULES (MUST FOLLOW):
 * 1. All pages MUST use this component for consistent layout
 * 2. Header: Optional back button + custom content, always sticky at top
 * 3. Content: Centered with max-width (default: md = 448px), responsive padding (p-4)
 * 4. Footer: Optional fixed footer at bottom with proper spacing
 * 5. Background: Consistent across light/dark modes
 * 6. Spacing: Standard padding (p-4) throughout
 *
 * USAGE EXAMPLES:
 * - Detail pages: <PageLayout showBack>{content}</PageLayout>
 * - Pages with footer: <PageLayout footer={<buttons/>} paddingBottom>{content}</PageLayout>
 * - Full-width: <PageLayout maxWidth="full">{content}</PageLayout>
 * - Muted bg: <PageLayout variant="muted">{content}</PageLayout>
 */
export default function PageLayout({
  children,
  showBack = false,
  onBack,
  headerContent,
  footer,
  maxWidth = "md",
  variant = "default",
  paddingBottom = false,
}: PageLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const bgClass = variant === "muted"
    ? "bg-gray-50 dark:bg-gray-950"
    : "bg-background";

  return (
    <div className={`min-h-screen ${bgClass} ${paddingBottom ? 'pb-32' : ''}`}>
      {/* Header */}
      {(showBack || headerContent) && (
        <div className={`p-4 ${bgClass} sticky top-0 z-10`}>
          <div className={`${maxWidthClasses[maxWidth]} mx-auto flex items-center gap-2`}>
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="-ml-2"
              >
                <ArrowBackIcon sx={{ fontSize: 24 }} />
              </Button>
            )}
            {headerContent}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`${maxWidthClasses[maxWidth]} mx-auto p-4 space-y-6`}>
        {children}
      </main>

      {/* Fixed Footer */}
      {footer && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t-2 border-primary/20 shadow-2xl">
          <div className={`${maxWidthClasses[maxWidth]} mx-auto p-4`}>
            {footer}
          </div>
        </div>
      )}
    </div>
  );
}
