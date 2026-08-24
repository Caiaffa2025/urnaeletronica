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
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
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

          if (isLula) {
            borderColor = 'border-red-500';
            badgeBg = 'bg-red-600 text-white';
            accentColor = '#CC0000';
          } else if (isFlavio) {
            borderColor = 'border-blue-600';
            badgeBg = 'bg-blue-600 text-white';
            accentColor = '#002B7F';
          } else if (isBranco) {
            borderColor = 'border-slate-400';
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
              initial={{ opacity: 0, y: 30, scale: 0.92, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: 50, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`pointer-events-auto bg-[#18181b] text-white rounded-xl shadow-2xl border-2 ${borderColor} p-3.5 flex flex-col gap-2 relative overflow-hidden backdrop-blur-md`}
              id={`toast-${toast.id}`}
            >
              {/* Header: Live Badge & Timestamp */}
              <div className="flex items-center justify-between gap-2 border-b border-gray-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    FIRESTORE • NOVO VOTO REGISTRADO
                  </span>
                </div>

                <button
                  onClick={() => onDismiss(toast.id)}
                  className="text-gray-400 hover:text-white p-0.5 rounded hover:bg-gray-800 transition-colors cursor-pointer"
                  title="Fechar notificação"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Body: Candidate Info & Vote Type */}
              <div className="flex items-center gap-3">
                {/* Candidate Image or Icon */}
                {imgUrl ? (
                  <div 
                    className="w-12 h-14 rounded-lg overflow-hidden border-2 bg-black shrink-0 relative shadow-sm"
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
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase ${badgeBg}`}>
                      {toast.candidateNumber ? `Nº ${toast.candidateNumber}` : toast.type}
                    </span>
                    {toast.count && toast.count > 1 && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-yellow-400 text-black uppercase">
                        +{toast.count} VOTOS
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-black text-white truncate uppercase tracking-tight mt-0.5">
                    {toast.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 truncate uppercase font-bold">
                    {toast.subtitle}
                  </p>
                </div>
              </div>

              {/* Footer status */}
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider pt-1 border-t border-gray-800/80">
                <div className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Computado na Urna</span>
                </div>
                <span>{new Date(toast.timestamp).toLocaleTimeString('pt-BR')}</span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </aside>
  );
};
