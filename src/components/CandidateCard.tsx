import React, { useState } from 'react';
import { Candidate } from '../types';
import { CheckCircle2, UserCheck, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';
import { EditCandidateModal } from './EditCandidateModal';

interface CandidateCardProps {
  candidate: Candidate;
  onSelectCandidate: (number: string) => void;
  isSelectedInUrna: boolean;
  totalVotesForCandidate: number;
  percentageVotes: number;
  onOpenAdmin?: () => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onSelectCandidate,
  isSelectedInUrna,
  totalVotesForCandidate,
  percentageVotes,
  onOpenAdmin,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEditClick = () => {
    if (onOpenAdmin) {
      onOpenAdmin();
    } else {
      setIsEditOpen(true);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className={`relative flex flex-col rounded-xl overflow-hidden border-2 border-black transition-all shadow-sm bg-white ${
          isSelectedInUrna
            ? 'ring-4 ring-black shadow-xl'
            : 'hover:shadow-md'
        }`}
      >
        {/* Top Banner with Number Badge */}
        <div 
          className="px-3.5 sm:px-5 py-2.5 sm:py-3 flex flex-wrap sm:flex-nowrap items-center justify-between text-white font-black uppercase tracking-wider border-b-2 border-black gap-2"
          style={{ backgroundColor: candidate.color }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-widest bg-black/30 px-2.5 sm:px-3 py-0.5 rounded border border-white/40">
              {candidate.number}
            </span>
            <span className="text-base sm:text-lg font-black uppercase">
              {candidate.partyAcronym}
            </span>
          </div>

          <button
            onClick={handleEditClick}
            className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black px-2.5 sm:px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer shadow-xs"
            title="Abrir Painel ADM para editar fotos e dados"
          >
            <Edit3 className="w-3.5 h-3.5 text-black" />
            <span>⚙️ ADM (EDITAR FOTO)</span>
          </button>
        </div>

        <div className="p-3.5 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 items-center flex-1">
          {/* Candidate Image Container */}
          <div className="relative group shrink-0">
            <div className="w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 rounded-md overflow-hidden border-2 border-black shadow-inner bg-[#ddd] relative">
              <img
                src={candidate.imageUrl}
                alt={candidate.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
              {/* Number overlay badge on image */}
              <div 
                className="absolute bottom-2 left-2 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-white font-black text-[10px] sm:text-xs shadow-md border border-black/40"
                style={{ backgroundColor: candidate.color }}
              >
                Nº {candidate.number}
              </div>

              {/* Hover overlay to edit photo */}
              <button
                onClick={handleEditClick}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] sm:text-xs font-black uppercase tracking-wider cursor-pointer gap-1"
              >
                <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                <span>ALTERAR FOTO (ADM)</span>
              </button>
            </div>
            
            {isSelectedInUrna && (
              <div className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 sm:p-1.5 shadow-lg border-2 border-white animate-bounce">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
            )}
          </div>

          {/* Info & Stats */}
          <div className="flex-1 flex flex-col justify-between w-full text-center sm:text-left">
            <div>
              <div className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                CANDIDATO A PRESIDENTE
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-black leading-tight mb-1 uppercase tracking-tight">
                {candidate.name}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-700 font-extrabold mb-2 sm:mb-3 uppercase">
                VICE: <span className="font-bold text-black">{candidate.viceName}</span>
              </p>
              <p className="text-[11px] sm:text-xs italic text-gray-600 bg-gray-100 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded border border-gray-300 inline-block font-semibold">
                "{candidate.slogan}"
              </p>
            </div>

            {/* Quick Vote Tally Stats */}
            <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t-2 border-gray-200 flex items-center justify-between gap-2">
              <div>
                <span className="text-[9px] sm:text-[10px] font-extrabold text-gray-500 uppercase block">Votos acumulados</span>
                <span className="text-base sm:text-lg font-black text-black">
                  {totalVotesForCandidate} <span className="text-[10px] sm:text-xs font-bold text-gray-500">votos</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] sm:text-[10px] font-extrabold text-gray-500 uppercase block">Porcentagem</span>
                <span className="text-base sm:text-lg font-black" style={{ color: candidate.color }}>
                  {percentageVotes.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Direct Selection Button */}
            <button
              onClick={() => onSelectCandidate(candidate.number)}
              className="mt-3 sm:mt-4 w-full bg-[#222] hover:bg-black text-white py-2.5 sm:py-3 px-3 sm:px-5 text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 border-black rounded cursor-pointer shadow-sm active:translate-y-0.5"
            >
              <UserCheck className="w-4 h-4 text-gray-300" />
              <span>VOTAR {candidate.number} ({candidate.shortName})</span>
            </button>
          </div>
        </div>
      </motion.div>

      <EditCandidateModal
        candidate={candidate}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </>
  );
};
