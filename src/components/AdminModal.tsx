import React, { useState, useEffect } from 'react';
import { Candidate } from '../types';
import { updateCandidateInFirestore, compressAndConvertImage } from '../services/firebaseService';
import { ShieldCheck, Lock, Key, X, Upload, Save, Check, Loader2, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { CANDIDATES as DEFAULT_CANDIDATES } from '../data/candidates';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidatesMap: Record<string, Candidate>;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  candidatesMap,
}) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Form state for candidates
  const [candidatesData, setCandidatesData] = useState<Record<string, Candidate>>(candidatesMap);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingNumber, setUploadingNumber] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state when candidatesMap or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setCandidatesData({ ...candidatesMap });
    }
  }, [isOpen, candidatesMap]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1966') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Senha incorreta! Digite a senha administrativa 1966.');
    }
  };

  const handleFieldChange = (number: string, field: keyof Candidate, value: string) => {
    setCandidatesData((prev) => ({
      ...prev,
      [number]: {
        ...prev[number],
        [field]: value,
      },
    }));
  };

  const handleImageFileUpload = async (number: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingNumber(number);
    setErrorMessage('');
    try {
      const compressedDataUrl = await compressAndConvertImage(file);
      handleFieldChange(number, 'imageUrl', compressedDataUrl);
    } catch (err) {
      setErrorMessage('Erro ao carregar e comprimir a imagem. Tente outro arquivo.');
    } finally {
      setUploadingNumber(null);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      for (const candidate of Object.values(candidatesData) as Candidate[]) {
        await updateCandidateInFirestore(candidate);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMessage('Erro ao salvar dados no Firestore. Verifique sua conexão.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreDefaults = async () => {
    if (window.confirm('Deseja restaurar as imagens e informações originais dos dois candidatos?')) {
      setIsSaving(true);
      try {
        for (const candidate of Object.values(DEFAULT_CANDIDATES) as Candidate[]) {
          await updateCandidateInFirestore(candidate);
        }
        setCandidatesData({ ...DEFAULT_CANDIDATES });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch {
        setErrorMessage('Erro ao restaurar padrões.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="bg-[#eee] text-[#1a1a1a] border-4 border-black w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#1a1a1a] text-white p-4 border-b-4 border-[#009541] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#009541] rounded border border-yellow-400 text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                PAINEL ADMINISTRATIVO (ADM)
                <span className="text-[10px] bg-yellow-400 text-black font-black px-2 py-0.5 rounded uppercase">
                  SENHA: 1966
                </span>
              </h2>
              <p className="text-xs text-gray-300 font-bold uppercase tracking-wide">
                Gestão de Imagens e Dados da Urna Eletrônica
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-white transition-colors cursor-pointer border border-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          /* Password Authentication Screen */
          <form onSubmit={handleLogin} className="p-8 flex flex-col items-center justify-center text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-black/10 border-2 border-black flex items-center justify-center text-black">
              <Lock className="w-8 h-8 text-[#009541]" />
            </div>

            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-black">ACESSO RESTRITO ADM</h3>
              <p className="text-xs font-bold text-gray-700 uppercase mt-1">
                Insira a senha de administrador (1966) para liberar a edição das imagens e dados.
              </p>
            </div>

            {authError && (
              <div className="w-full max-w-sm bg-red-100 border-2 border-red-600 text-red-800 p-3 rounded font-black text-xs uppercase">
                {authError}
              </div>
            )}

            <div className="w-full max-w-sm space-y-2">
              <div className="relative">
                <Key className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="DIGITE A SENHA 1966"
                  required
                  autoFocus
                  className="w-full bg-white border-2 border-black pl-10 pr-4 py-3 rounded text-center font-black tracking-widest text-lg uppercase focus:ring-2 focus:ring-black outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#009541] hover:bg-green-700 text-white font-black text-sm uppercase tracking-wider py-3 px-6 rounded border-2 border-black shadow-md cursor-pointer transition-all active:translate-y-0.5"
              >
                ENTRAR NO PAINEL ADM
              </button>
            </div>
          </form>
        ) : (
          /* Logged In Admin Dashboard */
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {errorMessage && (
              <div className="bg-red-100 border-2 border-red-600 text-red-800 p-3 rounded font-black text-xs uppercase">
                {errorMessage}
              </div>
            )}

            {saveSuccess && (
              <div className="bg-emerald-100 border-2 border-emerald-600 text-emerald-800 p-3 rounded font-black text-xs uppercase flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-700" />
                  <span>IMAGENS E DADOS SALVOS COM SUCESSO NO BANCO DE DADOS FIRESTORE!</span>
                </div>
              </div>
            )}

            {/* Candidate List Editor */}
            <div className="space-y-6">
              {['13', '22'].map((number) => {
                const candidate = candidatesData[number] || DEFAULT_CANDIDATES[number];
                const isUploadingThis = uploadingNumber === number;

                return (
                  <div
                    key={number}
                    className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row border-l-8"
                    style={{ borderLeftColor: candidate.color }}
                  >
                    {/* Left: Image Editor */}
                    <div className="p-4 bg-gray-50 border-r-0 md:border-r-2 border-b-2 md:border-b-0 border-black flex flex-col items-center justify-center shrink-0 w-full md:w-56 text-center space-y-3">
                      <div className="relative w-32 h-40 rounded border-2 border-black overflow-hidden bg-gray-200 shadow-inner">
                        {candidate.imageUrl ? (
                          <img
                            src={candidate.imageUrl}
                            alt={candidate.name}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}

                        {isUploadingThis && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                        )}
                        
                        <div
                          className="absolute bottom-1 left-1 px-2 py-0.5 rounded text-white font-black text-[10px] shadow"
                          style={{ backgroundColor: candidate.color }}
                        >
                          Nº {candidate.number}
                        </div>
                      </div>

                      <label className="w-full bg-[#222] hover:bg-black text-white text-[11px] font-black uppercase py-2 px-3 rounded border-2 border-black cursor-pointer transition-all flex items-center justify-center gap-1.5 active:translate-y-0.5 shadow-xs">
                        <Upload className="w-3.5 h-3.5 text-amber-300" />
                        <span>{isUploadingThis ? 'ENVIANDO...' : 'FAZER UPLOAD DE FOTO'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileUpload(number, e)}
                          className="hidden"
                          disabled={isSaving || isUploadingThis}
                        />
                      </label>
                    </div>

                    {/* Right: Text Information Fields */}
                    <div className="p-4 flex-1 space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-gray-500">
                          CANDIDATO Nº {number} ({candidate.shortName})
                        </span>
                        <span
                          className="text-xs font-black text-white px-2.5 py-0.5 rounded uppercase"
                          style={{ backgroundColor: candidate.color }}
                        >
                          {candidate.partyAcronym}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-700 mb-1">
                            NOME CANDIDATO
                          </label>
                          <input
                            type="text"
                            value={candidate.name}
                            onChange={(e) => handleFieldChange(number, 'name', e.target.value)}
                            className="w-full bg-gray-50 border-2 border-black p-2 rounded text-xs font-bold uppercase"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-700 mb-1">
                            NOME DO VICE
                          </label>
                          <input
                            type="text"
                            value={candidate.viceName}
                            onChange={(e) => handleFieldChange(number, 'viceName', e.target.value)}
                            className="w-full bg-gray-50 border-2 border-black p-2 rounded text-xs font-bold uppercase"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-black uppercase text-gray-700 mb-1">
                            PARTIDO
                          </label>
                          <input
                            type="text"
                            value={candidate.party}
                            onChange={(e) => handleFieldChange(number, 'party', e.target.value)}
                            className="w-full bg-gray-50 border-2 border-black p-2 rounded text-xs font-bold uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-700 mb-1">
                            SIGLA
                          </label>
                          <input
                            type="text"
                            value={candidate.partyAcronym}
                            onChange={(e) => handleFieldChange(number, 'partyAcronym', e.target.value)}
                            className="w-full bg-gray-50 border-2 border-black p-2 rounded text-xs font-bold uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-700 mb-1">
                          URL DIRETA DA IMAGEM (OPCIONAL)
                        </label>
                        <input
                          type="text"
                          value={candidate.imageUrl}
                          onChange={(e) => handleFieldChange(number, 'imageUrl', e.target.value)}
                          placeholder="https://exemplo.com/foto.jpg ou Base64"
                          className="w-full bg-gray-50 border-2 border-black p-2 rounded text-[11px] font-mono text-gray-800"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Global Action Buttons */}
            <div className="pt-4 border-t-2 border-gray-300 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRestoreDefaults}
                disabled={isSaving}
                className="px-4 py-2.5 bg-gray-300 hover:bg-gray-400 text-black border-2 border-black rounded text-xs font-black uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESTAURAR ORIGINAL</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving || !!uploadingNumber}
                className="px-6 py-3 bg-[#009541] hover:bg-green-700 text-white border-2 border-black rounded text-xs font-black uppercase tracking-wider cursor-pointer shadow-md flex items-center gap-2 active:translate-y-0.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SALVANDO NO BANCO...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>SALVAR IMAGENS E DADOS SALVOS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
