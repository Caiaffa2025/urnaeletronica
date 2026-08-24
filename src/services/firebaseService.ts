import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection,
  getDocFromServer,
  getDocs,
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Candidate, VoteRecord, VoteType } from '../types';
import { CANDIDATES as DEFAULT_CANDIDATES } from '../data/candidates';

// Initialize Firebase App and Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
}

// Connection test on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'candidates', '13'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
  }
}
testConnection();

const CANDIDATES_COLLECTION = 'candidates';
const VOTES_COLLECTION = 'votes';

/**
 * Subscribes to candidates updates in Firestore with real-time sync.
 */
export function subscribeCandidates(onUpdate: (candidatesMap: Record<string, Candidate>) => void): () => void {
  const candidatesRef = collection(db, CANDIDATES_COLLECTION);

  const unsubscribe = onSnapshot(
    candidatesRef,
    (snapshot) => {
      if (snapshot.empty) {
        // Seed default candidates if database is empty
        seedDefaultCandidates();
        onUpdate(DEFAULT_CANDIDATES);
        return;
      }

      const updatedMap: Record<string, Candidate> = { ...DEFAULT_CANDIDATES };

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const number = docSnap.id;
        updatedMap[number] = {
          id: number,
          number: number,
          name: data.name || DEFAULT_CANDIDATES[number]?.name || '',
          shortName: data.shortName || DEFAULT_CANDIDATES[number]?.shortName || '',
          party: data.party || DEFAULT_CANDIDATES[number]?.party || '',
          partyAcronym: data.partyAcronym || DEFAULT_CANDIDATES[number]?.partyAcronym || '',
          viceName: data.viceName || DEFAULT_CANDIDATES[number]?.viceName || '',
          imageUrl: data.imageUrl || DEFAULT_CANDIDATES[number]?.imageUrl || '',
          color: data.color || DEFAULT_CANDIDATES[number]?.color || '#333333',
          slogan: data.slogan || DEFAULT_CANDIDATES[number]?.slogan || '',
        };
      });

      onUpdate(updatedMap);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, CANDIDATES_COLLECTION);
      onUpdate(DEFAULT_CANDIDATES);
    }
  );

  return unsubscribe;
}

/**
 * Seed initial candidate data into Firestore
 */
async function seedDefaultCandidates() {
  try {
    for (const [number, candidate] of Object.entries(DEFAULT_CANDIDATES)) {
      await setDoc(doc(db, CANDIDATES_COLLECTION, number), {
        number: candidate.number,
        name: candidate.name,
        shortName: candidate.shortName,
        party: candidate.party,
        partyAcronym: candidate.partyAcronym,
        viceName: candidate.viceName,
        imageUrl: candidate.imageUrl,
        color: candidate.color,
        slogan: candidate.slogan,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, CANDIDATES_COLLECTION);
  }
}

/**
 * Update candidate in Firestore with new data/photo
 */
export async function updateCandidateInFirestore(candidate: Candidate): Promise<void> {
  const path = `${CANDIDATES_COLLECTION}/${candidate.number}`;
  try {
    await setDoc(
      doc(db, CANDIDATES_COLLECTION, candidate.number),
      {
        number: candidate.number,
        name: candidate.name,
        shortName: candidate.shortName,
        party: candidate.party,
        partyAcronym: candidate.partyAcronym,
        viceName: candidate.viceName,
        imageUrl: candidate.imageUrl,
        color: candidate.color,
        slogan: candidate.slogan,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Generate simulated vote records helper
 */
export function generateInitialVotes(count: number, candidates: Record<string, Candidate>): VoteRecord[] {
  const batch: VoteRecord[] = [];
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
}

/**
 * Subscribes to real-time vote updates in Firestore.
 */
export function subscribeVotes(
  onUpdate: (votes: VoteRecord[]) => void,
  candidatesMap: Record<string, Candidate>
): () => void {
  const votesRef = collection(db, VOTES_COLLECTION);

  const unsubscribe = onSnapshot(
    votesRef,
    (snapshot) => {
      if (snapshot.empty) {
        // Seed initial 150 votes to Firestore so all users start with real-time shared data
        const initialVotes = generateInitialVotes(150, candidatesMap);
        saveVotesBatchToFirestore(initialVotes).catch((err) => {
          console.warn('Could not seed initial votes to Firestore:', err);
        });
        onUpdate(initialVotes);
        return;
      }

      const votesList: VoteRecord[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let timestampDate = new Date();
        if (data.timestamp) {
          timestampDate = typeof data.timestamp === 'string' ? new Date(data.timestamp) : (data.timestamp.toDate ? data.timestamp.toDate() : new Date());
        }

        return {
          id: docSnap.id,
          type: (data.type as VoteType) || 'NULO',
          candidateName: data.candidateName || '',
          candidateNumber: data.candidateNumber || '',
          timestamp: timestampDate,
        };
      });

      // Sort by timestamp descending
      votesList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      onUpdate(votesList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, VOTES_COLLECTION);
    }
  );

  return unsubscribe;
}

/**
 * Saves a single vote to Firestore in real time.
 */
export async function saveVoteToFirestore(vote: VoteRecord): Promise<void> {
  const docRef = doc(db, VOTES_COLLECTION, vote.id);
  try {
    await setDoc(docRef, {
      type: vote.type,
      candidateName: vote.candidateName || '',
      candidateNumber: vote.candidateNumber || '',
      timestamp: vote.timestamp instanceof Date ? vote.timestamp.toISOString() : new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${VOTES_COLLECTION}/${vote.id}`);
    throw error;
  }
}

/**
 * Saves a batch of votes to Firestore in real time (chunked to fit Firestore 500 limit).
 */
export async function saveVotesBatchToFirestore(votes: VoteRecord[]): Promise<void> {
  const CHUNK_SIZE = 400;
  for (let i = 0; i < votes.length; i += CHUNK_SIZE) {
    const chunk = votes.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    
    chunk.forEach((vote) => {
      const docRef = doc(db, VOTES_COLLECTION, vote.id);
      batch.set(docRef, {
        type: vote.type,
        candidateName: vote.candidateName || '',
        candidateNumber: vote.candidateNumber || '',
        timestamp: vote.timestamp instanceof Date ? vote.timestamp.toISOString() : new Date().toISOString(),
      });
    });

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, VOTES_COLLECTION);
      throw error;
    }
  }
}

/**
 * Clears all votes from Firestore (for Zerésima reset).
 */
export async function clearAllVotesInFirestore(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, VOTES_COLLECTION));
    if (snapshot.empty) return;

    const CHUNK_SIZE = 400;
    const docs = snapshot.docs;
    
    for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
      const chunk = docs.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, VOTES_COLLECTION);
    throw error;
  }
}

/**
 * Compress an uploaded image File to a lightweight Base64 Data URL (JPEG, max 400x500)
 */
export function compressAndConvertImage(file: File, maxWidth = 400, maxHeight = 500): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export compressed JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Erro ao carregar a imagem.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

