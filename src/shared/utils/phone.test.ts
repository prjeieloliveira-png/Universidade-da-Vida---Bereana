import { describe, it, expect } from 'vitest';
import {
  unmaskPhone,
  maskPhone,
  isValidBrazilianPhone,
  formatPhone,
  getWhatsAppLink,
  getTelLink,
} from './phone';

describe('phone utilities', () => {
  describe('unmaskPhone', () => {
    it('deve extrair apenas dígitos numéricos', () => {
      expect(unmaskPhone('(11) 98765-4321')).toBe('11987654321');
      expect(unmaskPhone('11 98765 4321')).toBe('11987654321');
      expect(unmaskPhone('+55 (21) 3344-5566')).toBe('552133445566');
      expect(unmaskPhone('')).toBe('');
    });
  });

  describe('maskPhone', () => {
    it('deve formatar celular com 11 dígitos', () => {
      expect(maskPhone('11987654321')).toBe('(11) 98765-4321');
    });

    it('deve formatar telefone fixo com 10 dígitos', () => {
      expect(maskPhone('1133445566')).toBe('(11) 3344-5566');
    });

    it('deve formatar gradualmente durante digitação', () => {
      expect(maskPhone('1')).toBe('(1');
      expect(maskPhone('11')).toBe('(11');
      expect(maskPhone('119')).toBe('(11) 9');
      expect(maskPhone('119876')).toBe('(11) 9876');
      expect(maskPhone('11987654')).toBe('(11) 9876-54');
    });

    it('não deve ultrapassar 11 dígitos', () => {
      expect(maskPhone('119876543219999')).toBe('(11) 98765-4321');
    });
  });

  describe('isValidBrazilianPhone', () => {
    it('deve aprovar celulares válidos com 11 dígitos', () => {
      expect(isValidBrazilianPhone('(11) 98765-4321')).toBe(true);
      expect(isValidBrazilianPhone('21999998888')).toBe(true);
      expect(isValidBrazilianPhone('85988887777')).toBe(true);
    });

    it('deve aprovar telefones fixos válidos com 10 dígitos', () => {
      expect(isValidBrazilianPhone('(11) 3344-5566')).toBe(true);
      expect(isValidBrazilianPhone('2133221100')).toBe(true);
    });

    it('deve rejeitar telefones com quantidade incorreta de dígitos', () => {
      expect(isValidBrazilianPhone('119876')).toBe(false);
      expect(isValidBrazilianPhone('119876543210')).toBe(false);
    });

    it('deve rejeitar sequências repetidas inválidas', () => {
      expect(isValidBrazilianPhone('11111111111')).toBe(false);
      expect(isValidBrazilianPhone('00000000000')).toBe(false);
    });

    it('deve rejeitar DDDs inválidos (< 11)', () => {
      expect(isValidBrazilianPhone('01987654321')).toBe(false);
      expect(isValidBrazilianPhone('08987654321')).toBe(false);
    });

    it('deve rejeitar celular de 11 dígitos que não comece com 9', () => {
      expect(isValidBrazilianPhone('11887654321')).toBe(false);
      expect(isValidBrazilianPhone('11787654321')).toBe(false);
    });
  });

  describe('formatPhone', () => {
    it('deve formatar valor nulo ou vazio como travessão', () => {
      expect(formatPhone(null)).toBe('—');
      expect(formatPhone(undefined)).toBe('—');
      expect(formatPhone('')).toBe('—');
    });

    it('deve formatar dígitos válidos', () => {
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
    });
  });

  describe('getWhatsAppLink e getTelLink', () => {
    it('deve gerar link correto para WhatsApp', () => {
      expect(getWhatsAppLink('(11) 98765-4321')).toBe('https://wa.me/5511987654321');
      expect(getWhatsAppLink('+55 (11) 98765-4321')).toBe('https://wa.me/5511987654321');
      expect(
        getWhatsAppLink('(11) 98765-4321', 'Olá, Maria! Tudo bem?')
      ).toBe('https://wa.me/5511987654321?text=Ol%C3%A1%2C%20Maria!%20Tudo%20bem%3F');
      expect(getWhatsAppLink('')).toBeNull();
      expect(getWhatsAppLink(null)).toBeNull();
      expect(getWhatsAppLink('12345')).toBeNull();
    });

    it('deve gerar link correto para tel:', () => {
      expect(getTelLink('(11) 98765-4321')).toBe('tel:11987654321');
      expect(getTelLink('')).toBeNull();
      expect(getTelLink(null)).toBeNull();
    });
  });
});
