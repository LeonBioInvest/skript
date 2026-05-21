'use client';

import { Script, TrainingMode } from '@/lib/types';
import { cn } from '@/lib/types';

interface Props {
  script: Script;
  onSelect: (mode: TrainingMode) => void;
  onClose: () => void;
}

export default function ModeOverlay({ script, onSelect, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in"
      style={{ background: 'rgb(var(--text) / 0.18)', backdropFilter: 'blur(20px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl animate-scale-in overflow-hidden"
        style={{ boxShadow: '0 20px 60px rgb(0 0 0 / 0.15), 0 4px 16px rgb(0 0 0 / 0.08)' }}
      >
        {/* Header */}
        <div className="relative px-7 pt-7 pb-5 border-b border-border/60">
          <button
            onClick={onClose}
            className="absolute top-5 left-5 font-mono text-[10px] tracking-widest uppercase text-text3 hover:text-text2 transition-colors flex items-center gap-1.5"
          >
            ← Zurück
          </button>
          <div className="text-center pt-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-text3 mb-3">
              {script.icon} {script.name}
            </span>
            <h2 className="font-display text-[1.6rem] font-bold text-text leading-tight">
              Modus wählen
            </h2>
            <p className="text-text2 text-sm mt-1">Wie möchtest du heute üben?</p>
          </div>
        </div>

        {/* Mode list */}
        <div className="p-5 flex flex-col gap-2.5">
          <ModeRow
            mode={1}
            icon="✏️"
            name="Lückentext"
            badge="Aktiv"
            badgeClass="bg-accent/10 text-accent border border-accent/25"
            desc="~28% der Wörter werden zufällig durch Eingabefelder ersetzt. Ideal zum Einsteigen."
            accentColor="accent"
            hoverClass="hover:border-accent/40 hover:bg-accent/[0.03]"
            disabled={false}
            onSelect={onSelect}
          />
          <ModeRow
            mode={2}
            icon="📄"
            name="Alle Lücken"
            badge="Aktiv"
            badgeClass="bg-blue/10 text-blue border border-blue/25"
            desc="Alle normalen Wörter werden zu Lücken — nur Fettgedrucktes und Kursives bleibt sichtbar."
            accentColor="blue"
            hoverClass="hover:border-blue/35 hover:bg-blue/[0.03]"
            disabled={false}
            onSelect={onSelect}
          />
          <ModeRow
            mode={3}
            icon="🧩"
            name="Reihenfolge"
            badge="Aktiv"
            badgeClass="bg-purple/10 text-purple border border-purple/25"
            desc="Abschnitte sind durcheinander — bringe sie per Drag & Drop in die richtige Reihenfolge."
            accentColor="purple"
            hoverClass="hover:border-purple/35 hover:bg-purple/[0.03]"
            disabled={!script.sections?.length}
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  );
}

function ModeRow({
  mode, icon, name, badge, badgeClass, desc,
  accentColor, hoverClass, disabled, onSelect,
}: {
  mode: TrainingMode;
  icon: string;
  name: string;
  badge: string;
  badgeClass: string;
  desc: string;
  accentColor: string;
  hoverClass: string;
  disabled: boolean;
  onSelect: (m: TrainingMode) => void;
}) {
  return (
    <button
      onClick={() => !disabled && onSelect(mode)}
      disabled={disabled}
      className={cn(
        'group relative flex items-start gap-4 text-left rounded-xl p-4 border transition-all duration-200 overflow-hidden',
        disabled
          ? 'border-border/40 bg-surface2/40 opacity-35 cursor-not-allowed'
          : cn('border-border/60 bg-surface2/60 cursor-pointer hover:-translate-x-0 hover:translate-x-0.5', hoverClass),
      )}
    >
      {/* Left accent bar */}
      {!disabled && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-[3px] rounded-r opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            accentColor === 'accent' && 'bg-accent',
            accentColor === 'blue' && 'bg-blue',
            accentColor === 'purple' && 'bg-purple',
          )}
        />
      )}

      <span className="text-xl mt-0.5 flex-shrink-0 pl-1">{icon}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-display text-[0.95rem] font-semibold text-text">{name}</span>
          <span className={cn('font-mono text-[9px] px-2 py-0.5 rounded-full tracking-wide uppercase', badgeClass)}>
            {badge}
          </span>
        </div>
        <p className="text-text2 text-[0.825rem] leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}
