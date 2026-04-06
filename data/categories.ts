import { ServiceCategory } from '../types';

export type CategoryMeta = {
  name: ServiceCategory;
  icon: string;
  description: string;
  unsplashKeyword: string;
};

export const SERVICE_CATEGORIES: CategoryMeta[] = [
  { name: 'Electrician', icon: '⚡', description: 'Wiring, circuit repairs, and light fittings.', unsplashKeyword: 'electrician,professional' },
  { name: 'Plumber', icon: '🔧', description: 'Leak fixes, pipe blockages, taps, and fittings.', unsplashKeyword: 'plumber,pipe,professional' },
  { name: 'Carpenter', icon: '🪚', description: 'Furniture repair, woodwork, and installations.', unsplashKeyword: 'carpenter,woodwork,professional' },
  { name: 'Painter', icon: '🎨', description: 'Wall painting, textures, and touch-ups.', unsplashKeyword: 'painter,painting,professional' },
  { name: 'Cleaner', icon: '🧹', description: 'Deep cleaning and home/office sanitation.', unsplashKeyword: 'cleaning,janitor,professional' },
  { name: 'AC Repair', icon: '❄️', description: 'AC servicing, gas refill, and cooling issues.', unsplashKeyword: 'ac technician,air conditioner,professional' },
  { name: 'Appliance Repair', icon: '🧰', description: 'Microwave, fridge, washing machine repairs.', unsplashKeyword: 'appliance repair,technician,professional' },
  { name: 'Mechanic', icon: '🛠️', description: 'Bike/car servicing and common mechanical issues.', unsplashKeyword: 'mechanic,automotive,professional' },
  { name: 'Tutor', icon: '📚', description: 'Math, science, languages, exam coaching.', unsplashKeyword: 'teacher,tutor,professional' },
  { name: 'Beautician', icon: '💄', description: 'Facials, makeup, hair styling, salon services.', unsplashKeyword: 'beautician,salon,professional' },
  { name: 'Driver', icon: '🚗', description: 'Local drops, airport rides, and chauffeurs.', unsplashKeyword: 'driver,chauffeur,professional' },
  { name: 'Photographer', icon: '📷', description: 'Events, portraits, reels, and photo shoots.', unsplashKeyword: 'photographer,camera,professional' },
  { name: 'Gardener', icon: '🌿', description: 'Landscaping, gardening, pruning, and lawn care.', unsplashKeyword: 'gardener,landscaping,professional' },
];

export const CATEGORY_ICON: Record<ServiceCategory, string> = SERVICE_CATEGORIES.reduce((acc, c) => {
  acc[c.name] = c.icon;
  return acc;
}, {} as Record<ServiceCategory, string>);

export const CATEGORY_KEYWORD: Record<ServiceCategory, string> = SERVICE_CATEGORIES.reduce((acc, c) => {
  acc[c.name] = c.unsplashKeyword;
  return acc;
}, {} as Record<ServiceCategory, string>);

