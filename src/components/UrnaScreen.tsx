import React from 'react';
import { Candidate } from '../types';

interface UrnaScreenProps {
  digits: string;
  selectedCandidate: Candidate | null;
  isBranco: boolean;
  isNulo: boolean;
  isFim: boolean;
}

export const UrnaScreen: React.FC<UrnaScreenProps> = ({
  digits,
  selectedCandidate,
  isBranco,
  isNulo,
  isFim
}) => {
  // Digit boxes array (length 2 for presidential vote)
  const d1 = digits[0] || '';
  const d2 = digits[1] || '';

  if (isFim) {
    return (
      <div className="w-full h-full bg-[#fdfdfd] text-[#1a1a1a] rounded-lg p-3 sm:p-4 flex flex-col items-center justify-center font-sans select-none relative overflow-hidden border-2 sm:border-3 md:border-4 border-black shadow-inner min-h-[220px] sm:min-h-[260px] md:min-h-[280px]">
        <div className="text-center animate-pulse">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-widest text-[#1a1a1a] mb-1">
            FIM
          </h1>
          <p className="text-[11px] sm:text-xs font-black tracking-widest text-gray-700 uppercase">
            Votação Concluída
          </p>
        </div>

        <div className="absolute bottom-2 right-3 text-[8px] sm:text-[9px] text-gray-800 font-black tracking-widest uppercase">
          JUSTIÇA ELEITORAL
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#fdfdfd] text-[#1a1a1a] rounded-lg p-2.5 sm:p-3.5 md:p-4 flex flex-col justify-between font-sans select-none relative border-2 sm:border-3 md:border-4 border-black shadow-inner min-h-[220px] sm:min-h-[260px] md:min-h-[280px] text-xs">
      {/* Main Upper Info Area */}
      <div className="flex justify-between items-start gap-2 sm:gap-3 relative z-10 flex-1">
        
        {/* Left Side: Role, Digits, Candidate Info */}
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
          
          {/* Header */}
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase text-gray-500 tracking-wider">
              SEU VOTO PARA
            </span>
            <span className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-0.5">
              PRESIDENTE
            </span>
          </div>

          {/* Number Inputs */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5">
            <span className="font-bold text-gray-700 uppercase text-[10px] sm:text-[11px]">Número:</span>
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Digit Box 1 */}
              <div className={`w-7 h-9 sm:w-9 sm:h-10 md:w-10 md:h-11 border-2 md:border-3 border-black bg-white flex items-center justify-center font-mono font-black text-lg sm:text-xl md:text-2xl shadow-xs ${
                d1 ? 'text-black' : 'text-gray-300 animate-pulse'
              }`}>
                {d1}
              </div>
              {/* Digit Box 2 */}
              <div className={`w-7 h-9 sm:w-9 sm:h-10 md:w-10 md:h-11 border-2 md:border-3 border-black bg-white flex items-center justify-center font-mono font-black text-lg sm:text-xl md:text-2xl shadow-xs ${
                d2 ? 'text-black' : d1 ? 'animate-pulse text-gray-300' : 'text-gray-300'
              }`}>
                {d2}
              </div>
            </div>
          </div>

          {/* Blank or Null message */}
          {isBranco && (
            <div className="pt-1">
              <div className="text-base sm:text-lg md:text-xl font-black text-black tracking-wider animate-pulse uppercase border-2 border-black p-1 sm:p-1.5 bg-gray-100 text-center">
                VOTO EM BRANCO
              </div>
            </div>
          )}

          {isNulo && (
            <div className="pt-1 space-y-0.5">
              <div className="text-[9px] sm:text-[10px] font-black text-red-700 uppercase tracking-widest">
                NÚMERO ERRADO
              </div>
              <div className="text-sm sm:text-base md:text-lg font-black text-black tracking-wider uppercase animate-pulse border-2 border-red-700 p-1 sm:p-1.5 bg-red-50 text-center">
                VOTO NULO
              </div>
            </div>
          )}

          {/* Valid Candidate Selected */}
          {selectedCandidate && !isBranco && !isNulo && (
            <div className="space-y-1 pt-1 text-[#1a1a1a] border-t-2 border-gray-200">
              <div className="min-w-0">
                <span className="text-[8px] sm:text-[9px] font-extrabold text-gray-500 uppercase block">Nome:</span>
                <span className="font-black text-xs sm:text-sm md:text-base uppercase tracking-tight block text-black leading-tight truncate sm:whitespace-normal">
                  {selectedCandidate.name}
                </span>
              </div>

              <div className="min-w-0">
                <span className="text-[8px] sm:text-[9px] font-extrabold text-gray-500 uppercase block">Partido:</span>
                <span className="font-bold text-[10px] sm:text-xs uppercase block text-black truncate sm:whitespace-normal">
                  {selectedCandidate.partyAcronym} - {selectedCandidate.party}
                </span>
              </div>

              <div className="min-w-0">
                <span className="text-[8px] sm:text-[9px] font-extrabold text-gray-500 uppercase block">Vice-Presidente:</span>
                <span className="font-bold text-[10px] sm:text-[11px] uppercase block text-gray-800 truncate sm:whitespace-normal">
                  {selectedCandidate.viceName}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Candidate Photo Frame */}
        <div className="shrink-0 flex flex-col items-center">
          <div className="bg-[#eee] p-1 border-2 border-black shadow-xs flex flex-col items-center">
            <div className="w-16 h-20 sm:w-20 sm:h-24 md:w-22 md:h-28 bg-[#ccc] flex items-center justify-center relative overflow-hidden border border-gray-400">
              {selectedCandidate && !isBranco && !isNulo ? (
                <img
                  src={selectedCandidate.imageUrl}
                  alt={selectedCandidate.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-1 text-center text-gray-600">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500">
                    <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                  </svg>
                  <span className="text-[7px] sm:text-[8px] font-black uppercase mt-0.5">FOTO</span>
                </div>
              )}
            </div>
            <span className="text-[7px] sm:text-[8px] mt-0.5 font-black uppercase tracking-wider text-black">
              JUSTIÇA ELEITORAL
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Instructions Footer */}
      <div className="mt-2 pt-1 border-t-2 border-black relative z-10 text-[9px] sm:text-[10px] font-bold text-black leading-tight">
        <p className="uppercase font-black">Aperte a tecla:</p>
        <p className="text-emerald-800 font-extrabold">CONFIRMA para CONFIRMAR este voto</p>
        <p className="text-amber-800 font-extrabold">CORRIGE para REINICIAR este voto</p>
      </div>
    </div>
  );
};
