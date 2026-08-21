import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Candidate } from '../types';
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
