/**
 * Lightweight skeleton loaders — shimmer-free animate-pulse placeholders
 * that match the site's dark, rounded design language.
 */

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-white/10 rounded-xl ${className}`} />;
}

export function DestinationCardSkeleton() {
  return (
    <div className="h-[480px] rounded-[36px] overflow-hidden border border-white/10 bg-[#121214] relative">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute inset-x-0 bottom-0 p-8 space-y-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="flex justify-between items-center pt-4">
          <Skeleton className="h-6 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DestinationGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <DestinationCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PlaceDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-[480px] sm:h-[540px] rounded-[40px]" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-72 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
