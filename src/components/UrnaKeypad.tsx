import React from 'react';

interface UrnaKeypadProps {
  onNumberPress: (digit: string) => void;
  onBrancoPress: () => void;
  onCorrigePress: () => void;
  onConfirmaPress: () => void;
}

export const UrnaKeypad: React.FC<UrnaKeypadProps> = ({
  onNumberPress,
  onBrancoPress,
  onCorrigePress,
  onConfirmaPress,
}) => {
  // Key matrix layout
  const numberRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['0'],
  ];

  return (
    <div className="bg-[#2b2b2b] p-3 md:p-3.5 rounded-xl border-2 border-black shadow-xl flex flex-col justify-between select-none max-w-xs mx-auto w-full">
      {/* Header section */}
      <div className="text-center mb-2 pb-1 border-b border-[#444]">
        <div className="text-[10px] font-black text-[#888] tracking-widest uppercase">
          JUSTIÇA ELEITORAL
        </div>
      </div>

      {/* Numeric Grid */}
      <div className="flex flex-col items-center gap-2 mb-3">
        {numberRows.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-2 w-full">
            {row.map((num) => (
              <button
                key={num}
                onClick={() => onNumberPress(num)}
                className="w-11 h-10 md:w-13 md:h-11 bg-[#111] hover:bg-black active:bg-[#000] text-white font-mono font-bold text-lg md:text-xl rounded shadow-md border-b-3 border-black active:border-b-0 transition-all flex items-center justify-center cursor-pointer"
              >
                <span>{num}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#444] items-end">
        {/* BRANCO Button */}
        <button
          onClick={onBrancoPress}
          className="h-11 bg-white hover:bg-gray-100 text-black text-[10px] font-black uppercase tracking-wider rounded border-b-3 border-gray-400 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer px-0.5"
        >
          <span>BRANCO</span>
        </button>

        {/* CORRIGE Button */}
        <button
          onClick={onCorrigePress}
          className="h-11 bg-[#f37021] hover:bg-[#e06010] text-black text-[10px] font-black uppercase tracking-wider rounded border-b-3 border-[#c25a1a] active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer px-0.5"
        >
          <span>CORRIGE</span>
        </button>

        {/* CONFIRMA Button */}
        <button
          onClick={onConfirmaPress}
          className="h-15 bg-[#009541] hover:bg-[#008035] text-black text-[11px] font-black uppercase tracking-wider rounded border-b-3 border-[#007031] active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer px-0.5 -mt-3 shadow-md"
        >
          <span>CONFIRMA</span>
        </button>
      </div>
    </div>
  );
};
