import { useState, useEffect, useCallback, useRef } from 'react';
import { useCohortStore } from '@/features/cohorts/store/cohortStore';
import { useStudentStore } from '@/features/registrations/store/studentStore';
import {
  syncBatchAttendancesToSupabase,
  type AttendancePayloadItem,
} from '../api/attendanceApi';
import type { StudentRecord } from '@/features/registrations/types';
import type { WeekNumber } from '../types';

const QUEUE_STORAGE_KEY = 'bereana_attendance_queue_v1';

export interface AttendanceQueueItem {
  id: string;
  studentId: string;
  fullName: string;
  birthDate: string;
  sessionNumber: number;
  present: boolean;
  /** Justificativa opcional, usada principalmente em faltas. */
  note?: string;
  timestamp: number;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

function loadQueue(): AttendanceQueueItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveQueue(queue: AttendanceQueueItem[]) {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('Erro ao salvar fila offline no localStorage:', err);
  }
}

export function useAttendanceSync() {
  const { getActiveCohort } = useCohortStore();
  const activeCohort = getActiveCohort();
  const editionId =
    activeCohort?.id === 'turma-01'
      ? '33333333-3333-3333-3333-333333333333'
      : activeCohort?.id || '33333333-3333-3333-3333-333333333333';
  const { toggleAttendance, setAttendance, setBulkAttendance } = useStudentStore();

  const [queue, setQueue] = useState<AttendanceQueueItem[]>(loadQueue);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return 'offline';
    return loadQueue().length > 0 ? 'offline' : 'synced';
  });
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const isFlushingRef = useRef(false);

  // Esvazia a fila offline enviando em lote para o Supabase
  const flushQueue = useCallback(async () => {
    if (isFlushingRef.current) return;
    const currentQueue = loadQueue();
    if (currentQueue.length === 0) {
      setSyncStatus('synced');
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSyncStatus('offline');
      return;
    }

    isFlushingRef.current = true;
    setSyncStatus('syncing');

    try {
      const itemsToSync: AttendancePayloadItem[] = currentQueue.map((item) => ({
        full_name: item.fullName,
        birth_date: item.birthDate,
        session_number: item.sessionNumber,
        present: item.present,
        note: item.note,
      }));

      await syncBatchAttendancesToSupabase({
        editionId,
        items: itemsToSync,
      });

      // Remove os itens processados
      saveQueue([]);
      setQueue([]);
      setSyncStatus('synced');
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Falha ao descarregar fila de presença no Supabase:', err);
      setSyncStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'error');
    } finally {
      isFlushingRef.current = false;
    }
  }, [editionId]);

  // Listener para restabelecimento de conexão online
  useEffect(() => {
    const handleOnline = () => {
      flushQueue();
    };

    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Tenta descarregar na montagem caso haja itens pendentes
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      flushQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [flushQueue]);

  // Registra presença única (com atualização otimista local + enfileiramento)
  const markAttendance = useCallback(
    (student: StudentRecord, week: WeekNumber, present: boolean, note?: string) => {
      // 1. Atualização local otimista e instantânea na UI
      setAttendance(student.id, week, present);

      // 2. Adiciona ou atualiza na fila persistida
      const currentQueue = loadQueue();
      const existingIdx = currentQueue.findIndex(
        (q) => q.fullName === student.name && q.sessionNumber === week
      );

      const newItem: AttendanceQueueItem = {
        id: `${student.id}-w${week}-${Date.now()}`,
        studentId: student.id,
        fullName: student.name,
        birthDate: student.birthDate,
        sessionNumber: week,
        present,
        note,
        timestamp: Date.now(),
      };

      let updatedQueue: AttendanceQueueItem[];
      if (existingIdx >= 0) {
        updatedQueue = [...currentQueue];
        updatedQueue[existingIdx] = newItem;
      } else {
        updatedQueue = [...currentQueue, newItem];
      }

      saveQueue(updatedQueue);
      setQueue(updatedQueue);

      // 3. Se online, tenta sincronizar imediatamente
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        flushQueue();
      } else {
        setSyncStatus('offline');
      }
    },
    [setAttendance, flushQueue]
  );

  // Toggle de presença rápida (para AttendanceStudentRow)
  const toggleStudentAttendance = useCallback(
    (student: StudentRecord, week: WeekNumber) => {
      const key = `s${week}` as keyof StudentRecord;
      const currentVal = Boolean(student[key]);
      const nextVal = !currentVal;
      toggleAttendance(student.id, week);

      const currentQueue = loadQueue();
      const existingIdx = currentQueue.findIndex(
        (q) => q.fullName === student.name && q.sessionNumber === week
      );

      const newItem: AttendanceQueueItem = {
        id: `${student.id}-w${week}-${Date.now()}`,
        studentId: student.id,
        fullName: student.name,
        birthDate: student.birthDate,
        sessionNumber: week,
        present: nextVal,
        timestamp: Date.now(),
      };

      let updatedQueue: AttendanceQueueItem[];
      if (existingIdx >= 0) {
        updatedQueue = [...currentQueue];
        updatedQueue[existingIdx] = newItem;
      } else {
        updatedQueue = [...currentQueue, newItem];
      }

      saveQueue(updatedQueue);
      setQueue(updatedQueue);

      if (typeof navigator !== 'undefined' && navigator.onLine) {
        flushQueue();
      } else {
        setSyncStatus('offline');
      }
    },
    [toggleAttendance, flushQueue]
  );

  // Marcação em lote de presença (ex: "Marcar Todos Presentes")
  const markBulkStudentsAttendance = useCallback(
    (students: StudentRecord[], week: WeekNumber, present: boolean) => {
      const ids = students.map((s) => s.id);
      setBulkAttendance(ids, week, present);

      const currentQueue = loadQueue();
      const newItems: AttendanceQueueItem[] = students.map((student) => ({
        id: `${student.id}-w${week}-${Date.now()}`,
        studentId: student.id,
        fullName: student.name,
        birthDate: student.birthDate,
        sessionNumber: week,
        present,
        timestamp: Date.now(),
      }));

      // Mescla com a fila existente substituindo duplicados
      const mergedMap = new Map<string, AttendanceQueueItem>();
      for (const item of currentQueue) {
        mergedMap.set(`${item.fullName}-w${item.sessionNumber}`, item);
      }
      for (const item of newItems) {
        mergedMap.set(`${item.fullName}-w${item.sessionNumber}`, item);
      }

      const updatedQueue = Array.from(mergedMap.values());
      saveQueue(updatedQueue);
      setQueue(updatedQueue);

      if (typeof navigator !== 'undefined' && navigator.onLine) {
        flushQueue();
      } else {
        setSyncStatus('offline');
      }
    },
    [setBulkAttendance, flushQueue]
  );

  return {
    syncStatus,
    pendingCount: queue.length,
    lastSyncTime,
    flushQueue,
    markAttendance,
    toggleStudentAttendance,
    markBulkStudentsAttendance,
  };
}
