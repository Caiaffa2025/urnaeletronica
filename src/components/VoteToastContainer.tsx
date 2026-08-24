import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { VoteToastItem, Candidate } from '../types';
import { Radio, X, Vote, CheckCircle2 } from 'lucide-react';

interface VoteToastContainerProps {
  toasts: VoteToastItem[];
  onDismiss: (id: string) => void;
  candidatesMap: Record<string, Candidate>;
}

export const VoteToastContainer: React.FC<VoteToastContainerProps> = ({
  toasts,
  onDismiss,
  candidatesMap,
}) => {
  return (
    <aside 
      aria-label="Notificações de Votação em Tempo Real"
      aria-live="polite"
      className="fixed top-3 sm:top-auto sm:bottom-4 left-2 right-2 sm:left-auto sm:right-4 z-50 flex flex-col gap-2 max-w-md sm:max-w-sm ml-auto pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isLula = toast.type === '13';
          const isFlavio = toast.type === '22';
          const isBranco = toast.type === 'BRANCO';
          const isNulo = toast.type === 'NULO';

          const candidate = candidatesMap[toast.type];
          const imgUrl = candidate?.imageUrl || toast.imageUrl;

          let borderColor = 'border-gray-600';
          let badgeBg = 'bg-gray-800 text-gray-200';
          let accentColor = '#666';
          let glowColor = 'shadow-black/40';

          if (isLula) {
            borderColor = 'border-red-500';
            badgeBg = 'bg-red-600 text-white';
            accentColor = '#CC0000';
            glowColor = 'shadow-red-950/40';
          } else if (isFlavio) {
            borderColor = 'border-blue-500';
            badgeBg = 'bg-blue-600 text-white';
            accentColor = '#002B7F';
            glowColor = 'shadow-blue-950/40';
          } else if (isBranco) {
            borderColor = 'border-slate-300';
            badgeBg = 'bg-slate-200 text-slate-900';
            accentColor = '#e2e8f0';
          } else if (isNulo) {
            borderColor = 'border-amber-500';
            badgeBg = 'bg-amber-500 text-black';
            accentColor = '#f59e0b';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -15, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              className={`pointer-events-auto bg-[#18181b]/95 sm:bg-[#18181b] text-white rounded-xl shadow-2xl ${glowColor} border-2 ${borderColor} p-3 sm:p-3.5 flex flex-col gap-2 relative overflow-hidden backdrop-blur-md transition-all`}
              id={`toast-${toast.id}`}
              onClick={() => onDismiss(toast.id)}
            >
              {/* Header: Live Badge & Timestamp & Close button */}
              <div className="flex items-center justify-between gap-2 border-b border-gray-800 pb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 truncate">
                    NOVO VOTO CONFIRMADO
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-gray-400 font-mono font-bold">
                    {new Date(toast.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(toast.id);
                    }}
                    className="text-gray-400 hover:text-white p-1 -mr-1 rounded-full hover:bg-gray-800 transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title="Fechar notificação"
                    aria-label="Fechar notificação"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body: Candidate Info & Vote Type */}
              <div className="flex items-center gap-3">
                {/* Candidate Image or Icon */}
                {imgUrl ? (
                  <div 
                    className="w-12 h-14 sm:w-12 sm:h-14 rounded-lg overflow-hidden border-2 bg-black shrink-0 relative shadow-sm"
                    style={{ borderColor: accentColor }}
                  >
                    <img
                      src={imgUrl}
                      alt={toast.title}
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center border-2 bg-gray-900 shrink-0"
                    style={{ borderColor: accentColor }}
                  >
                    <Vote className="w-6 h-6 text-gray-300" />
                  </div>
                )}

                {/* Candidate Info / Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase ${badgeBg}`}>
                      {toast.candidateNumber ? `Nº ${toast.candidateNumber}` : toast.type}
                    </span>
                    {toast.count && toast.count > 1 && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-yellow-400 text-black uppercase">
                        +{toast.count} VOTOS
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm sm:text-base font-black text-white truncate uppercase tracking-tight mt-0.5">
                    {toast.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 truncate uppercase font-bold">
                    {toast.subtitle}
                  </p>
                </div>
              </div>

              {/* Mobile swipe/tap hint */}
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-1 border-t border-gray-800/80">
                <div className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Registrado na Urna Eletrônica</span>
                </div>
                <span className="text-[9px] text-gray-500 sm:hidden">Toque para fechar</span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </aside>
  );
};
