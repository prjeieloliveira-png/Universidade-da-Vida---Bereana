export interface StudentRecord {
  id: string;
  cohortId?: string;
  personId: string;
  num: number;
  name: string;
  gender: 'Feminino' | 'Masculino';
  birthDate: string;
  age: number;
  maritalStatus: string;
  phone: string;
  address: string;
  shirtSize: string;
  pastor: string;
  g12: string;
  leader: string;
  status: 'Pago' | 'Pendente';
  paymentMethod: 'PIX' | 'CARTÃO' | 'DINHEIRO' | '—';
  amountCents: number;
  comorbidity: string;
  medSchedule: string;
  photoUrl?: string;
  s1: boolean;
  s2: boolean;
  s3: boolean;
  s4: boolean;
  s5: boolean;
  s6: boolean;
  s7: boolean;
  s8: boolean;
  s9: boolean;
}

export interface RegistrationFilterState {
  searchQuery: string;
  status: 'ALL' | 'Pago' | 'Pendente';
  paymentMethod: string;
  gender: string;
  ageRange: 'ALL' | 'under18' | '18-29' | '30-49' | '50+';
  maritalStatus: string;
  shirtSize: string;
  comorbidity: 'ALL' | 'SIM' | 'NAO';
  pastor: string;
  g12: string;
  leader: string;
}

export const initialRegistrationFilterState: RegistrationFilterState = {
  searchQuery: '',
  status: 'ALL',
  paymentMethod: 'ALL',
  gender: 'ALL',
  ageRange: 'ALL',
  maritalStatus: 'ALL',
  shirtSize: 'ALL',
  comorbidity: 'ALL',
  pastor: 'ALL',
  g12: 'ALL',
  leader: 'ALL',
};

