import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wjyuxatjtmehnxpewqfz.supabase.co',
  'sb_publishable_gj5zrQvpzhnxA5-taHmL1A_LOjfHIxk'
);

async function checkRegistrations() {
  // Let's test v_registration_attendance_summary
  const { data: attSummary, error: attErr } = await supabase
    .from('v_registration_attendance_summary')
    .select('*')
    .limit(5);

  console.log('v_registration_attendance_summary sample:', attSummary?.length, attErr);
  if (attSummary && attSummary.length > 0) {
    console.log('Keys of v_registration_attendance_summary:', Object.keys(attSummary[0]));
    console.log('First row:', attSummary[0]);
  }
}

checkRegistrations().catch(console.error);
