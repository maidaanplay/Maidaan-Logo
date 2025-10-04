"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProfileStore } from "@/lib/stores/profile";
import { useVenueStore } from "@/lib/stores/venue";
import { Save } from "lucide-react";

export default function EditVenuePage() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const { selectedVenue, loadAdminVenue } = useVenueStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    contact: "",
    opening_time: "",
    closing_time: "",
    cancellation_cutoff_hours: "",
    amenities: "",
  });

  useEffect(() => {
    if (profile && profile.profile_type === "admin") {
      loadAdminVenue(profile.id).finally(() => setIsLoading(false));
    }
  }, [profile, loadAdminVenue]);

  useEffect(() => {
    if (selectedVenue) {
      setFormData({
        name: selectedVenue.name || "",
        description: selectedVenue.description || "",
        location: selectedVenue.location || "",
        contact: selectedVenue.contact || "",
        opening_time: selectedVenue.operating_hours?.opening_time || "",
        closing_time: selectedVenue.operating_hours?.closing_time || "",
        cancellation_cutoff_hours: selectedVenue.cancellation_cutoff_hours?.toString() || "",
        amenities: selectedVenue.amenities?.join(", ") || "",
      });
    }
  }, [selectedVenue]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading venue...</p>
      </div>
    );
  }

  if (!selectedVenue) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No venue found</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updates = {
        name: formData.name,
        description: formData.description || undefined,
        location: formData.location,
        contact: formData.contact || undefined,
        operating_hours: {
          opening_time: formData.opening_time,
          closing_time: formData.closing_time,
        },
        cancellation_cutoff_hours: formData.cancellation_cutoff_hours
          ? parseInt(formData.cancellation_cutoff_hours)
          : undefined,
        amenities: formData.amenities
          ? formData.amenities.split(",").map(a => a.trim()).filter(Boolean)
          : undefined,
      };

      // Update venue via API
      const response = await fetch(`/api/venue?venueId=${selectedVenue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update venue');
      }

      const result = await response.json();

      // Reload venue
      await loadAdminVenue(profile!.id);

      // Navigate back to venue profile
      router.push("/admin/venue-profile");
    } catch (error) {
      console.error('Error updating venue:', error);
      alert('Failed to update venue. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div className="mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Edit Venue</h2>
        <p className="text-muted-foreground">Update your venue information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Venue Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Venue Logo</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {selectedVenue.logo_url ? (
                  <Image
                    src={selectedVenue.logo_url}
                    alt={selectedVenue.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-400">
                    {formData.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  Change your venue logo
                </p>
                <Button type="button" variant="outline" size="sm" disabled>
                  Upload New Logo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Venue Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, State"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us about your venue..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Operating Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="opening_time">Opening Time *</Label>
                  <Input
                    id="opening_time"
                    type="time"
                    value={formData.opening_time}
                    onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="closing_time">Closing Time *</Label>
                  <Input
                    id="closing_time"
                    type="time"
                    value={formData.closing_time}
                    onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policies */}
          <Card>
            <CardHeader>
              <CardTitle>Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="cancellation_cutoff_hours">
                  Cancellation Cutoff Hours
                </Label>
                <Input
                  id="cancellation_cutoff_hours"
                  type="number"
                  value={formData.cancellation_cutoff_hours}
                  onChange={(e) => setFormData({ ...formData, cancellation_cutoff_hours: e.target.value })}
                  placeholder="e.g., 2"
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  Hours before match when cancellation is not allowed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="amenities">Amenities</Label>
                <Textarea
                  id="amenities"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Parking, Washrooms, Water, Seating, etc. (comma-separated)"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Enter amenities separated by commas
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="+91 1234567890"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pb-8">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/admin/venue-profile")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
