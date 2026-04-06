import React from 'react';
import { Provider } from '../types';
import { CATEGORY_ICON } from '../data/categories';
import { Stars } from './Stars';

const availabilityTone = (availability: Provider['availability']) => {
  switch (availability) {
    case 'Available today':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'Available tomorrow':
      return 'bg-sky-50 text-sky-700 border-sky-100';
    case 'Busy':
      return 'bg-rose-50 text-rose-700 border-rose-100';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-100';
  }
};

// ── Local image pools (files must exist in public/images/) ──────────────────
const IMAGE_POOL: Record<string, string[]> = {
  Electrician: [
    '/images/elec1.jpg',
    '/images/elec2.jpg',
    '/images/elec3.jpg',
    '/images/elec4.jpg',
    '/images/elec5.jpg',
  ],
  Plumber: [
    '/images/plum1.jpg',
    '/images/plum2.jpg',
    '/images/plum3.jpg',
    '/images/plum4.jpg',
    '/images/plum5.jpg',
  ],
};

// Fallback used for any category that has no local image pool entry
const FALLBACK_IMAGE = '/images/plum1.jpg';

/**
 * Picks a deterministic image for a provider so the same provider always
 * gets the same photo (based on name length), but different providers
 * within the same category get different photos.
 */
function resolveImage(category: string, name: string): string {
  const pool = IMAGE_POOL[category];
  if (!pool || pool.length === 0) return FALLBACK_IMAGE;
  return pool[name.length % pool.length];
}

export const ServiceCard: React.FC<{
  provider: Provider;
  onBook: () => void;
}> = ({ provider, onBook }) => {
  const disabled = provider.availability === 'Busy';
  const icon = CATEGORY_ICON[provider.category] ?? '🛠️'; // safe fallback emoji

  // Resolve local image; fall back to FALLBACK_IMAGE if the file 404s
  const imageSrc = resolveImage(provider.category, provider.name);

  return (
    <div
      className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group"
      role="article"
    >
      <div className="p-6 pt-7 flex flex-col gap-4">
        <div className="flex justify-center">
          <img
            src={imageSrc}
            alt={provider.name}
            onError={(e) => {
              // If the local file is missing, silently swap to the fallback
              // Prevent infinite loop if fallback itself is missing
              const img = e.currentTarget as HTMLImageElement;
              if (img.src !== window.location.origin + FALLBACK_IMAGE) {
                img.src = FALLBACK_IMAGE;
              }
            }}
            className="w-20 h-20 rounded-full object-cover shadow-sm ring-1 ring-sky-100 bg-sky-50"
          />
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">{icon}</span>
            <span className="font-black text-slate-800">{provider.category}</span>
          </div>
          <h3 className="mt-1 text-lg font-black text-slate-900">{provider.name}</h3>
        </div>

        <div className="flex items-center justify-center">
          <Stars rating={provider.rating} />
        </div>
      </div>

      <div className="px-6 pb-6">
        <p
          className="text-sm text-slate-500 min-h-[2.8rem] overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {provider.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-3 py-1 rounded-full text-xs font-black border border-sky-100 bg-sky-50 text-sky-700">
            {provider.distanceKm.toFixed(1)} km away
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-black border ${availabilityTone(provider.availability)}`}>
            {provider.availability}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-black border border-slate-100 bg-slate-50 text-slate-700">
            {provider.experienceYears} yrs exp
          </span>
        </div>

        <div className="flex justify-between items-end mt-6 pt-5 border-t border-slate-50">
          <div className="leading-tight">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Price per visit
            </div>
            <div className="text-2xl font-black text-indigo-700">
              ₹{provider.pricePerVisit}
              <span className="text-xs font-bold text-slate-400">/visit</span>
            </div>
          </div>

          <button
            onClick={onBook}
            disabled={disabled}
            className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all
              ${disabled
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg shadow-indigo-100'
              }`}
          >
            {disabled ? 'Busy' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
};
