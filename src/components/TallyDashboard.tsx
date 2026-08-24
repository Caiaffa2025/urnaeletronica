import React from 'react';
import { Candidate, ElectionStats, VoteRecord } from '../types';
import { Trophy, RefreshCw, FileText, Vote, BarChart3, Clock, Sparkles } from 'lucide-react';

interface TallyDashboardProps {
  stats: ElectionStats;
  candidates: Record<string, Candidate>;
  recentVotes: VoteRecord[];
  onReset: () => void;
  onOpenBoletim: () => void;
  onSimulateBatch: (count: number) => void;
  onSetExact150?: () => void;
  onFillTo150?: () => void;
}

export const TallyDashboard: React.FC<TallyDashboardProps> = ({
  stats,
  candidates,
  recentVotes,
  onReset,
  onOpenBoletim,
  onSimulateBatch,
  onSetExact150,
  onFillTo150,
}) => {
  const lula = candidates['13'];
  const flavio = candidates['22'];

  const validVotes = stats.lulaVotes + stats.flavioVotes;
  
  const lulaPctValid = validVotes > 0 ? (stats.lulaVotes / validVotes) * 100 : 0;
  const flavioPctValid = validVotes > 0 ? (stats.flavioVotes / validVotes) * 100 : 0;

  const lulaPctTotal = stats.totalVotes > 0 ? (stats.lulaVotes / stats.totalVotes) * 100 : 0;
  const flavioPctTotal = stats.totalVotes > 0 ? (stats.flavioVotes / stats.totalVotes) * 100 : 0;
  const brancoPctTotal = stats.totalVotes > 0 ? (stats.brancoVotes / stats.totalVotes) * 100 : 0;
  const nuloPctTotal = stats.totalVotes > 0 ? (stats.nuloVotes / stats.totalVotes) * 100 : 0;

  // Determine current leader
  let leaderText = 'Aguardando votos';
  let leaderCandidate: Candidate | null = null;
  if (stats.lulaVotes > stats.flavioVotes) {
    leaderText = '1º LUGAR: LULA (13)';
    leaderCandidate = lula;
  } else if (stats.flavioVotes > stats.lulaVotes) {
    leaderText = '1º LUGAR: FLÁVIO RACHADINHA (22)';
    leaderCandidate = flavio;
  } else if (validVotes > 0 && stats.lulaVotes === stats.flavioVotes) {
    leaderText = 'EMPATE TÉCNICO';
  }

  return (
    <div className="bg-white rounded-xl border-2 border-black shadow-sm p-4 sm:p-6 md:p-8 my-6 sm:my-8 max-w-5xl mx-auto">
      {/* Dashboard Title & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 sm:pb-6 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2 text-black font-black text-xs uppercase tracking-widest mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <BarChart3 className="w-4 h-4 text-[#f37021]" />
            <span className="text-emerald-700 font-black">SINCRONIZAÇÃO EM TEMPO REAL</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tight uppercase">
            Placar de Resultados da Eleição
          </h2>
          <p className="text-xs text-gray-600 font-bold uppercase mt-0.5">
            Total atual apurado: <strong className="text-black">{stats.totalVotes} votos</strong> {stats.totalVotes >= 150 ? '(Atingiu 150+ votos)' : `(Faltam ${150 - stats.totalVotes} para 150 votos)`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick 150 Votes Simulation Buttons */}
          <button
            onClick={() => onSimulateBatch(150)}
            className="px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border-2 border-black cursor-pointer shadow-sm active:translate-y-0.5"
            title="Adicionar +150 votos instantâneos à apuração"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>+150 VOTOS</span>
          </button>

          {onFillTo150 && stats.totalVotes < 150 && (
            <button
              onClick={onFillTo150}
              className="px-3.5 py-2 rounded bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border-2 border-black cursor-pointer shadow-xs active:translate-y-0.5"
              title="Preencher apuração até totalizar 150 votos"
            >
              <Vote className="w-4 h-4 text-black" />
              <span>COMPLETAR 150 VOTOS</span>
            </button>
          )}

          {onSetExact150 && (
            <button
              onClick={onSetExact150}
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-black font-black text-xs uppercase transition-all flex items-center gap-1 border-2 border-black cursor-pointer shadow-xs"
              title="Redefinir apuração com exatamente 150 votos distribuídos"
            >
              <span>GERAR 150 VOTOS</span>
            </button>
          )}

          <button
            onClick={() => onSimulateBatch(50)}
            className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-black font-black text-xs uppercase transition-all flex items-center gap-1 border-2 border-black cursor-pointer shadow-xs"
            title="Adicionar +50 votos"
          >
            <span>+50</span>
          </button>

          <button
            onClick={() => onSimulateBatch(10)}
            className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-black font-black text-xs uppercase transition-all flex items-center gap-1 border-2 border-black cursor-pointer shadow-xs"
            title="Adicionar +10 votos"
          >
            <span>+10</span>
          </button>

          <button
            onClick={onOpenBoletim}
            className="px-3.5 py-2 rounded bg-[#222] hover:bg-black text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border-2 border-black cursor-pointer shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Boletim de Urna (BU)</span>
          </button>

          <button
            onClick={onReset}
            className="px-3 py-2 rounded bg-red-100 hover:bg-red-200 text-red-900 font-black text-xs uppercase transition-all flex items-center gap-1 border-2 border-red-800 cursor-pointer"
            title="Emitir Zerésima e Resetar Urna"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Zerésima</span>
          </button>
        </div>
      </div>

      {/* Leader & Summary Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {/* Total Votes */}
        <div className="bg-[#eee] border-2 border-black rounded-lg p-4 flex flex-col justify-between">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider block">
            TOTAL DE VOTOS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-black">{stats.totalVotes}</span>
            <Vote className="w-6 h-6 text-black" />
          </div>
        </div>

        {/* Valid Votes */}
        <div className="bg-[#eee] border-2 border-black rounded-lg p-4 flex flex-col justify-between">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider block">
            VOTOS VÁLIDOS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-[#009541]">{validVotes}</span>
            <span className="text-xs font-black text-black">
              {stats.totalVotes > 0 ? ((validVotes / stats.totalVotes) * 100).toFixed(1) : '0'}%
            </span>
          </div>
        </div>

        {/* Blank & Null */}
        <div className="bg-[#eee] border-2 border-black rounded-lg p-4 flex flex-col justify-between">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider block">
            BRANCOS / NULOS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-black">
              {stats.brancoVotes + stats.nuloVotes}
            </span>
            <span className="text-[11px] font-bold text-gray-700">
              B: {stats.brancoVotes} | N: {stats.nuloVotes}
            </span>
          </div>
        </div>

        {/* Leader Badge */}
        <div className="bg-[#eee] border-2 border-black rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-black uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-[#f37021]" />
            <span>LIDERANÇA</span>
          </div>
          <div className="mt-2">
            <span className="text-base font-black text-black block truncate">
              {leaderText}
            </span>
            {leaderCandidate && (
              <span className="text-xs text-gray-700 font-extrabold uppercase">
                {lulaPctValid > flavioPctValid ? `${lulaPctValid.toFixed(1)}% dos válidos` : `${flavioPctValid.toFixed(1)}% dos válidos`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Candidate Progress Comparison */}
      <div className="space-y-6 my-8 bg-[#fdfdfd] p-6 rounded-xl border-2 border-black">
        <h3 className="text-lg font-black text-black uppercase tracking-wide">
          Comparativo de Candidatos
        </h3>

        {/* Candidate 13: Lula */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-bold">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-xs bg-[#cc0000] border border-black" />
              <span className="text-black font-black text-base uppercase">
                13 - Lula (PT)
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-[#cc0000]">{stats.lulaVotes} votos</span>
              <span className="text-xs text-gray-600 font-bold ml-2">({lulaPctValid.toFixed(1)}% dos válidos)</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-6 bg-gray-200 rounded overflow-hidden p-0.5 border-2 border-black">
            <div
              className="h-full bg-[#cc0000] transition-all duration-500"
              style={{ width: `${lulaPctTotal}%` }}
            />
          </div>
        </div>

        {/* Candidate 22: Flávio Rachadinha */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-bold">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-xs bg-[#002b7f] border border-black" />
              <span className="text-black font-black text-base uppercase">
                22 - Flávio Rachadinha (PL)
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-[#002b7f]">{stats.flavioVotes} votos</span>
              <span className="text-xs text-gray-600 font-bold ml-2">({flavioPctValid.toFixed(1)}% dos válidos)</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-6 bg-gray-200 rounded overflow-hidden p-0.5 border-2 border-black">
            <div
              className="h-full bg-[#002b7f] transition-all duration-500"
              style={{ width: `${flavioPctTotal}%` }}
            />
          </div>
        </div>

        {/* Brancos & Nulos Mini Bar */}
        <div className="pt-3 border-t-2 border-black grid grid-cols-2 gap-4 text-xs font-black text-black uppercase">
          <div>
            <span>Votos em Branco: </span>
            <span className="font-black text-[#f37021]">{stats.brancoVotes} ({brancoPctTotal.toFixed(1)}%)</span>
          </div>
          <div>
            <span>Votos Nulos: </span>
            <span className="font-black text-red-700">{stats.nuloVotes} ({nuloPctTotal.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Audit Stream / Recent Votes Log */}
      <div>
        <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider mb-3">
          <Clock className="w-4 h-4 text-black" />
          <span>Últimos Votos Registrados na Urna</span>
        </div>

        {recentVotes.length === 0 ? (
          <div className="text-center py-6 bg-gray-100 rounded-lg border-2 border-dashed border-gray-400 text-gray-600 text-xs font-black uppercase">
            Nenhum voto registrado até o momento. Digite um número na urna para votar.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {recentVotes.slice(-12).reverse().map((v) => (
              <span
                key={v.id}
                className={`px-3 py-1.5 rounded text-xs font-black border-2 border-black flex items-center gap-1.5 ${
                  v.type === '13'
                    ? 'bg-red-100 text-red-900'
                    : v.type === '22'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-gray-200 text-black'
                }`}
              >
                <span>{v.candidateName || v.type}</span>
                <span className="text-[10px] text-gray-700 font-mono font-bold">
                  {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
