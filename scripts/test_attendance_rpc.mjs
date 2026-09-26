import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wjyuxatjtmehnxpewqfz.supabase.co',
  'sb_publishable_gj5zrQvpzhnxA5-taHmL1A_LOjfHIxk'
);

const EDITION_ID = '33333333-3333-3333-3333-333333333333';

async function testAttendance() {
  console.log('--- Testing RLS on people and registrations ---');
  const { data: people, count: pCount, error: pErr } = await supabase
    .from('people')
    .select('id, full_name, birth_date', { count: 'exact' })
    .limit(3);
  console.log('People count:', pCount, 'sample:', people?.length, pErr);

  const { data: reg, count: rCount, error: rErr } = await supabase
    .from('registrations')
    .select('id, person_id', { count: 'exact' })
    .limit(3);
  console.log('Registrations count:', rCount, 'sample:', reg?.length, rErr);

  console.log('--- Testing record_attendance_rpc ---');
  if (people && people.length > 0) {
    const student = people[0];
    const { data: recResult, error: recErr } = await supabase.rpc('record_attendance_rpc', {
      p_edition_id: EDITION_ID,
      p_session_number: 2,
      p_full_name: student.full_name,
      p_birth_date: student.birth_date,
      p_present: true,
    });
    console.log('record_attendance_rpc result:', recResult, recErr);
  }

  console.log('--- Testing v_edition_attendance_matrix ---');
  const { data: matrix, count: mCount, error: mErr } = await supabase
    .from('v_edition_attendance_matrix')
    .select('registration_id, full_name, s1, s2, total_present', { count: 'exact' })
    .eq('edition_id', EDITION_ID)
    .limit(5);
  console.log('v_edition_attendance_matrix count:', mCount, 'sample:', matrix, mErr);
}

testAttendance().catch(console.error);
