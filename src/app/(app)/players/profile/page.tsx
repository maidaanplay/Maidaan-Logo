"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Calendar,
  Flame,
  Edit,
  Users
} from "lucide-react";
import { useProfileStore } from "@/lib/stores/profile";

export default function PlayerProfilePage() {
  const router = useRouter();
  const { profile, loadCurrentUser } = useProfileStore();

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  useEffect(() => {
    if (!profile) {
      router.push("/login?role=player");
    }
  }, [profile, router]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get last 7 days for activity tracker
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const last7Days = getLast7Days();

  // Mock activity data - in real app, this would come from match history
  const hasActivityOnDate = (date: Date) => {
    // For demo purposes, showing activity on Wed, Thu, Fri (matching screenshot)
    const dayOfWeek = date.getDay();
    return dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 5;
  };

  const skillLevelColors: Record<string, string> = {
    beginner: "bg-green-500",
    intermediate: "bg-blue-500",
    expert: "bg-purple-500",
    pro: "bg-amber-500",
  };

  return (
    <div className="space-y-6 pb-20">
        {/* Profile Card */}
        <Card className="overflow-hidden">
          <CardContent className="pt-6 pb-6">
            {/* Large Avatar */}
            <div className="flex justify-center mb-4">
              <Avatar className="h-32 w-32 border-4 border-blue-500">
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                <AvatarFallback className="text-4xl">{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
            </div>

            {/* Name and Bio */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-1">{profile.name}</h2>
              {profile.bio && (
                <p className="text-muted-foreground">{profile.bio}</p>
              )}
            </div>

            {/* Player Info Capsules */}
            <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
              {/* Skill Level Badge */}
              {profile.skill_level && (
                <Badge
                  className={`${skillLevelColors[profile.skill_level]} text-white px-4 py-1 text-sm font-semibold uppercase flex items-center gap-1`}
                >
                  <span className="text-yellow-300">⭐</span>
                  {profile.skill_level}
                </Badge>
              )}

              {/* Jersey Name */}
              {profile.jersey_name && (
                <Badge variant="secondary" className="px-4 py-1 text-sm font-semibold">
                  {profile.jersey_name}
                </Badge>
              )}

              {/* Jersey Number */}
              {profile.jersey_number && (
                <Badge variant="secondary" className="px-4 py-1 text-sm font-semibold">
                  #{profile.jersey_number}
                </Badge>
              )}

              {/* Position */}
              {profile.position && (
                <Badge variant="secondary" className="px-4 py-1 text-sm font-semibold uppercase">
                  {profile.position}
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/players/profile/edit")}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {/* Navigate to friends */}}
              >
                <Users className="h-4 w-4 mr-2" />
                Friends
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          {/* Matches */}
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <div className="flex justify-center mb-2">
                <Trophy className="h-8 w-8 text-gray-400" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {profile.matches?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Matches</div>
            </CardContent>
          </Card>

          {/* Points */}
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <div className="flex justify-center mb-2">
                <svg className="h-8 w-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              </div>
              <div className="text-3xl font-bold mb-1">
                {profile.points}
              </div>
              <div className="text-sm text-muted-foreground">Points</div>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <div className="flex justify-center mb-2">
                <svg className="h-8 w-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                </svg>
              </div>
              <div className="text-3xl font-bold mb-1">
                {profile.streak}
              </div>
              <div className="text-sm text-muted-foreground">Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Games History - Weekly Activity */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Games History</h3>
              <Button variant="link" className="text-blue-500">
                SEE ALL
              </Button>
            </div>

            {/* 7-day Timeline */}
            <div className="grid grid-cols-7 gap-2">
              {last7Days.map((date, index) => {
                const hasActivity = hasActivityOnDate(date);
                // Get sport icon for the day (in real app, this would come from match data)
                const sportIcon = hasActivity ? "🏀" : null; // Basketball for demo

                return (
                  <div key={index} className="text-center">
                    <div className="text-lg font-semibold mb-1">
                      {date.getDate()}
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="flex justify-center">
                      {hasActivity ? (
                        <div className="relative w-12 h-12">
                          {/* Donut ring */}
                          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                            <circle
                              cx="18"
                              cy="18"
                              r="15.5"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="15.5"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="3"
                              strokeDasharray="97.4"
                              strokeDashoffset="0"
                              strokeLinecap="round"
                            />
                          </svg>
                          {/* Sport icon in center */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl">{sportIcon}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      {/* Back to Dashboard Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push("/players")}
      >
        Back to Dashboard
      </Button>
    </div>
  );
}
