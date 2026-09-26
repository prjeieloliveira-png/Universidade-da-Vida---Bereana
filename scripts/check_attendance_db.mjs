import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wjyuxatjtmehnxpewqfz.supabase.co',
  'sb_publishable_gj5zrQvpzhnxA5-taHmL1A_LOjfHIxk'
);

async function run() {
  const { data: people, error: pErr, count: pCount } = await supabase
    .from('people')
    .select('id, full_name, birth_date', { count: 'exact' });
  console.log('People count:', people?.length, pCount, pErr || '');

  const { data: reg, error: rErr, count: rCount } = await supabase
    .from('registrations')
    .select('id, person_id, edition_id', { count: 'exact' });
  console.log('Registrations count:', reg?.length, rCount, rErr || '');

  const { data: view, error: vErr, count: vCount } = await supabase
    .from('v_registration_payment_status')
    .select('registration_id, full_name', { count: 'exact' });
  console.log('v_registration_payment_status count:', view?.length, vCount, vErr || '');

  const { data: attSummary, error: aErr, count: aCount } = await supabase
    .from('v_attendance_summary')
    .select('id, full_name, s1, s2', { count: 'exact' });
  console.log('v_attendance_summary count:', attSummary?.length, aCount, aErr || '');
}

run().catch(console.error);
