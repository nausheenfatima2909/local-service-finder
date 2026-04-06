import React from 'react';

export const SkeletonServiceCard: React.FC = () => {
  return (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
      <div className="p-6 pt-7 flex flex-col gap-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 animate-pulse" />
        </div>
        <div className="text-center">
          <div className="h-5 w-32 mx-auto bg-slate-100 rounded animate-pulse" />
          <div className="mt-2 h-5 w-28 mx-auto bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="h-6 w-40 mx-auto bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="px-6 pb-6">
        <div className="h-10 w-full bg-slate-100 rounded animate-pulse" />
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="h-6 w-28 bg-slate-100 rounded-full animate-pulse" />
          <div className="h-6 w-36 bg-slate-100 rounded-full animate-pulse" />
          <div className="h-6 w-28 bg-slate-100 rounded-full animate-pulse" />
        </div>
        <div className="flex justify-between items-end mt-6 pt-5 border-t border-slate-50">
          <div className="w-32">
            <div className="h-3 w-24 bg-slate-100 rounded animate-pulse mb-2" />
            <div className="h-8 w-28 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
};

