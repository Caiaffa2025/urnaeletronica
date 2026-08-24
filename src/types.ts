export interface Candidate {
  id: string;
  name: string;
  shortName: string;
  number: string;
  party: string;
  partyAcronym: string;
  viceName: string;
  imageUrl: string;
  color: string;
  slogan: string;
}

export type VoteType = '13' | '22' | 'BRANCO' | 'NULO';

export interface VoteRecord {
  id: string;
  type: VoteType;
  candidateName?: string;
  candidateNumber?: string;
  timestamp: Date;
}

export interface ElectionStats {
  totalVotes: number;
  lulaVotes: number;
  flavioVotes: number;
  brancoVotes: number;
  nuloVotes: number;
}

export type UrnaScreenState = 'IDLE' | 'DIGITING' | 'BRANCO' | 'CONFIRMED_FIM';

export interface VoteToastItem {
  id: string;
  type: VoteType;
  title: string;
  subtitle: string;
  candidateNumber?: string;
  imageUrl?: string;
  timestamp: Date;
  count?: number;
}
