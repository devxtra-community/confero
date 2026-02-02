'use client';

export default function CenterLoader({
  label = 'Loading...',
}: {
  label?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* circle loader */}
        <span
          className="
            w-8 h-8
            rounded-full
            border-2
            border-neutral-200
            border-t-favor
            animate-spin
          "
        />

        {/* loading text */}
        <span className="text-sm font-medium text-neutral-500 tracking-wide">
          {label}
        </span>
      </div>
    </div>
  );
}
