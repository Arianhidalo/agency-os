export function ProgressRing({ value }: { value: number }) {
  const size = 126;
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - value / 100);

  return (
    <div className="relative h-36 w-36">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className="text-slate-800" stroke="currentColor" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="accent-text transition-all duration-500"
          stroke="currentColor"
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <p className="text-2xl font-semibold">{Math.round(value)}%</p>
        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Execution</p>
      </div>
    </div>
  );
}
