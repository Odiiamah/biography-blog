interface AdSlotProps {
  type?: 'banner' | 'rectangle' | 'leaderboard';
  label?: string;
}

const dimensions = {
  banner: { w: '100%', h: '90px', label: '728×90 Leaderboard' },
  rectangle: { w: '100%', h: '250px', label: '336×280 Rectangle' },
  leaderboard: { w: '100%', h: '100px', label: '970×90 Billboard' },
};

export default function AdSlot({ type = 'banner', label }: AdSlotProps) {
  const dim = dimensions[type];
  const trackId = `ad-${type}-${label?.replace(/\s+/g, '-').toLowerCase() || dim.label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div
      data-track={trackId}
      data-track-type="ad"
      className="bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-xs text-center my-6 cursor-pointer"
      style={{ width: dim.w, height: dim.h }}
      aria-label="Advertisement"
    >
      <div>
        <span className="font-semibold">AD</span> — {label ?? dim.label}
        <div className="text-slate-300 text-[10px] mt-0.5">Google AdSense</div>
      </div>
    </div>
  );
}
