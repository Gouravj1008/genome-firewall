import type { ReactNode } from 'react';

type SectionCardProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
  className?: string;
};

export function SectionCard({ title, subtitle, badge, children, className = '' }: SectionCardProps) {
  return (
    <section className={`glass-panel animate-fade-in rounded-[28px] p-5 shadow-glow transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/30 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
          {subtitle ? <p className="mt-1 max-w-2xl text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        {badge ? <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">{badge}</span> : null}
      </div>
      {children}
    </section>
  );
}
