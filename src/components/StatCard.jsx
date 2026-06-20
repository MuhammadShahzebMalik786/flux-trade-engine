/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function StatCard({ title, value, subValue, change, icon, loading }) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-[#0f0f0f] rounded-lg border border-white/10 p-2 sm:p-2.5 shadow-xl relative overflow-hidden group hover:border-[#D4AF37]/30 transition-all duration-300">
      <div className="absolute top-0 left-0 w-16 h-16 bg-[#D4AF37]/2 rounded-full blur-3xl group-hover:bg-[#D4AF37]/5 transition-all duration-500"></div>

      <div className="flex justify-between items-start">
        <span className="text-white/40 text-[9px] sm:text-[10px] font-mono tracking-widest uppercase truncate pr-1">{title}</span>
        {icon && (
          <div className="text-gold-500/60 group-hover:text-gold-500 transition-colors duration-300">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-1.5 sm:mt-2 flex items-baseline gap-2">
        {loading ? (
          <div className="h-7 w-28 bg-white/5 animate-pulse rounded"></div>
        ) : (
          <span className="text-white text-base sm:text-base font-medium font-mono tracking-tight leading-none truncate">
            {value}
          </span>
        )}
      </div>

      <div className="mt-1 sm:mt-1.5 flex items-center justify-between">
        {subValue && (
          <span className="text-[8px] sm:text-[10px] font-mono text-white/20 truncate">
            {subValue}
          </span>
        )}

        {change !== undefined && (
          <span
            className={`text-[9px] sm:text-xs font-mono font-medium px-1 sm:px-2 py-0.5 rounded ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                : 'bg-red-500/10 text-red-400 border border-red-500/15'
            }`}
          >
            {isPositive ? '+' : ''}
            {change.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}
