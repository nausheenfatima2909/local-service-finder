/**
 * Merge plumber CSVs + sample texas electricians → services.json
 * Output shape matches frontend Provider[] (see types.ts).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'DATASETS FOR GLOBAL SERVICE FINDER');

const PLUMBER_FILES = [
  ['chicago_plumbers.csv', 'Mumbai'],
  ['dallas_plumbers.csv', 'Delhi'],
  ['houston_plumber.csv', 'Hyderabad'],
  ['losangeles_plumbers.csv', 'Bangalore'],
  ['miami_plumbers.csv', 'Chennai'],
  ['newyork_plumbers.csv', 'Kolkata'],
  ['sanfrancisco_plumbers.csv', 'Pune'],
];

const CITY_AREAS = {
  Mumbai: ['Andheri', 'Bandra', 'Powai', 'Dadar', 'Juhu', 'Ghatkopar', 'Mulund'],
  Delhi: ['Connaught Place', 'Dwarka', 'Rohini', 'Karol Bagh', 'Lajpat Nagar', 'Vasant Kunj'],
  Hyderabad: ['Banjara Hills', 'Gachibowli', 'Secunderabad', 'Kukatpally', 'Hitech City', 'Kondapur'],
  Bangalore: ['Koramangala', 'Indiranagar', 'Whitefield', 'Jayanagar', 'Marathahalli', 'HSR Layout'],
  Chennai: ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'OMR', 'Porur'],
  Kolkata: ['Salt Lake', 'Park Street', 'Howrah', 'New Town', 'Gariahat', 'Behala'],
  Pune: ['Koregaon Park', 'Hinjewadi', 'Wakad', 'Viman Nagar', 'Kothrud', 'Baner'],
  Coimbatore: ['RS Puram', 'Peelamedu', 'Saibaba Colony', 'Gandhipuram', 'Race Course', 'Singanallur'],
};

const FIRST_NAMES = [
  'Rahul', 'Amit', 'Suresh', 'Vikram', 'Rohit', 'Karan', 'Arjun', 'Naveen', 'Mohit', 'Atul',
  'Dev', 'Prakash', 'Sanjay', 'Manoj', 'Ajay', 'Ramesh', 'Shankar', 'Vijay', 'Karthik', 'Deepak',
  'Priya', 'Ananya', 'Kavitha', 'Lakshmi', 'Meera', 'Sneha', 'Divya', 'Pooja',
];
const LAST_NAMES = [
  'Kumar', 'Sharma', 'Yadav', 'Singh', 'Gupta', 'Patel', 'Verma', 'Reddy', 'Nair', 'Iyer',
  'Chaudhary', 'Mehta', 'Joshi', 'Kapoor', 'Bose', 'Roy', 'Thakur', 'Saha', 'Deshmukh', 'Kulkarni',
];
const COMPANY_SUFFIXES = [
  'Home Services', 'Traders', 'Engineering Works', 'Electricals', 'Plumbing & Repairs', 'Solutions', 'Care Services',
];

const AVAIL = ['Available today', 'Busy', 'Available tomorrow'];

function hashString(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return Math.abs(h >>> 0);
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseCSV(text) {
  const rows = [];
  let i = 0;
  let field = '';
  let row = [];
  let inQuotes = false;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i += 2;
        continue;
      }
      if (c === '"') {
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (c === '\r') {
      i++;
      continue;
    }
    if (c === '\n') {
      row.push(field);
      rows.push(row);
      field = '';
      row = [];
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim().replace(/^\ufeff/, ''));
  return rows.slice(1).map((r) => {
    const o = {};
    headers.forEach((h, idx) => {
      o[h] = r[idx] != null ? String(r[idx]).trim() : '';
    });
    return o;
  });
}

function firstPhoneDigits(phones) {
  const m = String(phones || '').match(/\d/g);
  if (!m || !m.length) return '0000000000';
  return m.join('').slice(0, 10);
}

function indianMobileFromSeed(seed) {
  const rng = mulberry32(seed);
  const first = [6, 7, 8, 9][Math.floor(rng() * 4)];
  let rest = '';
  for (let k = 0; k < 9; k++) rest += Math.floor(rng() * 10);
  return `${first}${rest}`;
}

function isCompanyName(name) {
  const u = name.toUpperCase();
  return /\b(INC|LLC|LLP|LTD|CORP|CO\.|COMPANY|ENTERPRISES|SERVICES|GROUP)\b/.test(u) || name.includes('&');
}

function indianDisplayName(original, seed) {
  const rng = mulberry32(seed);
  const clean = original.replace(/^["']|["']$/g, '').trim();
  if (isCompanyName(clean)) {
    const word = clean.split(/[\s,&]+/).filter(Boolean)[0] || 'Metro';
    const nice = word.length > 2 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : 'Metro';
    return `${nice} ${COMPANY_SUFFIXES[Math.floor(rng() * COMPANY_SUFFIXES.length)]}`;
  }
  const fn = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
  const ln = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
  const isPlumb = rng() > 0.35;
  return isPlumb ? `${fn} ${ln}` : `${fn} ${ln} Plumbing`;
}

function electricianDisplayName(rawName, seed) {
  const rng = mulberry32(seed);
  const n = rawName.replace(/^"|"$/g, '').trim();
  if (/^[A-Z][A-Z,\s.\-]+$/i.test(n) && n.includes(',')) {
    const fn = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    return rng() > 0.4 ? `${fn} ${ln} Electricals` : `${fn} ${ln}`;
  }
  if (isCompanyName(n)) {
    const parts = n.split(/\s+/).filter((p) => p.length > 2);
    const stem = parts[0] || 'City';
    const nice = stem[0] + stem.slice(1).toLowerCase();
    return `${nice} ${COMPANY_SUFFIXES[Math.floor(rng() * COMPANY_SUFFIXES.length)]}`;
  }
  const fn = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
  const ln = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
  return `${fn} ${ln} Electricals`;
}

function round1(x) {
  return Math.round(x * 10) / 10;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

const OWNER_IDS = ['u-prov-1', 'u-prov-2', 'u-prov-3', 'u-prov-4', 'u-prov-5', 'u-prov-6'];

function buildProvider({
  id,
  ownerIdx,
  name,
  category,
  metro,
  locationArea,
  phone10,
  rating,
  experienceYears,
  reviewsCount,
  pricePerVisit,
  distanceKm,
  availability,
  description,
  imageSig,
}) {
  const kw =
    category === 'Plumber'
      ? 'plumber,professional'
      : 'electrician,professional';
  return {
    id,
    ownerUserId: OWNER_IDS[ownerIdx % OWNER_IDS.length],
    name,
    category,
    experienceYears,
    rating: round1(rating),
    reviewsCount,
    pricePerVisit,
    location: `${locationArea}, ${metro}`,
    distanceKm: round1(distanceKm),
    availability,
    phoneNumber: `+91 ${phone10}`,
    description,
    image: `https://source.unsplash.com/400x400/?${kw}&sig=${imageSig}`,
  };
}

function plumberDescription(name, years) {
  return `Trusted plumbing professional serving ${name.split(' ')[0]}'s customers for ${years}+ years. Leak repairs, fittings, and install work with transparent pricing.`;
}

function electricianDescription(name, years) {
  return `Licensed electrical work in your area—${years} years experience. Safe wiring, repairs, and installations with clear estimates.`;
}

// --- Load plumbers ---
const rawPlumbers = [];
const seen = new Set();

for (const [file, metro] of PLUMBER_FILES) {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) continue;
  const text = fs.readFileSync(fp, 'utf8');
  const rows = parseCSV(text);
  const objs = rowsToObjects(rows);
  for (const o of objs) {
    const url = (o.original_listing_url || '').trim();
    const name = (o.name || '').trim();
    if (!name) continue;
    const key = `${name.toLowerCase()}|${firstPhoneDigits(o.phones)}|${url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rawPlumbers.push({ o, metro });
  }
}

// --- Sample electricians (large file): skip header, stride read ---
const elecPath = path.join(DATA_DIR, 'texas-electricians.csv');
const electricianRows = [];
if (fs.existsSync(elecPath)) {
  const fd = fs.readFileSync(elecPath, 'utf8');
  const lines = fd.split(/\n/);
  const header = lines[0];
  if (header && header.toLowerCase().startsWith('id,')) {
    // Sample many rows evenly across the file → ~24 electricians
    const target = 24;
    const stride = Math.max(1, Math.floor((lines.length - 2) / (target * 4)));
    const citiesRot = ['Mumbai', 'Delhi', 'Hyderabad', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Coimbatore'];
    const seenE = new Set();
    let added = 0;
    for (let i = 1; i < lines.length && added < target; i += stride) {
      const line = lines[i];
      if (!line || !line.trim()) continue;
      const parts = parseCSV(line + '\n');
      if (!parts[0] || parts[0].length < 5) continue;
      const row = parts[0];
      const id = row[0];
      const nameField = (row[4] || '').replace(/^"|"$/g, '').trim();
      if (!nameField || nameField.length < 3) continue;
      const dedupeKey = nameField.toLowerCase();
      if (seenE.has(dedupeKey)) continue;
      seenE.add(dedupeKey);
      const metro = citiesRot[added % citiesRot.length];
      electricianRows.push({ id, name: nameField, metro });
      added++;
    }
  }
}

// Cap counts so merged set fits ~60 with both services well represented
const MAX_TOTAL = 60;
const TARGET_ELECTRICIANS = Math.min(24, electricianRows.length);
const TARGET_PLUMBERS = Math.min(36, rawPlumbers.length);

rawPlumbers.sort((a, b) => hashString(`${a.metro}|${a.o.name}`) - hashString(`${b.metro}|${b.o.name}`));
const cappedPlumbers = rawPlumbers.slice(0, TARGET_PLUMBERS);
const cappedElectricians = electricianRows.slice(0, TARGET_ELECTRICIANS);

// --- Build final providers ---
const providers = [];
let seq = 0;

for (const { o, metro } of cappedPlumbers) {
  const seed = hashString(`${o.name}|${o.phones}|${metro}`);
  const rng = mulberry32(seed);
  const name = indianDisplayName(o.name, seed);
  const areas = CITY_AREAS[metro];
  const area = areas[Math.floor(rng() * areas.length)];
  const phone10 = indianMobileFromSeed(seed ^ 0x9e3779b9);
  const rating = clamp(3.0 + rng() * 2.0, 3.0, 5.0);
  const experienceYears = Math.floor(rng() * 15) + 1;
  const reviewsCount = Math.floor(rng() * 450) + 15;
  const pricePerVisit = Math.floor(rng() * 1300) + 200;
  const distanceKm = 0.5 + rng() * 14.5;
  const availability = AVAIL[rng() < 0.45 ? 0 : rng() < 0.75 ? 2 : 1];
  seq += 1;
  providers.push(
    buildProvider({
      id: `prov-p-${seq}`,
      ownerIdx: seq - 1,
      name,
      category: 'Plumber',
      metro,
      locationArea: area,
      phone10,
      rating,
      experienceYears,
      reviewsCount,
      pricePerVisit,
      distanceKm,
      availability,
      description: plumberDescription(name, experienceYears),
      imageSig: seed % 10000,
    }),
  );
}

for (let i = 0; i < cappedElectricians.length; i++) {
  const e = cappedElectricians[i];
  const seed = hashString(`${e.id}|${e.name}|${e.metro}|elec`);
  const rng = mulberry32(seed);
  const name = electricianDisplayName(e.name, seed);
  const areas = CITY_AREAS[e.metro];
  const area = areas[Math.floor(rng() * areas.length)];
  const phone10 = indianMobileFromSeed(seed ^ 0xdeadbeef);
  const rating = clamp(3.0 + rng() * 2.0, 3.0, 5.0);
  const experienceYears = Math.floor(rng() * 15) + 1;
  const reviewsCount = Math.floor(rng() * 500) + 12;
  const pricePerVisit = Math.floor(rng() * 1300) + 250;
  const distanceKm = 0.5 + rng() * 14.5;
  const availability = AVAIL[rng() < 0.45 ? 0 : rng() < 0.75 ? 2 : 1];
  seq += 1;
  providers.push(
    buildProvider({
      id: `prov-e-${seq}`,
      ownerIdx: seq - 1,
      name,
      category: 'Electrician',
      metro: e.metro,
      locationArea: area,
      phone10,
      rating,
      experienceYears,
      reviewsCount,
      pricePerVisit,
      distanceKm,
      availability,
      description: electricianDescription(name, experienceYears),
      imageSig: seed % 10000,
    }),
  );
}

// Ensure minimum size 40; cap ~60 for UI
let finalList = providers.sort((a, b) => a.distanceKm - b.distanceKm);
if (finalList.length < 40) {
  const need = 40 - finalList.length;
  const metros = Object.keys(CITY_AREAS);
  for (let j = 0; j < need; j++) {
    const seed = hashString(`synth-${j}-${Date.now()}`);
    const rng = mulberry32(seed);
    const metro = metros[Math.floor(rng() * metros.length)];
    const category = rng() > 0.55 ? 'Plumber' : 'Electrician';
    const fn = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const name =
      category === 'Plumber' ? `${fn} ${ln}` : `${fn} ${ln} Electricals`;
    const areas = CITY_AREAS[metro];
    const area = areas[Math.floor(rng() * areas.length)];
    const phone10 = indianMobileFromSeed(seed);
    const rating = clamp(3.0 + rng() * 2.0, 3.0, 5.0);
    const experienceYears = Math.floor(rng() * 15) + 1;
    seq += 1;
    finalList.push(
      buildProvider({
        id: `prov-s-${seq}`,
        ownerIdx: seq - 1,
        name,
        category,
        metro,
        locationArea: area,
        phone10,
        rating,
        experienceYears,
        reviewsCount: Math.floor(rng() * 400) + 20,
        pricePerVisit: Math.floor(rng() * 1200) + 200,
        distanceKm: 0.5 + rng() * 14.5,
        availability: AVAIL[rng() < 0.45 ? 0 : rng() < 0.75 ? 2 : 1],
        description:
          category === 'Plumber'
            ? plumberDescription(name, experienceYears)
            : electricianDescription(name, experienceYears),
        imageSig: seed % 10000,
      }),
    );
  }
}

if (finalList.length > MAX_TOTAL) {
  finalList = finalList.slice(0, MAX_TOTAL);
}

finalList = finalList.sort((a, b) => a.distanceKm - b.distanceKm);

const outPath = path.join(ROOT, 'services.json');
fs.writeFileSync(outPath, JSON.stringify(finalList, null, 2), 'utf8');
console.log(`Wrote ${finalList.length} providers to ${outPath}`);
console.log(
  `Plumbers: ${finalList.filter((p) => p.category === 'Plumber').length}, Electricians: ${finalList.filter((p) => p.category === 'Electrician').length}`,
);
