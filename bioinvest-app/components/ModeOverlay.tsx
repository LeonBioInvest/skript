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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-bg/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 text-center border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-5 left-5 font-mono text-xs text-text3 hover:text-text2 transition-colors flex items-center gap-1"
          >
            ← Zurück
          </button>
          <span className="font-mono text-[11px] tracking-widest uppercase text-accent mb-3 block">
            {script.icon} {script.name}
          </span>
          <h2 className="font-display text-2xl font-bold text-text mb-1">Modus wählen</h2>
          <p className="text-text2 text-sm">Wie möchtest du heute üben?</p>
        </div>

        {/* Mode list */}
        <div className="p-6 flex flex-col gap-3">
          {/* Mode 1 — Lückentext */}
          <ModeRow
            mode={1}
            icon="✏️"
            name="Lückentext"
            badge="Aktiv"
            badgeClass="bg-accent/10 text-accent border border-accent/30"
            desc="~28% der Wörter werden zufällig durch Eingabefelder ersetzt. Der Rest bleibt sichtbar — ideal zum Einsteigen."
            barClass="bg-accent"
            hoverClass="hover:border-accent/50 hover:bg-accent/[0.04]"
            disabled={false}
            onSelect={onSelect}
          />
          {/* Mode 2 — Passagen */}
          <ModeRow
            mode={2}
            icon="📄"
            name="Alle Lücken"
            badge="Aktiv"
            badgeClass="bg-blue/10 text-blue border border-blue/30"
            desc="Alle normalen Wörter werden zu Lücken — nur fette, kursive Wörter und Satzzeichen bleiben sichtbar. Maximale Schwierigkeit."
            barClass="bg-blue"
            hoverClass="hover:border-blue/40 hover:bg-blue/[0.04]"
            disabled={false}
            onSelect={onSelect}
          />
          {/* Mode 3 — Reihenfolge */}
          <ModeRow
            mode={3}
            icon="🧩"
            name="Reihenfolge"
            badge="Aktiv"
            badgeClass="bg-purple/10 text-purple border border-purple/30"
            desc="Die Abschnitte des Gesprächs sind durcheinander gewürfelt — bringe sie per Drag & Drop in die richtige Reihenfolge."
            barClass="bg-purple"
            hoverClass="hover:border-purple/40 hover:bg-purple/[0.04]"
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
  barClass, hoverClass, disabled, onSelect,
}: {
  mode: TrainingMode;
  icon: string;
  name: string;
  badge: string;
  badgeClass: string;
  desc: string;
  barClass: string;
  hoverClass: string;
  disabled: boolean;
  onSelect: (m: TrainingMode) => void;
}) {
  return (
    <button
      onClick={() => !disabled && onSelect(mode)}
      disabled={disabled}
      className={cn(
        'group relative flex items-start gap-4 text-left rounded-xl p-5 border transition-all duration-200 overflow-hidden',
        disabled
          ? 'border-border bg-surface2 opacity-40 cursor-not-allowed'
          : cn('border-border bg-surface2 cursor-pointer hover:translate-x-1', hoverClass),
      )}
    >
      {/* Left accent bar */}
      {!disabled && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-[3px] rounded-r opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            barClass,
          )}
        />
      )}
      <span className="text-2xl mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-display text-base font-semibold text-text">{name}</span>
          <span className={cn('font-mono text-[10px] px-2 py-0.5 rounded-full', badgeClass)}>
            {badge}
          </span>
        </div>
        <p className="text-text2 text-sm leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}
