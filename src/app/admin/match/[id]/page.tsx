"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { MatchCourtDateTime } from "@/components/match/match-court-datetime";
import { MatchPayment } from "@/components/match/match-payment";
import AppFooter from "@/components/layout/app-footer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Match {
  id: string;
  venue_id: string;
  court_id: string;
  host_player_id: string;
  booker_name: string;
  booker_contact: string;
  date: string;
  time_slots: string[];
  sport_type: string;
  match_status: 'upcoming' | 'played';
  price: number;
  payment_status: 'pending' | 'paid';
  payment_method?: 'cash' | 'upi';
  is_recurring: boolean;
  recurring_config: any;
  is_cancelled: boolean;
}

interface Court {
  id: string;
  name: string;
  icon: string;
}

export default function AdminMatchDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [court, setCourt] = useState<Court | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);

  useEffect(() => {
    const loadMatchDetails = async () => {
      try {
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select("*")
          .eq("id", id)
          .single();

        if (matchError) throw matchError;
        setMatch(matchData);

        const { data: courtData, error: courtError } = await supabase
          .from("courts")
          .select("id, name, icon")
          .eq("id", matchData.court_id)
          .single();

        if (courtError) throw courtError;
        setCourt(courtData);

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading match details:", error);
        setIsLoading(false);
      }
    };

    if (id) {
      loadMatchDetails();
    }
  }, [id]);

  const handleMarkAsPaid = async (paymentMethod: 'cash' | 'upi') => {
    if (!match) return;

    try {
      const { error } = await supabase
        .from("matches")
        .update({ payment_status: 'paid', payment_method: paymentMethod })
        .eq("id", match.id);

      if (error) throw error;

      setMatch({ ...match, payment_status: 'paid', payment_method: paymentMethod });
      setShowPaymentSheet(false);
      alert("Payment marked as paid successfully!");
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Failed to update payment status");
    }
  };

  // Check if match is upcoming (future) or already played (past)
  const isUpcoming = () => {
    if (!match) return false;
    const matchDateTime = new Date(`${match.date}T${match.time_slots[0].split('-')[0]}:00`);
    return matchDateTime > new Date();
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const { error } = await supabase
        .from("matches")
        .update({ is_cancelled: true })
        .eq("id", match!.id);

      if (error) throw error;

      setMatch({ ...match!, is_cancelled: true });
      alert("Booking cancelled successfully");
    } catch (error) {
      console.error("Error cancelling:", error);
      alert("Failed to cancel booking");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-6">
          <div className="relative w-48 h-20 mx-auto">
            <Image
              src="/maidaan_black.png"
              alt="Maidaan Logo"
              fill
              className="object-contain dark:hidden"
              priority
            />
            <Image
              src="/maidaan_white.png"
              alt="Maidaan Logo"
              fill
              className="object-contain hidden dark:block"
              priority
            />
          </div>
          <div className="text-lg font-medium">Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (!match || !court) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">Booking not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const matchDate = new Date(match.date);

  return (
    <div className="pb-32 space-y-6">
      {/* Court, Sport, Date & Time */}
      <MatchCourtDateTime
        court={court}
        sportType={match.sport_type}
        date={matchDate}
        timeSlots={match.time_slots}
        isRecurring={match.is_recurring}
      />

      {/* Booker Info */}
      <Card>
        <CardHeader>
          <CardTitle>Booker Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
              <PersonIcon sx={{ fontSize: 24 }} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{match.booker_name}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
              <PhoneIcon sx={{ fontSize: 24 }} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="font-medium">{match.booker_contact}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      <MatchPayment price={match.price} paymentStatus={match.payment_status} paymentMethod={match.payment_method} />

      {/* Fixed Footer with Action Buttons */}
      <AppFooter>
        <div className="flex gap-3 w-full">
          {match.is_cancelled ? (
            <div className="w-full text-center py-2">
              <p className="text-destructive font-semibold">This booking has been cancelled</p>
            </div>
          ) : !isUpcoming() && match.payment_status === 'paid' ? (
            <div className="w-full text-center py-3">
              <p className="text-green-600 dark:text-green-400 font-semibold text-lg flex items-center justify-center gap-2">
                <CheckCircleIcon sx={{ fontSize: 24 }} />
                Paid and Cleared
              </p>
            </div>
          ) : (
            <>
              {match.payment_status === 'pending' && (
                <Button
                  onClick={() => setShowPaymentSheet(true)}
                  className="flex-1 h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white border-2 border-green-700 shadow-lg"
                >
                  <CheckCircleIcon sx={{ fontSize: 20 }} className="mr-2" />
                  Mark as Paid
                </Button>
              )}
              {isUpcoming() && (
                <Button
                  onClick={handleCancel}
                  variant="destructive"
                  className="flex-1 h-14 text-lg font-bold border-2 shadow-lg"
                >
                  Cancel Booking
                </Button>
              )}
            </>
          )}
        </div>
      </AppFooter>

      {/* Payment Method Selection Sheet */}
      <Sheet open={showPaymentSheet} onOpenChange={setShowPaymentSheet}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>Select Payment Method</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-3 pb-6">
            <Button
              onClick={() => handleMarkAsPaid('cash')}
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 border-2 border-blue-700"
            >
              Cash Payment
            </Button>
            <Button
              onClick={() => handleMarkAsPaid('upi')}
              className="w-full h-14 text-lg bg-purple-600 hover:bg-purple-700 border-2 border-purple-700"
            >
              UPI/QR Payment
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
