import React, { useState } from 'react';
import { Candidate } from '../types';
import { updateCandidateInFirestore, compressAndConvertImage } from '../services/firebaseService';
import { X, Upload, Save, Image as ImageIcon, Loader2, Check } from 'lucide-react';

interface EditCandidateModalProps {
  candidate: Candidate;
  isOpen: boolean;
  onClose: () => void;
}

export const EditCandidateModal: React.FC<EditCandidateModalProps> = ({
  candidate,
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState(candidate.name);
  const [viceName, setViceName] = useState(candidate.viceName);
  const [party, setParty] = useState(candidate.party);
  const [partyAcronym, setPartyAcronym] = useState(candidate.partyAcronym);
  const [slogan, setSlogan] = useState(candidate.slogan);
  const [imageUrl, setImageUrl] = useState(candidate.imageUrl);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage('');
    try {
      const compressedDataUrl = await compressAndConvertImage(file);
      setImageUrl(compressedDataUrl);
    } catch (err) {
      setErrorMessage('Erro ao processar imagem. Tente uma foto menor ou em formato JPG/PNG.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      const updatedCandidate: Candidate = {
        ...candidate,
        name: name.trim(),
        viceName: viceName.trim(),
        party: party.trim(),
        partyAcronym: partyAcronym.trim(),
        slogan: slogan.trim(),
        imageUrl: imageUrl.trim(),
      };

      await updateCandidateInFirestore(updatedCandidate);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMessage('Erro ao salvar candidato no banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="bg-[#eee] text-[#1a1a1a] border-4 border-black w-full max-w-lg rounded-xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
        {/* Header */}
        <div 
          className="p-4 flex items-center justify-between text-white border-b-2 border-black"
          style={{ backgroundColor: candidate.color }}
        >
          <div className="flex items-center gap-3">
            <span className="bg-black/40 px-3 py-1 rounded text-lg font-black tracking-wider border border-white/30">
              {candidate.number}
            </span>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider">EDITAR CANDIDATO</h2>
              <p className="text-xs font-bold text-white/90 uppercase">{candidate.shortName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-black/30 hover:bg-black/60 text-white transition-colors cursor-pointer border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="bg-red-100 border-2 border-red-600 text-red-800 p-3 rounded font-bold text-xs uppercase">
              {errorMessage}
            </div>
          )}

          {saveSuccess && (
            <div className="bg-emerald-100 border-2 border-emerald-600 text-emerald-800 p-3 rounded font-bold text-xs uppercase flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-700" />
              <span>Salvo com sucesso no banco de dados!</span>
            </div>
          )}

          {/* Photo Preview & File Upload */}
          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1">
              FOTO DO CANDIDATO (UPLOAD / BANCO DE DADOS)
            </label>
            <div className="flex gap-4 items-center bg-white p-3 border-2 border-black rounded-lg">
              <div className="w-20 h-24 shrink-0 rounded overflow-hidden border-2 border-black bg-gray-200 relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <label className="inline-flex items-center gap-2 bg-[#222] hover:bg-black text-white px-4 py-2.5 rounded text-xs font-black uppercase tracking-wider cursor-pointer border-2 border-black transition-all shadow-sm active:translate-y-0.5">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>{isUploading ? 'PROCESSANDO...' : 'CARREGAR NOVA IMAGEM'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                    disabled={isUploading || isSaving}
                  />
                </label>
                <p className="text-[10px] text-gray-600 font-bold uppercase">
                  Suporta arquivos JPG, PNG ou WEBP. A imagem é otimizada e salva no Firestore.
                </p>
              </div>
            </div>
          </div>

          {/* Candidate Name */}
          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1">
              NOME COMPLETO DO CANDIDATO
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-white border-2 border-black p-2.5 rounded font-bold text-sm uppercase text-black focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Vice Candidate Name */}
          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1">
              NOME DO VICE-PRESIDENTE
            </label>
            <input
              type="text"
              value={viceName}
              onChange={(e) => setViceName(e.target.value)}
              required
              className="w-full bg-white border-2 border-black p-2.5 rounded font-bold text-sm uppercase text-black focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Party & Acronym */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                NOME DO PARTIDO / COLIGAÇÃO
              </label>
              <input
                type="text"
                value={party}
                onChange={(e) => setParty(e.target.value)}
                required
                className="w-full bg-white border-2 border-black p-2.5 rounded font-bold text-sm uppercase text-black focus:ring-2 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                SIGLA
              </label>
              <input
                type="text"
                value={partyAcronym}
                onChange={(e) => setPartyAcronym(e.target.value)}
                required
                className="w-full bg-white border-2 border-black p-2.5 rounded font-bold text-sm uppercase text-black focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          {/* Slogan */}
          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1">
              SLOGAN DA CAMPANHA
            </label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="w-full bg-white border-2 border-black p-2.5 rounded font-bold text-sm uppercase text-black focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t-2 border-gray-300 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-300 hover:bg-gray-400 text-black border-2 border-black rounded text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-black rounded text-xs font-black uppercase tracking-wider cursor-pointer shadow-md flex items-center gap-2 active:translate-y-0.5 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>SALVANDO...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>SALVAR NO BANCO</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
