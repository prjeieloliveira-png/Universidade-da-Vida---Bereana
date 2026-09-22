import type { PastorRecord, G12Record, LeaderRecord } from '../types';

export const initialPastors: PastorRecord[] = [
  { id: 'pastor-1', name: 'Pra. Socorro Paiva', active: true },
  { id: 'pastor-2', name: 'Pr. Luis Gonzaga', active: true },
];

export const initialG12s: G12Record[] = [
  // Under Pra. Socorro Paiva
  { id: 'g12-1', name: 'Shirlany Sampaio', pastorId: 'pastor-1', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'g12-2', name: 'Karol Abreu', pastorId: 'pastor-1', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'g12-3', name: 'Pra. Herlene Monteiro', pastorId: 'pastor-1', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'g12-4', name: 'Bruna Alencar', pastorId: 'pastor-1', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'g12-5', name: 'Pra. Marta Mônica', pastorId: 'pastor-1', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'g12-6', name: 'Francisca Sousa', pastorId: 'pastor-1', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'g12-7', name: 'Carol Barros', pastorId: 'pastor-1', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'g12-8', name: 'Carmela Lustosa', pastorId: 'pastor-1', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'g12-9', name: 'Otacília Graziela', pastorId: 'pastor-1', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'g12-10', name: 'Francinete Pereira', pastorId: 'pastor-1', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'g12-11', name: 'Francisca Silva', pastorId: 'pastor-1', pastorName: 'Pra. Socorro Paiva', active: true },

  // Under Pr. Luis Gonzaga
  { id: 'g12-12', name: 'Pr. Jeiel Oliveira Santos', pastorId: 'pastor-2', pastorName: 'Pr. Luis Gonzaga', active: true },
  { id: 'g12-13', name: 'Apollo Tobal', pastorId: 'pastor-2', pastorName: 'Pr. Luis Gonzaga', active: true },
  { id: 'g12-14', name: 'Joab Barros', pastorId: 'pastor-2', pastorName: 'Pr. Luis Gonzaga', active: true },
  { id: 'g12-15', name: 'Walcídio Júnior', pastorId: 'pastor-2', pastorName: 'Pr. Luis Gonzaga', active: true },
  { id: 'g12-16', name: 'Raimundo Nonato', pastorId: 'pastor-2', pastorName: 'Pr. Luis Gonzaga', active: true },
  { id: 'g12-17', name: 'Jesiley Alber', pastorId: 'pastor-2', pastorName: 'Pr. Luis Gonzaga', active: true },
  { id: 'g12-18', name: 'Ademir Pereira', pastorId: 'pastor-2', pastorName: 'Pr. Luis Gonzaga', active: true },
  { id: 'g12-19', name: 'Agustinho Rodrigues', pastorId: 'pastor-2', pastorName: 'Pr. Luis Gonzaga', active: true },
];

export const initialLeaders: LeaderRecord[] = [
  // Under Pra. Socorro Paiva
  { id: 'leader-1', name: 'Shirlany', g12Id: 'g12-1', g12Name: 'Shirlany Sampaio', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-2', name: 'Gabriela Tobal', g12Id: 'g12-2', g12Name: 'Karol Abreu', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-3', name: 'Karol Abreu', g12Id: 'g12-2', g12Name: 'Karol Abreu', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-4', name: 'Jaqueline Lustosa', g12Id: 'g12-3', g12Name: 'Pra. Herlene Monteiro', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-5', name: 'Maria Teresa', g12Id: 'g12-3', g12Name: 'Pra. Herlene Monteiro', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-6', name: 'Eryckah Laila', g12Id: 'g12-4', g12Name: 'Bruna Alencar', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-7', name: 'Celina', g12Id: 'g12-5', g12Name: 'Pra. Marta Mônica', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-8', name: 'Ivone', g12Id: 'g12-5', g12Name: 'Pra. Marta Mônica', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-9', name: 'Dulce', g12Id: 'g12-5', g12Name: 'Pra. Marta Mônica', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-10', name: 'Francisca Sousa', g12Id: 'g12-6', g12Name: 'Francisca Sousa', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-11', name: 'Claudete', g12Id: 'g12-6', g12Name: 'Francisca Sousa', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-12', name: 'Vera Abreu', g12Id: 'g12-7', g12Name: 'Carol Barros', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-13', name: 'Maurina', g12Id: 'g12-7', g12Name: 'Carol Barros', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-14', name: 'Antonia Maria', g12Id: 'g12-7', g12Name: 'Carol Barros', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-15', name: 'Fernanda', g12Id: 'g12-8', g12Name: 'Carmela Lustosa', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-16', name: 'Yndira Moura', g12Id: 'g12-9', g12Name: 'Otacília Graziela', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-17', name: 'Francinete Pereira', g12Id: 'g12-10', g12Name: 'Francinete Pereira', pastorName: 'Pra. Socorro Paiva', active: true },
  { id: 'leader-18', name: 'Claudete', g12Id: 'g12-11', g12Name: 'Francisca Silva', pastorName: 'Pra. Socorro Paiva', active: true },

  // Under Pr. Luis Gonzaga
  { id: 'leader-19', name: 'Adão', g12Id: 'g12-12', g12Name: 'Pr. Jeiel Oliveira Santos', pastorName: 'Pr. Luis Gonzaga', active: true },
  { id: 'leader-20', name: 'Apollo', g12Id: 'g12-13', g12Name: 'Apollo Tobal', pastorName: 'Pr. Luis Gonzaga', active: true },
  { id: 'leader-21', name: 'Kelson', g12Id: 'g12-13', g12Name: 'Apollo Tobal', pastorName: 'Pr. Luis Gonzaga', active: true },
  { id: 'leader-22', name: 'Joab Barros', g12Id: 'g12-14', g12Name: 'Joab Barros', pastorName: 'Pr. Luis Gonzaga', active: true },
  { id: 'leader-23', name: 'Leonardo', g12Id: 'g12-15', g12Name: 'Walcídio Júnior', pastorName: 'Pr. Luis Gonzaga', active: true },
  { id: 'leader-24', name: 'Raimundo Nonato', g12Id: 'g12-16', g12Name: 'Raimundo Nonato', pastorName: 'Pr. Luis Gonzaga', active: true },
  { id: 'leader-25', name: 'Júnior Amaro', g12Id: 'g12-17', g12Name: 'Jesiley Alber', pastorName: 'Pr. Luis Gonzaga', active: true },
  { id: 'leader-26', name: 'Elias', g12Id: 'g12-17', g12Name: 'Jesiley Alber', pastorName: 'Pr. Luis Gonzaga', active: true },
  { id: 'leader-27', name: 'Ademir Pereira', g12Id: 'g12-18', g12Name: 'Ademir Pereira', pastorName: 'Pr. Luis Gonzaga', active: true },
  { id: 'leader-28', name: 'Agustinho Rodrigues', g12Id: 'g12-19', g12Name: 'Agustinho Rodrigues', pastorName: 'Pr. Luis Gonzaga', active: true },
];
