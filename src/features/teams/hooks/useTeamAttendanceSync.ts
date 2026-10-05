import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/shared/lib/supabase';
import type { SyncStatus } from '@/features/attendance/hooks/useAttendanceSync';

const QUEUE_STORAGE_KEY = 'bereana_team_attendance_queue_v1';

export interface TeamAttendanceQueueItem {
  meetingId: string;
  memberId: string;
  present: boolean;
  note?: string;
  timestamp: number;
}

function loadQueue(): TeamAttendanceQueueItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TeamAttendanceQueueItem[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: TeamAttendanceQueueItem[]) {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('Erro ao salvar fila offline da equipe no localStorage:', err);
  }
}

/** Marcações da equipe ainda não sincronizadas, por `memberId` (apenas desta reunião). */
export function readPendingTeamAttendance(meetingId: string): Map<string, TeamAttendanceQueueItem> {
  const map = new Map<string, TeamAttendanceQueueItem>();
  loadQueue()
    .filter((q) => q.meetingId === meetingId)
    .forEach((q) => map.set(q.memberId, q));
  return map;
}

/**
 * Fila offline da chamada da equipe (mesmo modelo da chamada dos alunos):
 * grava local primeiro, envia em lote assim que houver conexão.
 */
export function useTeamAttendanceSync(onSynced?: () => void) {
  const [queue, setQueue] = useState<TeamAttendanceQueueItem[]>(loadQueue);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return 'offline';
    return loadQueue().length > 0 ? 'offline' : 'synced';
  });
  const isFlushingRef = useRef(false);
  const onSyncedRef = useRef(onSynced);
  onSyncedRef.current = onSynced;

  const flushQueue = useCallback(async () => {
    if (isFlushingRef.current) return;
    const current = loadQueue();
    if (current.length === 0) {
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
      const byMeeting = new Map<string, TeamAttendanceQueueItem[]>();
      current.forEach((item) => {
        byMeeting.set(item.meetingId, [...(byMeeting.get(item.meetingId) ?? []), item]);
      });

      for (const [meetingId, items] of byMeeting) {
        const { error } = await supabase.rpc('sync_team_attendances_rpc', {
          p_meeting_id: meetingId,
          p_items: items.map((i) => ({
            team_member_id: i.memberId,
            present: i.present,
            note: i.note ?? null,
          })),
        });
        if (error) throw error;
      }

      // Remove só o que foi enviado; marcações feitas durante o envio ficam na fila
      const sent = new Set(current.map((i) => `${i.meetingId}:${i.memberId}:${i.timestamp}`));
      const remaining = loadQueue().filter(
        (i) => !sent.has(`${i.meetingId}:${i.memberId}:${i.timestamp}`)
      );
      saveQueue(remaining);
      setQueue(remaining);
      setSyncStatus(remaining.length > 0 ? 'offline' : 'synced');
      onSyncedRef.current?.();
    } catch (err) {
      console.warn('Falha ao sincronizar chamada da equipe:', err);
      setSyncStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'error');
    } finally {
      isFlushingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => void flushQueue();
    const handleOffline = () => setSyncStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (typeof navigator !== 'undefined' && navigator.onLine) void flushQueue();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [flushQueue]);

  const markAttendance = useCallback(
    (meetingId: string, memberId: string, present: boolean, note?: string) => {
      const next = loadQueue().filter(
        (q) => !(q.meetingId === meetingId && q.memberId === memberId)
      );
      next.push({ meetingId, memberId, present, note, timestamp: Date.now() });
      saveQueue(next);
      setQueue(next);

      if (typeof navigator !== 'undefined' && navigator.onLine) void flushQueue();
      else setSyncStatus('offline');
    },
    [flushQueue]
  );

  return { syncStatus, pendingCount: queue.length, flushQueue, markAttendance };
}
