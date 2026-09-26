import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  'https://wjyuxatjtmehnxpewqfz.supabase.co',
  'sb_publishable_gj5zrQvpzhnxA5-taHmL1A_LOjfHIxk'
);

const EDITION_ID = '33333333-3333-3333-3333-333333333333';

async function backfill() {
  const content = fs.readFileSync('src/features/registrations/data/mockStudents.ts', 'utf8');
  const lines = content.split('\n');
  const students = [];
  let current = {};

  for (const line of lines) {
    const numM = line.match(/num:\s*(\d+)/);
    if (numM) {
      if (current.num) students.push(current);
      current = { num: parseInt(numM[1]) };
    }
    const nameM = line.match(/name:\s*'([^']+)'/);
    if (nameM) current.name = nameM[1];
    const bdateM = line.match(/birthDate:\s*'([^']+)'/);
    if (bdateM) current.birthDate = bdateM[1];
    const s1M = line.match(/s1:\s*(true|false)/);
    if (s1M) current.s1 = s1M[1] === 'true';
    const s2M = line.match(/s2:\s*(true|false)/);
    if (s2M) current.s2 = s2M[1] === 'true';
    const s3M = line.match(/s3:\s*(true|false)/);
    if (s3M) current.s3 = s3M[1] === 'true';
    const s4M = line.match(/s4:\s*(true|false)/);
    if (s4M) current.s4 = s4M[1] === 'true';
  }
  if (current.num) students.push(current);

  console.log(`Parsed ${students.length} students from mockStudents.ts`);

  // Build attendance items for weeks 1..4 (and false for 5..9 if desired, or only records that have been attended)
  const attendanceItems = [];
  for (const s of students) {
    for (let w = 1; w <= 9; w++) {
      const key = `s${w}`;
      const isPresent = Boolean(s[key]);
      // We only insert attendances where attendance was explicitly recorded (e.g. s1..s4)
      if (w <= 4) {
        attendanceItems.push({
          full_name: s.name,
          birth_date: s.birthDate,
          session_number: w,
          present: isPresent,
        });
      }
    }
  }

  console.log(`Prepared ${attendanceItems.length} attendance records to sync.`);

  // Chunk in batches of 50
  const chunkSize = 50;
  let totalSynced = 0;
  for (let i = 0; i < attendanceItems.length; i += chunkSize) {
    const chunk = attendanceItems.slice(i, i + chunkSize);
    const { data, error } = await supabase.rpc('sync_attendances_rpc', {
      p_edition_id: EDITION_ID,
      p_items: chunk,
    });
    if (error) {
      console.error('Batch error at index', i, error);
    } else {
      totalSynced += data.synced || 0;
      console.log(`Chunk ${i / chunkSize + 1}: synced ${data.synced}, skipped ${data.skipped}`);
    }
  }

  console.log(`Finished! Total synced attendance records: ${totalSynced}`);

  // Query sample matrix
  const { data: matrix } = await supabase
    .from('v_edition_attendance_matrix')
    .select('full_name, s1, s2, s3, s4, total_present')
    .eq('edition_id', EDITION_ID)
    .gt('total_present', 0)
    .limit(5);

  console.log('Sample students with presences in Supabase:', matrix);
}

backfill().catch(console.error);
