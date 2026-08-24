import { Candidate } from '../types';
import lulaImg from '../assets/images/lula_portrait_1787153693307.jpg';
import flavioImg from '../assets/images/flavio_portrait_1787153706427.jpg';

export const CANDIDATES: Record<string, Candidate> = {
  '13': {
    id: 'lula',
    name: 'Luiz Inácio Lula da Silva',
    shortName: 'Lula',
    number: '13',
    party: 'Partido dos Trabalhadores',
    partyAcronym: 'PT',
    viceName: 'Geraldo Alckmin',
    imageUrl: lulaImg,
    color: '#CC0000',
    slogan: 'O Brasil da Esperança'
  },
  '22': {
    id: 'flavio',
    name: 'Flávio Rachadinha',
    shortName: 'Flávio Rachadinha',
    number: '22',
    party: 'Partido Liberal',
    partyAcronym: 'PL',
    viceName: 'Vorcaro Banco Master',
    imageUrl: flavioImg,
    color: '#002B7F',
    slogan: 'Pelo Futuro da Nação'
  }
};
