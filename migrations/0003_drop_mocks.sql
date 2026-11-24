-- Drop the demo numbers and their seeded messages. Real numbers are added from Connect.
delete from messages
where number_id in (
  '61468001001',
  '61468001024',
  '61485022018',
  '61480033042',
  '447700900101',
  '447700900218',
  '12025550141',
  '14155550198',
  '16045550122'
);

delete from numbers
where id in (
  '61468001001',
  '61468001024',
  '61485022018',
  '61480033042',
  '447700900101',
  '447700900218',
  '12025550141',
  '14155550198',
  '16045550122'
);
