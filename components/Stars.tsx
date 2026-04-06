import React from 'react';

const Star: React.FC<{ fillPercent: number; className?: string }> = ({ fillPercent, className }) => {
  const pct = clamp(fillPercent, 0, 100);
  return (
    <span className={`relative inline-block w-[1.05rem] ${className || ''}`}>
      <span className="text-slate-200">★</span>
      <span className="absolute left-0 top-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <span className="text-amber-400">★</span>
      </span>
    </span>
  );
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const Stars: React.FC<{ rating: number; className?: string }> = ({ rating, className }) => {
  const safe = Number.isFinite(rating) ? rating : 0;
  const full = Math.floor(safe);
  const frac = safe - full;

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, idx) => {
          const starIndex = idx + 1;
          const fillPercent =
            starIndex <= full ? 100 : starIndex === full + 1 ? (frac >= 0.1 ? Math.round(frac * 100) : 0) : 0;
          return <Star key={idx} fillPercent={fillPercent} />;
        })}
      </div>
      <span className="text-xs font-bold text-slate-500">{safe.toFixed(1)}</span>
    </div>
  );
};

