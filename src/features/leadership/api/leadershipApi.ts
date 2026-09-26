import { supabase } from '@/shared/lib/supabase';
import type { PastorRecord, G12Record, LeaderRecord } from '../types';

export interface HierarchyLeaderRow {
  id: string;
  name: string;
  role: 'PASTOR' | 'G12' | 'LEADER';
  role_label: string;
  phone?: string;
  active: boolean;
  pastor_id?: string;
  pastor_name?: string;
  g12_id?: string;
  g12_name?: string;
  pastor_category?: string;
}

export async function fetchLeadershipHierarchy(): Promise<HierarchyLeaderRow[]> {
  const { data, error } = await supabase
    .from('v_leadership_hierarchy')
    .select('id, name, role, role_label, phone, active, pastor_id, pastor_name, g12_id, g12_name, pastor_category')
    .order('name');

  if (error) {
    console.error('Erro ao buscar hierarquia de liderança:', error);
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id ?? '',
    name: row.name ?? '',
    role: (row.role ?? 'LEADER') as 'PASTOR' | 'G12' | 'LEADER',
    role_label: row.role_label ?? '',
    phone: row.phone ?? undefined,
    active: row.active ?? true,
    pastor_id: row.pastor_id ?? undefined,
    pastor_name: row.pastor_name ?? undefined,
    g12_id: row.g12_id ?? undefined,
    g12_name: row.g12_name ?? undefined,
    pastor_category: row.pastor_category ?? undefined,
  }));
}

export async function fetchPastors(): Promise<PastorRecord[]> {
  const { data, error } = await supabase
    .from('pastors')
    .select('id, name, phone, active')
    .order('name');

  if (error) throw error;
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    phone: p.phone ?? undefined,
    active: p.active,
  }));
}

export async function fetchG12Leaders(): Promise<G12Record[]> {
  const { data, error } = await supabase
    .from('g12_leaders')
    .select('id, pastor_id, name, phone, active, pastors!inner(name)')
    .order('name');

  if (error) throw error;

  interface JoinedPastor {
    name: string;
  }

  return (data ?? []).map((g) => {
    const pastorJoin = g.pastors as unknown as JoinedPastor | null;
    return {
      id: g.id,
      pastorId: g.pastor_id,
      name: g.name,
      pastorName: pastorJoin?.name ?? '',
      phone: g.phone ?? undefined,
      active: g.active,
    };
  });
}

export async function fetchCellLeaders(): Promise<LeaderRecord[]> {
  const { data, error } = await supabase
    .from('cell_leaders')
    .select('id, g12_id, name, phone, active, g12_leaders!inner(name, pastor_id, pastors!inner(name))')
    .order('name');

  if (error) throw error;

  interface JoinedG12 {
    name: string;
    pastors: { name: string } | null;
  }

  return (data ?? []).map((c) => {
    const g12Join = c.g12_leaders as unknown as JoinedG12 | null;
    return {
      id: c.id,
      g12Id: c.g12_id,
      name: c.name,
      g12Name: g12Join?.name ?? '',
      pastorName: g12Join?.pastors?.name ?? '',
      phone: c.phone ?? undefined,
      active: c.active,
    };
  });
}

export async function createPastor(name: string, phone?: string): Promise<string> {
  const { data, error } = await supabase
    .from('pastors')
    .insert({
      name: name.trim(),
      phone: phone?.trim() || null,
      category: 'geral',
      active: true,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function updatePastor(id: string, name: string, phone?: string): Promise<void> {
  const { error } = await supabase
    .from('pastors')
    .update({
      name: name.trim(),
      phone: phone?.trim() || null,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deletePastor(id: string): Promise<void> {
  const { error } = await supabase.from('pastors').delete().eq('id', id);
  if (error) throw error;
}

export async function createG12(pastorId: string, name: string, phone?: string): Promise<string> {
  const { data, error } = await supabase
    .from('g12_leaders')
    .insert({
      pastor_id: pastorId,
      name: name.trim(),
      phone: phone?.trim() || null,
      active: true,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateG12(id: string, name: string, pastorId: string, phone?: string): Promise<void> {
  const { error } = await supabase
    .from('g12_leaders')
    .update({
      name: name.trim(),
      pastor_id: pastorId,
      phone: phone?.trim() || null,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteG12(id: string): Promise<void> {
  const { error } = await supabase.from('g12_leaders').delete().eq('id', id);
  if (error) throw error;
}

export async function createCellLeader(g12Id: string, name: string, phone?: string): Promise<string> {
  const { data, error } = await supabase
    .from('cell_leaders')
    .insert({
      g12_id: g12Id,
      name: name.trim(),
      phone: phone?.trim() || null,
      active: true,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateCellLeader(id: string, name: string, g12Id: string, phone?: string): Promise<void> {
  const { error } = await supabase
    .from('cell_leaders')
    .update({
      name: name.trim(),
      g12_id: g12Id,
      phone: phone?.trim() || null,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteCellLeader(id: string): Promise<void> {
  const { error } = await supabase.from('cell_leaders').delete().eq('id', id);
  if (error) throw error;
}
