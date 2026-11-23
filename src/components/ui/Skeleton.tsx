// src/components/ui/Skeleton.tsx
import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded bg-charcoal-200/70 dark:bg-charcoal-800/70 ${className}`}
    />
  );
};

export const BookCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-charcoal-200/60 dark:border-charcoal-800/60 bg-white dark:bg-charcoal-900 p-3 space-y-3">
      <Skeleton className="w-full aspect-[3/4] rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
};
