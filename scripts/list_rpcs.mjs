import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wjyuxatjtmehnxpewqfz.supabase.co',
  'sb_publishable_gj5zrQvpzhnxA5-taHmL1A_LOjfHIxk'
);

async function testRpc() {
  // Test calling sync_students_batch with empty array
  const { data: res1, error: err1 } = await supabase.rpc('sync_students_batch', {
    p_edition_id: '33333333-3333-3333-3333-333333333333',
    p_students: []
  });
  console.log('sync_students_batch:', res1, err1);

  // Test calling mark_attendance_batch with empty array
  const { data: res2, error: err2 } = await supabase.rpc('mark_attendance_batch', {
    p_records: []
  });
  console.log('mark_attendance_batch:', res2, err2);
}

testRpc().catch(console.error);
