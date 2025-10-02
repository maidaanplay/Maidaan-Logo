import { ReactNode } from "react";

interface PageLayoutProps {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export default function PageLayout({ header, children, footer }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {header && (
        <div className="sticky top-0 z-50">
          {header}
        </div>
      )}
      <main className="flex-1">
        {children}
      </main>
      {footer && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          {footer}
        </div>
      )}
    </div>
  );
}
