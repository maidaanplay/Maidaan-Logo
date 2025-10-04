import { Venue, PricingRule } from './data';

// Format time to 12-hour format
export function formatTo12Hour(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}${minutes === 0 ? '' : `:${minutes.toString().padStart(2, '0')}`}${period}`;
}

// Format time range for display
export function formatTimeRange(times: string[]): string {
  if (times.length === 0) return "";
  if (times.length === 1) {
    const [start, end] = times[0].split('-');
    const startHours = parseInt(start.split(':')[0]);
    const endHours = parseInt(end.split(':')[0]);
    const endPeriod = endHours >= 12 ? 'PM' : 'AM';
    const startHours12 = startHours % 12 || 12;
    const endHours12 = endHours % 12 || 12;
    return `${startHours12} - ${endHours12} ${endPeriod}`;
  }

  // Multiple consecutive slots
  const firstStart = times[0].split('-')[0];
  const lastEnd = times[times.length - 1].split('-')[1];
  const startHours = parseInt(firstStart.split(':')[0]);
  const endHours = parseInt(lastEnd.split(':')[0]);
  const endPeriod = endHours >= 12 ? 'PM' : 'AM';
  const startHours12 = startHours % 12 || 12;
  const endHours12 = endHours % 12 || 12;
  return `${startHours12} - ${endHours12} ${endPeriod}`;
}

// Parse time slot string
export function parseTimeSlot(timeSlot: string): { start: string; end: string } {
  const [start, end] = timeSlot.split('-');
  return { start: start.trim(), end: end.trim() };
}

// Generate time slots based on venue operating hours
export function generateTimeSlots(venue: Venue): string[] {
  const { opening_time, closing_time } = venue.operating_hours;
  const slots: string[] = [];

  let currentHour = parseInt(opening_time.split(':')[0]);
  const closingHour = parseInt(closing_time.split(':')[0]);

  while (currentHour < closingHour) {
    const start = `${currentHour.toString().padStart(2, '0')}:00`;
    const end = `${(currentHour + 1).toString().padStart(2, '0')}:00`;
    slots.push(`${start}-${end}`);
    currentHour++;
  }

  return slots;
}

// Categorize time slots into Morning/Afternoon/Evening
export function categorizeTimeSlots(slots: string[]): {
  Morning: string[];
  Afternoon: string[];
  Evening: string[];
} {
  return {
    Morning: slots.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      return hour >= 6 && hour < 12;
    }),
    Afternoon: slots.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      return hour >= 12 && hour < 17;
    }),
    Evening: slots.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      return hour >= 17 && hour < 24;
    }),
  };
}

// Get time period for pricing
export function getTimePeriod(timeSlot: string): 'morning' | 'afternoon' | 'evening' {
  const hour = parseInt(timeSlot.split(':')[0]);

  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
}

// Check if date is weekend
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

// Calculate price for time slots
export function calculatePrice(
  venue: Venue,
  slots: string[],
  date: Date
): number {
  const dayType = isWeekend(date) ? 'weekend' : 'weekday';

  return slots.reduce((total, slot) => {
    const period = getTimePeriod(slot);

    // Find matching pricing rule
    const rule = venue.pricing_rules?.find(
      r => r.time_period === period && r.day_type === dayType
    );

    return total + (rule?.price_per_hour || 0);
  }, 0);
}

// Check if time is in the past (with 15min grace period)
export function isPastTime(date: Date, timeSlot: string): boolean {
  const { start } = parseTimeSlot(timeSlot);
  const [hours, minutes] = start.split(':').map(Number);

  const slotDateTime = new Date(date);
  slotDateTime.setHours(hours, minutes, 0, 0);

  // Add 15 minute grace period
  const now = new Date();
  const gracePeriod = 15 * 60 * 1000; // 15 minutes in milliseconds

  return slotDateTime.getTime() + gracePeriod < now.getTime();
}

// Format date for display
export function formatDate(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];

  return `${day} ${month} ${dayName}`;
}
