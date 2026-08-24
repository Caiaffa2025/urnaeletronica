import React, { useEffect } from 'react';
import { Candidate } from '../types';
import { UrnaScreen } from './UrnaScreen';
import { UrnaKeypad } from './UrnaKeypad';
import { audioService } from '../services/audioService';

interface UrnaMachineProps {
  digits: string;
  selectedCandidate: Candidate | null;
  isBranco: boolean;
  isNulo: boolean;
  isFim: boolean;
  onNumberPress: (digit: string) => void;
  onBrancoPress: () => void;
  onCorrigePress: () => void;
  onConfirmaPress: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAdmin?: () => void;
}

export const UrnaMachine: React.FC<UrnaMachineProps> = ({
  digits,
  selectedCandidate,
  isBranco,
  isNulo,
  isFim,
  onNumberPress,
  onBrancoPress,
  onCorrigePress,
  onConfirmaPress,
  soundEnabled,
  onToggleSound,
  onOpenAdmin,
}) => {
  // Add physical keyboard listener for realistic voting experience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keypresses inside input or textarea elements
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        onNumberPress(e.key);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirmaPress();
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Escape') {
        e.preventDefault();
        onCorrigePress();
      } else if (e.key.toLowerCase() === 'b' || e.key === ' ') {
        e.preventDefault();
        onBrancoPress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNumberPress, onConfirmaPress, onCorrigePress, onBrancoPress]);

  return (
    <div className="relative bg-[#e0e0e0] border-4 sm:border-[6px] md:border-[8px] border-[#333] rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 shadow-2xl max-w-3xl mx-auto my-3 sm:my-6 text-[#1a1a1a]">
      {/* Top Header Section */}
      <div className="flex flex-wrap items-center justify-between pb-2 mb-2 sm:mb-3 border-b-2 sm:border-b-4 border-[#222] gap-2 bg-[#d5d5d5] p-2 sm:p-2.5 rounded-lg border border-[#bbb]">
        {/* Brasil Emblem / Coat of Arms Header */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#111] border border-[#f37021] flex items-center justify-center text-white font-black text-[9px] sm:text-[10px] shadow-xs">
            TSE
          </div>
          <div>
            <h2 className="text-xs sm:text-sm md:text-base font-black tracking-wider text-[#1a1a1a] uppercase leading-none">
              Urna Eletrônica
            </h2>
            <p className="text-[9px] sm:text-[10px] text-[#444] font-extrabold uppercase tracking-wider mt-0.5">
              Justiça Eleitoral • República Federativa do Brasil
            </p>
          </div>
        </div>

        {/* Audio Mute/Unmute Toggle & ADM button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all border border-black cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-black shadow-xs flex items-center gap-1"
              title="Abrir Painel Administrativo"
            >
              <span>⚙️ ADM</span>
            </button>
          )}

          <button
            onClick={onToggleSound}
            className={`px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all border border-black cursor-pointer shadow-xs ${
              soundEnabled
                ? 'bg-[#009541] text-white hover:bg-[#007031]'
                : 'bg-[#888] text-white hover:bg-[#666]'
            }`}
            title="Alternar áudio da Urna"
          >
            <span>{soundEnabled ? '🔊 Som' : '🔇 Muted'}</span>
          </button>
        </div>
      </div>

      {/* Urna Main Layout: Screen on Left, Keypad on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-stretch bg-[#222] p-2 sm:p-3 rounded-xl border-2 border-black">
        
        {/* Left: LCD Screen (7 Cols on desktop/tablet) */}
        <div className="md:col-span-7 flex flex-col justify-center">
          <UrnaScreen
            digits={digits}
            selectedCandidate={selectedCandidate}
            isBranco={isBranco}
            isNulo={isNulo}
            isFim={isFim}
          />
        </div>

        {/* Right: Black Tactile Keypad (5 Cols on desktop/tablet) */}
        <div className="md:col-span-5 flex flex-col justify-center">
          <UrnaKeypad
            onNumberPress={onNumberPress}
            onBrancoPress={onBrancoPress}
            onCorrigePress={onCorrigePress}
            onConfirmaPress={onConfirmaPress}
          />
        </div>
      </div>

      {/* Physical ridges bottom detail */}
      <div className="mt-3 sm:mt-4 flex justify-around opacity-30 px-3 sm:px-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-5 sm:w-8 h-1.5 sm:h-2 bg-slate-600 rounded-xs shadow-inner" />
        ))}
      </div>
    </div>
  );
};
