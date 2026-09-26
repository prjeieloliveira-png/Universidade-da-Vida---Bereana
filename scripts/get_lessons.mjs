import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wjyuxatjtmehnxpewqfz.supabase.co',
  'sb_publishable_gj5zrQvpzhnxA5-taHmL1A_LOjfHIxk'
);

async function checkLessons() {
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('id, session_number, title, edition_id')
    .eq('edition_id', '33333333-3333-3333-3333-333333333333')
    .order('session_number');

  console.log('Lessons count:', lessons?.length, error);
  console.log(JSON.stringify(lessons, null, 2));
}

checkLessons().catch(console.error);
