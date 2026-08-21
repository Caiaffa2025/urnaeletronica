import React from 'react';
import { Candidate, ElectionStats } from '../types';
import { X, Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';

interface BoletimModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ElectionStats;
  candidates: Record<string, Candidate>;
}

export const BoletimModal: React.FC<BoletimModalProps> = ({
  isOpen,
  onClose,
  stats,
  candidates,
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR');

  const lula = candidates['13'];
  const flavio = candidates['22'];
  const validVotes = stats.lulaVotes + stats.flavioVotes;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const reportText = `
========================================
JUSTIÇA ELEITORAL - BOLETIM DE URNA (BU)
========================================
ELEIÇÃO PRESIDENCIAL SIMULADA
DATA DA EMISSÃO: ${dateStr} - ${timeStr}
MUNICÍPIO: BRASÍLIA / DF
ZONA: 001  SEÇÃO: 001
URNA ID: UE-2026-BR88921

RESULTADO DA APURAÇÃO:
----------------------------------------
13 - LULA (PT): ${stats.lulaVotes} votos
22 - FLÁVIO RACHADINHA (PL): ${stats.flavioVotes} votos
VOTOS EM BRANCO: ${stats.brancoVotes}
VOTOS NULOS: ${stats.nuloVotes}
----------------------------------------
TOTAL DE VOTOS APURADOS: ${stats.totalVotes}
TOTAL DE VOTOS VÁLIDOS: ${validVotes}

CÓDIGO DE VERIFICAÇÃO AUTÊNTICO:
SHA256: 8f9b2e1a3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b
========================================
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `boletim_de_urna_${now.getTime()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden border-2 border-black flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#222] text-white p-4 flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#f37021]" />
            <span className="font-black text-sm tracking-wider uppercase">
              Boletim de Urna (BU) Oficial
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-black text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Paper Slip */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-[#1a1a1a] bg-[#f8f8f8] space-y-4 border-b-2 border-black shadow-inner">
          <div className="text-center pb-3 border-b-2 border-black space-y-1">
            <div className="font-black text-base text-black uppercase tracking-wider">JUSTIÇA ELEITORAL</div>
            <div className="text-[10px] font-black text-gray-600 uppercase">REPÚBLICA FEDERATIVA DO BRASIL</div>
            <div className="text-[10px] font-extrabold text-gray-500 uppercase">BOLETIM DE URNA - UE SIMULADA</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-gray-400 pb-3 font-bold">
            <div><span className="text-gray-600 uppercase">MUNICÍPIO:</span> BRASÍLIA/DF</div>
            <div><span className="text-gray-600 uppercase">ZONA:</span> 001  <span className="text-gray-600">SEÇÃO:</span> 0001</div>
            <div><span className="text-gray-600 uppercase">DATA:</span> {dateStr}</div>
            <div><span className="text-gray-600 uppercase">HORA:</span> {timeStr}</div>
          </div>

          <div className="space-y-2 py-2">
            <div className="font-black text-black border-b-2 border-black pb-1 uppercase">
              CARGO: PRESIDENTE
            </div>

            <div className="flex justify-between items-center py-1 font-bold">
              <span>13 - LULA ({lula.partyAcronym}):</span>
              <span className="font-black text-base text-black">{stats.lulaVotes}</span>
            </div>

            <div className="flex justify-between items-center py-1 font-bold">
              <span>22 - FLÁVIO RACHADINHA ({flavio.partyAcronym}):</span>
              <span className="font-black text-base text-black">{stats.flavioVotes}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-t border-dashed border-gray-400 pt-1 font-bold">
              <span>VOTOS EM BRANCO:</span>
              <span className="font-black">{stats.brancoVotes}</span>
            </div>

            <div className="flex justify-between items-center py-1 font-bold">
              <span>VOTOS NULOS:</span>
              <span className="font-black">{stats.nuloVotes}</span>
            </div>
          </div>

          <div className="border-t-2 border-black pt-3 space-y-1">
            <div className="flex justify-between font-black text-sm text-black uppercase">
              <span>TOTAL APURADO:</span>
              <span>{stats.totalVotes}</span>
            </div>
            <div className="flex justify-between font-black text-xs text-[#009541] uppercase">
              <span>TOTAL DE VÁLIDOS:</span>
              <span>{validVotes}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-400 text-[9px] text-gray-600 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-[#009541] font-black uppercase">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Assinatura Digital Auditável Gravada</span>
            </div>
            <div className="break-all font-mono font-bold">
              HASH: 8f9b2e1a3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-200 flex items-center justify-end gap-3 border-t border-gray-300">
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded bg-white hover:bg-gray-100 text-black font-black text-xs uppercase border-2 border-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Baixar TXT</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded bg-[#222] hover:bg-black text-white font-black text-xs uppercase border-2 border-black flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
