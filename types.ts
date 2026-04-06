
export type ServiceCategory =
  | 'Electrician'
  | 'Plumber'
  | 'Carpenter'
  | 'Painter'
  | 'Cleaner'
  | 'AC Repair'
  | 'Appliance Repair'
  | 'Mechanic'
  | 'Tutor'
  | 'Beautician'
  | 'Driver'
  | 'Photographer'
  | 'Gardener';

export type AvailabilityStatus = 'Available today' | 'Busy' | 'Available tomorrow';

export interface Provider {
  /**
   * Provider listing id (used for bookings).
   * A single logged-in provider user can own multiple listings (new service).
   */
  id: string;
  ownerUserId: string;
  name: string;
  category: ServiceCategory;
  experienceYears: number;
  rating: number; // 3.5 - 5.0
  reviewsCount: number;
  pricePerVisit: number; // INR ₹200 - ₹1500
  location: string; // area name
  distanceKm: number; // 0.5km - 15km
  availability: AvailabilityStatus;
  phoneNumber: string;
  description: string;
  /**
   * Profile image URL for the service card.
   */
  image: string;
}

export interface Booking {
  id: string;
  providerId: string;
  providerOwnerId: string;
  providerName: string;
  category: ServiceCategory;
  customerId: string;
  customerName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 - 12:00"
  address: string;
  problemDescription: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed';
  createdAt: string; // ISO timestamp
}

export interface User {
  id: string;
  name: string;
  role: 'Customer' | 'Provider' | 'Admin';
  email: string;
}
