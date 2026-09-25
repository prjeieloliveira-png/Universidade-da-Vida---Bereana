import { useState, useEffect, useCallback } from 'react';
import { unmaskPhone } from '@/shared/utils/phone';
import { searchPersonByPhone } from './useTeamMembers';

interface MatchedPerson {
  id: string;
  full_name: string;
}

export function usePersonLookup(phone: string, enabled: boolean) {
  const [matchedPerson, setMatchedPerson] = useState<MatchedPerson | null>(null);
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setMatchedPerson(null);
      return;
    }
    const digits = unmaskPhone(phone);
    if (digits.length < 10) {
      setMatchedPerson(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPhone(true);
      try {
        const found = await searchPersonByPhone(digits);
        setMatchedPerson(found ? { id: found.id, full_name: found.full_name } : null);
      } finally {
        setIsSearchingPhone(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [phone, enabled]);

  const clearMatchedPerson = useCallback(() => setMatchedPerson(null), []);

  return { matchedPerson, isSearchingPhone, clearMatchedPerson };
}
