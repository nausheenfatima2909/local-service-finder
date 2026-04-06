import { Booking, Provider, ServiceCategory, User } from '../types';
import servicesFromCsv from '../services.json';

const mulberry32 = (a: number) => {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const formatDate = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const pick = <T,>(rng: () => number, arr: T[]) => arr[Math.floor(rng() * arr.length)];

const TIME_SLOTS = ['09:00 - 11:00', '11:00 - 13:00', '13:00 - 15:00', '15:00 - 17:00', '17:00 - 19:00'] as const;

const getProblemTemplate = (category: ServiceCategory) => {
  switch (category) {
    case 'Electrician':
      return 'Flickering lights and intermittent switch issues. Need safe diagnostics and repairs.';
    case 'Plumber':
      return 'Leak in the kitchen/bathroom line. Require tightening, seal replacement, and pressure check.';
    case 'Carpenter':
      return 'Loose cabinet hinge and minor wobble in furniture. Need alignment and durable fix.';
    case 'Painter':
      return 'Wall cracks and uneven patches. Looking for clean prep, primer, and smooth finish.';
    case 'Cleaner':
      return 'Deep cleaning for the apartment (kitchen + washrooms) with sanitizing and stain removal.';
    case 'AC Repair':
      return 'AC not cooling properly. Check gas level, compressor performance, and airflow issues.';
    case 'Appliance Repair':
      return 'Appliance not starting / overheating. Diagnose the fault and suggest the right replacement.';
    case 'Mechanic':
      return 'Noise while driving and minor vibration. Need inspection of engine mounts/brakes.';
    case 'Tutor':
      return 'Need help with structured lessons and practice problems for upcoming exams.';
    case 'Beautician':
      return 'Skin cleanup and makeover for an event. Looking for a polished, long-lasting finish.';
    case 'Driver':
      return 'Need a reliable driver for a local trip with punctual pickup and safe driving.';
    case 'Photographer':
      return 'Portrait/event photography with natural lighting and quick editing turnaround.';
    case 'Gardener':
      return 'Lawn trimming and plant pruning with basic soil conditioning and tidy landscaping.';
    default:
      return 'General service request. Please inspect and provide an estimate.';
  }
};

const providerUsers: User[] = [
  { id: 'u-prov-1', name: 'Rahul Sharma', role: 'Provider', email: 'rahul.sharma@localserve.com' },
  { id: 'u-prov-2', name: 'Amit Patel', role: 'Provider', email: 'amit.patel@localserve.com' },
  { id: 'u-prov-3', name: 'Suresh Kumar', role: 'Provider', email: 'suresh.kumar@localserve.com' },
  { id: 'u-prov-4', name: 'Vikram Singh', role: 'Provider', email: 'vikram.singh@localserve.com' },
  { id: 'u-prov-5', name: 'Rohit Gupta', role: 'Provider', email: 'rohit.gupta@localserve.com' },
  { id: 'u-prov-6', name: 'Naveen Mehta', role: 'Provider', email: 'naveen.mehta@localserve.com' },
];

export const MOCK_USERS: User[] = [
  { id: 'u-1', name: 'Mark Wilson', role: 'Customer', email: 'mark@example.com' },
  { id: 'u-2', name: 'Jane Brown', role: 'Customer', email: 'jane@example.com' },
  { id: 'u-3', name: 'Priya Nair', role: 'Customer', email: 'priya@example.com' },
  ...providerUsers,
  { id: 'admin1', name: 'App Admin', role: 'Admin', email: 'admin@localserve.com' },
];

/** Merged + localized dataset from CSV sources (see services.json). */
export const MOCK_PROVIDERS: Provider[] = (servicesFromCsv as Provider[]).slice().sort((a, b) => a.distanceKm - b.distanceKm);

export const MOCK_BOOKINGS: Booking[] = (() => {
  const rng = mulberry32(99);
  const customers = MOCK_USERS.filter(u => u.role === 'Customer');

  const today = new Date();
  const timeSlots = [...TIME_SLOTS];

  const makeAddress = (area: string) => {
    const house = Math.floor(rng() * 900) + 1;
    const street = pick(rng, ['Lake View Rd', 'MG Road', 'Sunset Avenue', 'Park Street', 'City Center', 'Sunrise Lane']);
    return `${house}, ${street}, ${area}`;
  };

  const statuses: Booking['status'][] = ['Pending', 'Accepted', 'Completed', 'Rejected'];
  const statusWeights: Record<Booking['status'], number> = {
    Pending: 5,
    Accepted: 4,
    Completed: 3,
    Rejected: 1,
  };
  const statusPool: Booking['status'][] = [];
  for (const s of statuses) {
    for (let i = 0; i < statusWeights[s]; i++) statusPool.push(s);
  }

  const bookings: Booking[] = [];
  const count = 24;

  for (let i = 0; i < count; i++) {
    const provider = pick(rng, MOCK_PROVIDERS);
    const customer = pick(rng, customers);
    const dateOffsetDays = Math.floor(rng() * 9);
    const date = formatDate(new Date(today.getTime() - dateOffsetDays * 86400000));
    const timeSlot = pick(rng, timeSlots);
    const status = pick(rng, statusPool);

    bookings.push({
      id: `b-${i + 1}`,
      providerId: provider.id,
      providerOwnerId: provider.ownerUserId,
      providerName: provider.name,
      category: provider.category,
      customerId: customer.id,
      customerName: customer.name,
      date,
      timeSlot,
      address: makeAddress(provider.location),
      problemDescription: getProblemTemplate(provider.category),
      status,
      createdAt: new Date(today.getTime() - (dateOffsetDays * 86400000 + 3600 * 1000 * (i + 1))).toISOString(),
    });
  }

  return bookings;
})();
