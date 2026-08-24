import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Candidate, ElectionStats, VoteRecord, VoteType } from './types';
import { CANDIDATES as DEFAULT_CANDIDATES } from './data/candidates';
import { CandidateCard } from './components/CandidateCard';
import { UrnaMachine } from './components/UrnaMachine';
import { TallyDashboard } from './components/TallyDashboard';
import { BoletimModal } from './components/BoletimModal';
import { AdminModal } from './components/AdminModal';
import { audioService } from './services/audioService';
import { subscribeCandidates } from './services/firebaseService';
import { Vote, Info, CheckCircle2, ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'urna_eleitoral_votos_v2';

// Helper to generate realistic simulated votes
const generateSimulatedVotes = (count: number, candidates: Record<string, Candidate>): VoteRecord[] => {
  const batch: VoteRecord[] = [];
  // Realistic political distribution (~52% Lula, ~42% Flávio, ~3% Branco, ~3% Nulo)
  const pool: VoteType[] = [
    '13', '13', '13', '13', '13', '13', '13', '13', '13', '13',
    '22', '22', '22', '22', '22', '22', '22', '22',
    'BRANCO',
    'NULO'
  ];
  
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const type = pool[Math.floor(Math.random() * pool.length)];
    let candidateName = 'VOTO NULO';
    let candidateNumber = type;
    if (type === '13') {
      candidateName = candidates['13']?.name || DEFAULT_CANDIDATES['13'].name;
      candidateNumber = '13';
    } else if (type === '22') {
      candidateName = candidates['22']?.name || DEFAULT_CANDIDATES['22'].name;
      candidateNumber = '22';
    } else if (type === 'BRANCO') {
      candidateName = 'VOTO EM BRANCO';
      candidateNumber = 'BRANCO';
    }

    batch.push({
      id: `vote-${now}-${i}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      candidateName,
      candidateNumber,
      timestamp: new Date(now - Math.floor(Math.random() * 7200000) - (count - i) * 3000),
    });
  }
  return batch;
};

export default function App() {
  // Candidate data state synchronized with Firestore database
  const [candidatesMap, setCandidatesMap] = useState<Record<string, Candidate>>(DEFAULT_CANDIDATES);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Subscribe to real-time candidate updates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeCandidates((updatedCandidates) => {
      setCandidatesMap(updatedCandidates);
    });
    return () => unsubscribe();
  }, []);

  // State for Urna
  const [digits, setDigits] = useState<string>('');
  const [isBranco, setIsBranco] = useState<boolean>(false);
  const [isFim, setIsFim] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Voting statistics and audit log (initialized to 150 votes if no previous votes stored)
  const [votes, setVotes] = useState<VoteRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore localStorage errors
    }
    // Default initial seed with 150 votes as requested
    return generateSimulatedVotes(150, DEFAULT_CANDIDATES);
  });

  // Modal for Boletim de Urna
  const [isBoletimOpen, setIsBoletimOpen] = useState<boolean>(false);

  // Save votes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
    } catch {
      // Ignore
    }
  }, [votes]);

  // Derived selected candidate based on current digits
  const selectedCandidate: Candidate | null = candidatesMap[digits] || null;
  const isNulo = digits.length === 2 && !selectedCandidate && !isBranco;

  // Compute Statistics
  const stats: ElectionStats = votes.reduce(
    (acc, v) => {
      acc.totalVotes += 1;
      if (v.type === '13') acc.lulaVotes += 1;
      else if (v.type === '22') acc.flavioVotes += 1;
      else if (v.type === 'BRANCO') acc.brancoVotes += 1;
      else if (v.type === 'NULO') acc.nuloVotes += 1;
      return acc;
    },
    { totalVotes: 0, lulaVotes: 0, flavioVotes: 0, brancoVotes: 0, nuloVotes: 0 }
  );

  const validVotes = stats.lulaVotes + stats.flavioVotes;
  const lulaPct = validVotes > 0 ? (stats.lulaVotes / validVotes) * 100 : 0;
  const flavioPct = validVotes > 0 ? (stats.flavioVotes / validVotes) * 100 : 0;

  // Keypress handlers
  const handleNumberPress = useCallback((digit: string) => {
    if (isFim) return;
    audioService.playKeyClick(digit);
    setIsBranco(false);
    setDigits((prev) => {
      if (prev.length < 2) {
        return prev + digit;
      }
      return prev;
    });
  }, [isFim]);

  const handleBrancoPress = useCallback(() => {
    if (isFim) return;
    audioService.playKeyClick('branco');
    setDigits('');
    setIsBranco(true);
  }, [isFim]);

  const handleCorrigePress = useCallback(() => {
    if (isFim) return;
    audioService.playCorrigeSound();
    setDigits('');
    setIsBranco(false);
  }, [isFim]);

  const handleConfirmaPress = useCallback(() => {
    if (isFim) return;

    // Check if valid input to confirm
    if (!isBranco && digits.length < 2) {
      // Input incomplete, play warning tone
      audioService.playCorrigeSound();
      return;
    }

    // Determine the vote type
    let voteType: '13' | '22' | 'BRANCO' | 'NULO' = 'NULO';
    let candidateName = 'VOTO NULO';
    let candidateNumber = digits;

    if (isBranco) {
      voteType = 'BRANCO';
      candidateName = 'VOTO EM BRANCO';
      candidateNumber = 'BRANCO';
    } else if (digits === '13') {
      voteType = '13';
      candidateName = candidatesMap['13']?.name || DEFAULT_CANDIDATES['13'].name;
    } else if (digits === '22') {
      voteType = '22';
      candidateName = candidatesMap['22']?.name || DEFAULT_CANDIDATES['22'].name;
    }

    // Play Urna confirmation chime specific to vote type
    audioService.playConfirmationChime(voteType);

    const newVote: VoteRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: voteType,
      candidateName,
      candidateNumber,
      timestamp: new Date(),
    };

    setVotes((prev) => [...prev, newVote]);
    setIsFim(true);

    // Trigger celebratory confetti on valid vote
    if (voteType === '13' || voteType === '22') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: voteType === '13' ? ['#cc0000', '#ff4d4d', '#ffffff'] : ['#002b7f', '#3b82f6', '#ffcc00']
      });
    }

    // Automatically reset Urna back to IDLE state after 2.5 seconds
    setTimeout(() => {
      setDigits('');
      setIsBranco(false);
      setIsFim(false);
    }, 2500);
  }, [isFim, isBranco, digits]);

  // Handler from candidate cards: directly type candidate number into Urna
  const handleSelectCandidateCard = (number: string) => {
    if (isFim) return;
    audioService.playKeyClick(number.charAt(0));
    setIsBranco(false);
    setDigits(number);

    // Scroll smoothly to Urna Machine
    const urnaElement = document.getElementById('urna-machine-section');
    if (urnaElement) {
      urnaElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    audioService.setSoundEnabled(nextState);
  };

  // Reset all tallies (Zerésima)
  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja zerar a Urna? Todos os votos registrados serão apagados (Emissão da Zerésima).')) {
      setVotes([]);
      setDigits('');
      setIsBranco(false);
      setIsFim(false);
      audioService.playCorrigeSound();
    }
  };

  // Simulate batch votes for demonstration
  const handleSimulateBatch = (count: number) => {
    const newVotes = generateSimulatedVotes(count, candidatesMap);
    setVotes((prev) => [...prev, ...newVotes]);
    audioService.playConfirmationChime();
  };

  // Set exactly 150 votes
  const handleSetExact150 = () => {
    const newVotes = generateSimulatedVotes(150, candidatesMap);
    setVotes(newVotes);
    audioService.playConfirmationChime();
  };

  // Fill up to 150 votes
  const handleFillTo150 = () => {
    const current = votes.length;
    if (current < 150) {
      const needed = 150 - current;
      const newVotes = generateSimulatedVotes(needed, candidatesMap);
      setVotes((prev) => [...prev, ...newVotes]);
    } else {
      const newVotes = generateSimulatedVotes(150, candidatesMap);
      setVotes((prev) => [...prev, ...newVotes]);
    }
    audioService.playConfirmationChime();
  };

  return (
    <div className="min-h-screen bg-[#d5d5d5] text-[#1a1a1a] font-sans antialiased pb-16 overflow-x-hidden">
      {/* Top National Header Bar */}
      <header className="bg-[#1a1a1a] text-white border-b-4 border-[#009541] sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded bg-[#009541] border-2 border-yellow-400 flex items-center justify-center font-black text-white text-xs shadow-sm shrink-0">
              TSE
            </div>
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight flex flex-wrap items-center gap-1.5 sm:gap-2 uppercase leading-tight">
                <span>Sistema de Votação</span>
                <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded bg-[#009541] text-white border border-green-300 shrink-0">
                  SIMULADOR
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">
                Eleição para Presidente da República • Urna Eletrônica
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-800 pt-2 sm:pt-0">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black bg-[#222] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded border border-gray-700">
              <Vote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#009541]" />
              <span>VOTOS TOTAIS: <strong className="text-[#009541] text-xs sm:text-sm font-mono">{stats.totalVotes}</strong></span>
            </div>

            <button
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center gap-1.5 bg-[#009541] hover:bg-green-700 text-white text-[11px] sm:text-xs font-black uppercase px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded border-2 border-yellow-400 cursor-pointer shadow-sm transition-all active:translate-y-0.5 shrink-0"
              title="Abrir Painel ADM para editar fotos e informações dos candidatos"
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300" />
              <span>PAINEL ADM</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        {/* Intro Instructions Banner with ADM Shortcut */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-black shadow-sm mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded bg-[#009541] text-white border-2 border-black shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
                <span>Instruções de Uso & Votação</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-800 font-bold mt-1 leading-relaxed">
                1️⃣ Digite <strong>13 (Lula)</strong> ou <strong>22 (Flávio Rachadinha)</strong> no teclado numérico da Urna (ou clique no botão do candidato).<br />
                2️⃣ Verifique a foto e os dados no visor da Urna e pressione a tecla verde <strong className="text-[#009541] bg-green-100 px-1.5 py-0.5 rounded border border-green-600">CONFIRMA</strong> para gravar o voto.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-gray-300 pt-3 lg:pt-0">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2.5 rounded-lg border-2 border-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:translate-y-0.5"
            >
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>⚙️ ABRIR PAINEL ADM</span>
            </button>
          </div>
        </div>

        {/* Section 1: Candidate Profile Showcase Cards */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#009541]" />
              <span>Candidatos Registrados à Presidência</span>
            </h2>
            <span className="text-xs font-black text-gray-700 uppercase">
              2 CANDIDATOS
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CandidateCard
              candidate={candidatesMap['13'] || DEFAULT_CANDIDATES['13']}
              onSelectCandidate={handleSelectCandidateCard}
              isSelectedInUrna={digits === '13'}
              totalVotesForCandidate={stats.lulaVotes}
              percentageVotes={lulaPct}
              onOpenAdmin={() => setIsAdminOpen(true)}
            />

            <CandidateCard
              candidate={candidatesMap['22'] || DEFAULT_CANDIDATES['22']}
              onSelectCandidate={handleSelectCandidateCard}
              isSelectedInUrna={digits === '22'}
              totalVotesForCandidate={stats.flavioVotes}
              percentageVotes={flavioPct}
              onOpenAdmin={() => setIsAdminOpen(true)}
            />
          </div>
        </section>

        {/* Section 2: Interactive Urna Eletrônica Machine */}
        <section id="urna-machine-section" className="mb-12 scroll-mt-20">
          <div className="text-center mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-black bg-white px-3 py-1 rounded border-2 border-black inline-block shadow-xs">
              CABINE DE VOTAÇÃO
            </span>
          </div>

          <UrnaMachine
            digits={digits}
            selectedCandidate={selectedCandidate}
            isBranco={isBranco}
            isNulo={isNulo}
            isFim={isFim}
            onNumberPress={handleNumberPress}
            onBrancoPress={handleBrancoPress}
            onCorrigePress={handleCorrigePress}
            onConfirmaPress={handleConfirmaPress}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />
        </section>

        {/* Section 3: Apuração Live Dashboard */}
        <section className="mb-12">
          <TallyDashboard
            stats={stats}
            candidates={candidatesMap}
            recentVotes={votes}
            onReset={handleReset}
            onOpenBoletim={() => setIsBoletimOpen(true)}
            onSimulateBatch={handleSimulateBatch}
            onSetExact150={handleSetExact150}
            onFillTo150={handleFillTo150}
          />
        </section>

        {/* Boletim de Urna Modal */}
        <BoletimModal
          isOpen={isBoletimOpen}
          onClose={() => setIsBoletimOpen(false)}
          stats={stats}
          candidates={candidatesMap}
        />

        {/* Admin Panel Modal (Senha: 1966) */}
        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          candidatesMap={candidatesMap}
        />
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 pt-8 border-t-2 border-black text-center text-xs text-gray-800 font-bold uppercase">
        <p>
          Simulador de Urna Eletrônica da Eleição Presidencial • Justiça Eleitoral da República Federativa do Brasil
        </p>
        <p className="mt-1 text-gray-600 font-semibold text-[11px]">
          Design em Alta Densidade com teclado tátil, som característico e boletim de urna auditável.
        </p>
      </footer>
    </div>
  );
}
