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

