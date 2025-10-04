"use client";

import { useState } from "react";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { QRCodeSVG } from 'qrcode.react';

interface MatchShareSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
}

export function MatchShareSheet({ isOpen, onOpenChange, shareUrl }: MatchShareSheetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-w-md mx-auto rounded-t-3xl bg-white dark:bg-gray-900 pb-8">
        <SheetHeader>
          <SheetTitle>Share Match</SheetTitle>
          <SheetDescription>
            Share this match with your friends to invite them to join. Anyone with this link can view the match details and join if they have the Maidaan app.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 mt-6 mb-4">
          {/* QR Code */}
          <div className="flex justify-center p-6 bg-white rounded-lg">
            <QRCodeSVG value={shareUrl} size={200} level="H" />
          </div>

          {/* Match URL */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Match Link</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 border rounded-md text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                <ContentCopyIcon sx={{ fontSize: 20 }} />
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-green-600 dark:text-green-400">Link copied!</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
