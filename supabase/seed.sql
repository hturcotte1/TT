-- TT seed data. Runs after supabase/migrations/20260811000001_init.sql on a fresh reset.
-- All timestamps are relative to now() so the app always looks freshly used.
-- Fixed literal UUIDs are used for every row referenced elsewhere in this file.

-- ---------------------------------------------------------------------------
-- 1. Users (ids must match src/lib/constants.ts FOUNDERS)
-- ---------------------------------------------------------------------------
insert into users (id, email, name, avatar_url) values
  ('11111111-1111-4111-8111-111111111111', 'henrylachtur@gmail.com', 'Henry', null),
  ('22222222-2222-4222-8222-222222222222', 'marcotrotta909@gmail.com', 'Marco', null);

-- ---------------------------------------------------------------------------
-- 2. Projects
-- ---------------------------------------------------------------------------
insert into projects (id, name, description, status, created_at) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'helios',  'Agentic irrigation copilot for specialty-crop farms.',                'active', now() - interval '28 days'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'hnn',     'Helios News Network: automated agtech news crawler and daily brief.', 'active', now() - interval '21 days'),
  ('aaaaaaaa-0000-4000-8000-000000000003', 'establo', 'Back-office copilot for boutique hotels and restaurants.',            'active', now() - interval '12 days');

-- ---------------------------------------------------------------------------
-- 3. Channels (one per project, same day as the project, plus #general)
-- ---------------------------------------------------------------------------
insert into channels (id, name, project_id, created_at) values
  ('bbbbbbbb-0000-4000-8000-000000000001', 'helios',  'aaaaaaaa-0000-4000-8000-000000000001', now() - interval '28 days'),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'hnn',     'aaaaaaaa-0000-4000-8000-000000000002', now() - interval '21 days'),
  ('bbbbbbbb-0000-4000-8000-000000000003', 'establo', 'aaaaaaaa-0000-4000-8000-000000000003', now() - interval '12 days'),
  ('bbbbbbbb-0000-4000-8000-000000000004', 'general', null,                                   now() - interval '30 days');

-- ---------------------------------------------------------------------------
-- 4. Messages (30, last 7 days, varied hours, most recent only minutes old)
--    Note: recent messages in #general are Marco-only and recent messages in
--    #helios are Henry-only so the channel_reads below produce clean unread
--    counts (sending a message advances the sender's own read marker).
-- ---------------------------------------------------------------------------
insert into messages (id, channel_id, user_id, body, created_at) values
  -- #general: incorporation, banking, admin
  ('cccccccc-0000-4000-8000-000000000001', 'bbbbbbbb-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'Delaware C-corp paperwork is with Clerky now. EIN should land by Friday.',                              now() - interval '6 days 4 hours'),
  ('cccccccc-0000-4000-8000-000000000002', 'bbbbbbbb-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', 'Nice. Once the EIN lands I will start the Mercury application.',                                        now() - interval '6 days 3 hours'),
  ('cccccccc-0000-4000-8000-000000000003', 'bbbbbbbb-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'Reminder: 50/50 split, standard 4y/1y vesting. Confirming before I sign.',                              now() - interval '4 days 6 hours'),
  ('cccccccc-0000-4000-8000-000000000004', 'bbbbbbbb-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', 'Confirmed. Sign it.',                                                                                   now() - interval '4 days 5 hours 40 minutes'),
  ('cccccccc-0000-4000-8000-000000000005', 'bbbbbbbb-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', 'Mercury approved. Wiring 5k from each of us as agreed?',                                                now() - interval '20 hours'),
  ('cccccccc-0000-4000-8000-000000000006', 'bbbbbbbb-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', 'Also booked us the Thursday demo slot at the AgTech meetup.',                                           now() - interval '5 hours'),
  ('cccccccc-0000-4000-8000-000000000007', 'bbbbbbbb-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', 'Henry, Clerky says one signature is still missing. Check your inbox.',                                  now() - interval '22 minutes'),
  -- #helios: irrigation hardware, Fresno pilot, model costs
  ('cccccccc-0000-4000-8000-000000000008', 'bbbbbbbb-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Flow sensor v2 boards arrived. Soldering the first three tonight.',                                     now() - interval '6 days 8 hours'),
  ('cccccccc-0000-4000-8000-000000000009', 'bbbbbbbb-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'How is the LoRa range holding up in the orchard rows?',                                                 now() - interval '6 days 7 hours 30 minutes'),
  ('cccccccc-0000-4000-8000-000000000010', 'bbbbbbbb-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', '900m line of sight, about 400m through canopy. Good enough for the Fresno pilot.',                      now() - interval '6 days 7 hours'),
  ('cccccccc-0000-4000-8000-000000000011', 'bbbbbbbb-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Ramirez Farms wants a fixed monthly price. Thinking 350/mo per block?',                                 now() - interval '5 days 3 hours'),
  ('cccccccc-0000-4000-8000-000000000012', 'bbbbbbbb-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Works if we keep model spend under ~40/mo per block. Sonnet for planning, haiku for sensor summaries.', now() - interval '5 days 2 hours 30 minutes'),
  ('cccccccc-0000-4000-8000-000000000013', 'bbbbbbbb-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Pushed the valve scheduling prompt rework. Token usage per plan is down ~30%.',                         now() - interval '4 days 1 hour'),
  ('cccccccc-0000-4000-8000-000000000014', 'bbbbbbbb-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Nice. Cost dashboard says we are at ~1.10/day for the whole pilot block.',                              now() - interval '3 days 6 hours'),
  ('cccccccc-0000-4000-8000-000000000015', 'bbbbbbbb-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Solenoid on valve 3 keeps sticking at low pressure. Ordered the Hunter replacements.',                  now() - interval '2 days 4 hours'),
  ('cccccccc-0000-4000-8000-000000000016', 'bbbbbbbb-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Ramirez walk-through went well. Their agronomist wants soil moisture graphs in the weekly email.',       now() - interval '1 day 7 hours'),
  ('cccccccc-0000-4000-8000-000000000017', 'bbbbbbbb-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Swapped valve 3 and ran a full irrigation cycle overnight. Zero faults.',                               now() - interval '3 hours 20 minutes'),
  ('cccccccc-0000-4000-8000-000000000018', 'bbbbbbbb-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Drafting the pilot agreement now, will drop it in the drive for your review.',                          now() - interval '41 minutes'),
  -- #hnn: news crawler, ranking, daily brief
  ('cccccccc-0000-4000-8000-000000000019', 'bbbbbbbb-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'Crawler now covers 42 feeds. Dedupe is still letting syndicated copies through.',                       now() - interval '6 days 2 hours'),
  ('cccccccc-0000-4000-8000-000000000020', 'bbbbbbbb-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'Hash the first three paragraphs instead of the headline. Should catch most of them.',                   now() - interval '6 days 1 hour 30 minutes'),
  ('cccccccc-0000-4000-8000-000000000021', 'bbbbbbbb-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'That fixed it. Daily brief is down to ~28 stories from 60.',                                            now() - interval '5 days 5 hours'),
  ('cccccccc-0000-4000-8000-000000000022', 'bbbbbbbb-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'Haiku is fine for the summaries. Keep sonnet just for the ranking pass.',                               now() - interval '3 days 8 hours'),
  ('cccccccc-0000-4000-8000-000000000023', 'bbbbbbbb-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'Switched. Cost per brief dropped from 0.84 to 0.31.',                                                   now() - interval '2 days 6 hours'),
  ('cccccccc-0000-4000-8000-000000000024', 'bbbbbbbb-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'Beta list is at 19 subscribers. Two replied asking for a water-policy section.',                        now() - interval '1 day 4 hours'),
  ('cccccccc-0000-4000-8000-000000000025', 'bbbbbbbb-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'Water-policy section shipped behind a flag. Check today''s brief.',                                     now() - interval '6 hours 30 minutes'),
  ('cccccccc-0000-4000-8000-000000000026', 'bbbbbbbb-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'Read it. Ranking put the Colorado River story first, exactly right.',                                   now() - interval '1 hour 10 minutes'),
  -- #establo: hospitality demos, pilot customers
  ('cccccccc-0000-4000-8000-000000000027', 'bbbbbbbb-0000-4000-8000-000000000003', '22222222-2222-4222-8222-222222222222', 'Trattoria Nonna demo went well. Chef wants the supplier order sheet to auto-fill from last week.',       now() - interval '5 days 7 hours'),
  ('cccccccc-0000-4000-8000-000000000028', 'bbbbbbbb-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'Easy. I will reuse the helios forecast code for the produce quantities.',                               now() - interval '5 days 6 hours 30 minutes'),
  ('cccccccc-0000-4000-8000-000000000029', 'bbbbbbbb-0000-4000-8000-000000000003', '22222222-2222-4222-8222-222222222222', 'Hotel Bellavista asked for a September start. That would be paying customer #1.',                        now() - interval '2 days 3 hours'),
  ('cccccccc-0000-4000-8000-000000000030', 'bbbbbbbb-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'Let us not sign hospitality contracts before incorporation closes. Tie it to the Clerky timeline.',     now() - interval '2 days 2 hours 30 minutes');

-- ---------------------------------------------------------------------------
-- 5. Channel reads
--    Henry: unread in #general only (3 Marco messages newer than 1 day).
--    Marco: unread in #helios only (4 Henry messages newer than 3 days).
-- ---------------------------------------------------------------------------
insert into channel_reads (channel_id, user_id, last_read_at) values
  ('bbbbbbbb-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', now()),
  ('bbbbbbbb-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', now()),
  ('bbbbbbbb-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', now()),
  ('bbbbbbbb-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', now() - interval '1 day'),
  ('bbbbbbbb-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', now() - interval '3 days'),
  ('bbbbbbbb-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', now()),
  ('bbbbbbbb-0000-4000-8000-000000000003', '22222222-2222-4222-8222-222222222222', now()),
  ('bbbbbbbb-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', now());

-- ---------------------------------------------------------------------------
-- 6. Tasks (10 project tasks + 2 company tasks with project_id null)
-- ---------------------------------------------------------------------------
insert into tasks (id, project_id, title, status, owner_id, due_date, created_at, updated_at) values
  -- helios
  ('dddddddd-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', 'Replace sticking solenoid on valve 3',            'done',        '11111111-1111-4111-8111-111111111111', current_date - 1,  now() - interval '2 days 4 hours',   now() - interval '3 hours'),
  ('dddddddd-0000-4000-8000-000000000002', 'aaaaaaaa-0000-4000-8000-000000000001', 'Draft Ramirez Farms pilot agreement',             'in_progress', '11111111-1111-4111-8111-111111111111', current_date + 3,  now() - interval '2 days 1 hour',    now() - interval '40 minutes'),
  ('dddddddd-0000-4000-8000-000000000003', 'aaaaaaaa-0000-4000-8000-000000000001', 'Add soil moisture graphs to weekly email',        'todo',        '22222222-2222-4222-8222-222222222222', current_date + 8,  now() - interval '1 day 6 hours',    now() - interval '1 day 6 hours'),
  ('dddddddd-0000-4000-8000-000000000004', 'aaaaaaaa-0000-4000-8000-000000000001', 'Calibrate flow sensors for the Fresno block',     'done',        '11111111-1111-4111-8111-111111111111', null,              now() - interval '12 days',          now() - interval '6 days'),
  -- hnn
  ('dddddddd-0000-4000-8000-000000000005', 'aaaaaaaa-0000-4000-8000-000000000002', 'Roll water-policy section out to all subscribers','in_progress', '22222222-2222-4222-8222-222222222222', current_date + 5,  now() - interval '1 day 3 hours',    now() - interval '6 hours'),
  ('dddddddd-0000-4000-8000-000000000006', 'aaaaaaaa-0000-4000-8000-000000000002', 'Fix dedupe for syndicated stories',               'done',        '22222222-2222-4222-8222-222222222222', null,              now() - interval '6 days 2 hours',   now() - interval '5 days 5 hours'),
  ('dddddddd-0000-4000-8000-000000000007', 'aaaaaaaa-0000-4000-8000-000000000002', 'Landing page for hnn public beta',                'todo',        '11111111-1111-4111-8111-111111111111', current_date + 12, now() - interval '3 days 7 hours',   now() - interval '3 days 7 hours'),
  -- establo
  ('dddddddd-0000-4000-8000-000000000008', 'aaaaaaaa-0000-4000-8000-000000000003', 'Auto-fill supplier order sheet from history',     'in_progress', '11111111-1111-4111-8111-111111111111', current_date + 6,  now() - interval '5 days 6 hours',   now() - interval '1 day 2 hours'),
  ('dddddddd-0000-4000-8000-000000000009', 'aaaaaaaa-0000-4000-8000-000000000003', 'Prep Hotel Bellavista September proposal',        'todo',        '22222222-2222-4222-8222-222222222222', current_date + 10, now() - interval '2 days 2 hours',   now() - interval '2 days 2 hours'),
  ('dddddddd-0000-4000-8000-000000000010', 'aaaaaaaa-0000-4000-8000-000000000003', 'Price the establo monthly plans',                 'todo',        '22222222-2222-4222-8222-222222222222', current_date - 2,  now() - interval '8 days',           now() - interval '8 days'),
  -- company-level (no project)
  ('dddddddd-0000-4000-8000-000000000011', null,                                   'Incorporate the company',                         'todo',        '11111111-1111-4111-8111-111111111111', current_date + 7,  now() - interval '6 days 5 hours',   now() - interval '6 days 5 hours'),
  ('dddddddd-0000-4000-8000-000000000012', null,                                   'Open a business bank account',                    'todo',        '22222222-2222-4222-8222-222222222222', current_date + 4,  now() - interval '6 days 4 hours',   now() - interval '6 days 4 hours');

-- ---------------------------------------------------------------------------
-- 7. Outreach contacts (all six statuses; exactly three overdue next_touch)
-- ---------------------------------------------------------------------------
insert into outreach_contacts (id, name, company, email, status, next_touch_date, notes, created_at) values
  ('eeeeeeee-0000-4000-8000-000000000001', 'Miguel Ramirez',  'Ramirez Farms',                     'miguel@ramirezfarms.com',        'call',      current_date + 2, 'Three almond blocks near Fresno. Pilot agreement in draft.',          now() - interval '20 days'),
  ('eeeeeeee-0000-4000-8000-000000000002', 'Dana Whitfield',  'Central Valley Almond Co-op',       'dana@cvalmondcoop.com',          'contacted', current_date - 3, 'Co-op board could open 40+ member farms if the pilot lands.',         now() - interval '15 days'),
  ('eeeeeeee-0000-4000-8000-000000000003', 'Priya Natarajan', 'AgDaily',                           'priya@agdaily.media',            'replied',   current_date - 2, 'Newsletter editor. Considering an hnn cross-post.',                   now() - interval '9 days'),
  ('eeeeeeee-0000-4000-8000-000000000004', 'Giulia Ferrero',  'Trattoria Nonna',                   'giulia@trattorianonna.com',      'won',       current_date + 7, 'First establo pilot. Free through September, then 99/mo.',            now() - interval '6 days'),
  ('eeeeeeee-0000-4000-8000-000000000005', 'Tom Okafor',      'Bellavista Hotel Group',            'tom.okafor@bellavistagroup.com', 'call',      current_date + 6, 'Two properties. Wants a September start; proposal in prep.',          now() - interval '3 days'),
  ('eeeeeeee-0000-4000-8000-000000000006', 'Sam Deluca',      'Valley Ag Radio',                   'sam@valleyagradio.com',          'lead',      current_date + 9, 'Met at the AgTech meetup. Interested in an irrigation-tech segment.', now() - interval '6 days 2 hours'),
  ('eeeeeeee-0000-4000-8000-000000000007', 'Anders Boyle',    'Boyle Vineyards',                   'anders@boylevineyards.com',      'lead',      current_date - 6, 'Cold outreach. Opens the emails, never replies.',                     now() - interval '13 days'),
  ('eeeeeeee-0000-4000-8000-000000000008', 'Lena Ortiz',      'Golden State Growers Association',  'lena@gsgrowers.org',             'contacted', current_date + 3, 'Runs the fall field day. Possible helios demo slot.',                 now() - interval '8 days'),
  ('eeeeeeee-0000-4000-8000-000000000009', 'Bertrand Faure',  'Chateau Millefleur',                'bertrand@chateaumillefleur.fr',  'dead',      null,             'Wants full ERP integration. Not a fit for establo.',                  now() - interval '17 days');

-- ---------------------------------------------------------------------------
-- 8. Touches (one or two per contact, last 3 weeks, alternating founders)
-- ---------------------------------------------------------------------------
insert into touches (id, contact_id, user_id, note, occurred_at) values
  ('ffffffff-0000-4000-8000-000000000001', 'eeeeeeee-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Intro call. Three blocks of almonds, interested in fixed monthly pricing.',        now() - interval '13 days'),
  ('ffffffff-0000-4000-8000-000000000002', 'eeeeeeee-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'On-site walk-through with their agronomist. Asked for soil moisture graphs.',      now() - interval '1 day 7 hours'),
  ('ffffffff-0000-4000-8000-000000000003', 'eeeeeeee-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'Sent one-pager and pilot pricing. No reply yet.',                                  now() - interval '9 days'),
  ('ffffffff-0000-4000-8000-000000000004', 'eeeeeeee-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'Pitched an hnn cross-post. She asked for three sample briefs.',                    now() - interval '8 days'),
  ('ffffffff-0000-4000-8000-000000000005', 'eeeeeeee-0000-4000-8000-000000000003', '22222222-2222-4222-8222-222222222222', 'Sent the samples. She will run one if the water-policy section lands.',            now() - interval '4 days'),
  ('ffffffff-0000-4000-8000-000000000006', 'eeeeeeee-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', 'Demo at the restaurant. Chef wants the supplier order sheet to auto-fill.',        now() - interval '5 days 7 hours'),
  ('ffffffff-0000-4000-8000-000000000007', 'eeeeeeee-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'Agreed on a free pilot through September, then 99/mo.',                            now() - interval '3 days'),
  ('ffffffff-0000-4000-8000-000000000008', 'eeeeeeee-0000-4000-8000-000000000005', '22222222-2222-4222-8222-222222222222', 'Call with Tom. Wants a September start across both properties.',                   now() - interval '2 days 3 hours'),
  ('ffffffff-0000-4000-8000-000000000009', 'eeeeeeee-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', 'Met at the AgTech meetup. Pitched an irrigation-tech radio segment.',              now() - interval '6 days'),
  ('ffffffff-0000-4000-8000-000000000010', 'eeeeeeee-0000-4000-8000-000000000007', '22222222-2222-4222-8222-222222222222', 'Cold email about vineyard blocks. Opened twice, no reply.',                        now() - interval '12 days'),
  ('ffffffff-0000-4000-8000-000000000011', 'eeeeeeee-0000-4000-8000-000000000008', '11111111-1111-4111-8111-111111111111', 'Emailed about presenting helios at their fall field day.',                         now() - interval '7 days'),
  ('ffffffff-0000-4000-8000-000000000012', 'eeeeeeee-0000-4000-8000-000000000008', '22222222-2222-4222-8222-222222222222', 'Followed up with photos from the Fresno pilot.',                                   now() - interval '2 days 8 hours'),
  ('ffffffff-0000-4000-8000-000000000013', 'eeeeeeee-0000-4000-8000-000000000009', '11111111-1111-4111-8111-111111111111', 'Intro call. Wants full ERP integration, way beyond scope.',                        now() - interval '16 days'),
  ('ffffffff-0000-4000-8000-000000000014', 'eeeeeeee-0000-4000-8000-000000000009', '22222222-2222-4222-8222-222222222222', 'Confirmed we are passing. Marked dead.',                                           now() - interval '14 days');

-- ---------------------------------------------------------------------------
-- 9. Repos
-- ---------------------------------------------------------------------------
insert into repos (id, name, url, notes) values
  ('99999999-0000-4000-8000-000000000001', 'helios',  'https://github.com/irrigant/helios',  'Firmware, valve scheduler, and the copilot API.'),
  ('99999999-0000-4000-8000-000000000002', 'hnn',     'https://github.com/irrigant/hnn',     'Crawler, ranking pipeline, and daily brief sender.'),
  ('99999999-0000-4000-8000-000000000003', 'establo', 'https://github.com/irrigant/establo', 'Next.js app for hotel and restaurant back-office.');

-- ---------------------------------------------------------------------------
-- 10. LLM events (~200 over the last 14 days, ~5% errors)
--     Cost tracks tokens: tokens_in * 0.000003 + tokens_out * 0.000015.
-- ---------------------------------------------------------------------------
with gen as (
  select
    g.n,
    now() - (random() * interval '14 days')                                                          as occurred_at,
    (array['ask-helios','ask-helios','ask-helios','agent-scout','agent-drafter'])[1 + floor(random() * 5)::int] as source,
    (array['claude-sonnet-5','claude-haiku-4-5'])[1 + floor(random() * 2)::int]                      as model,
    (200 + floor(random() * 5801))::int                                                              as tokens_in,
    (50 + floor(random() * 2451))::int                                                               as tokens_out,
    (300 + floor(random() * 8701))::int                                                              as latency_ms,
    random()                                                                                         as ref_roll
  from generate_series(1, 200) as g(n)
)
insert into llm_events (occurred_at, source, model, tokens_in, tokens_out, cost_usd, latency_ms, status, input_ref, output_ref)
select
  occurred_at,
  source,
  model,
  tokens_in,
  tokens_out,
  round((tokens_in * 0.000003 + tokens_out * 0.000015)::numeric, 4),
  latency_ms,
  -- every 20th row errors: exactly 5 percent
  case when n % 20 = 0 then 'error' else 'ok' end,
  case when ref_roll < 0.4 then 's3://tt-logs/' || n || '-in.json' else null end,
  case when ref_roll < 0.4 then 's3://tt-logs/' || n || '-out.json' else null end
from gen;

-- ---------------------------------------------------------------------------
-- 11. Activities (aligned with the objects above; none for seeded llm_events)
-- ---------------------------------------------------------------------------
insert into activities (user_id, verb, object_type, object_id, object_label, created_at) values
  -- created: channels + projects
  ('11111111-1111-4111-8111-111111111111', 'created', 'channel', 'bbbbbbbb-0000-4000-8000-000000000004', '#general',  now() - interval '30 days'),
  ('11111111-1111-4111-8111-111111111111', 'created', 'project', 'aaaaaaaa-0000-4000-8000-000000000001', 'helios',    now() - interval '28 days'),
  ('11111111-1111-4111-8111-111111111111', 'created', 'channel', 'bbbbbbbb-0000-4000-8000-000000000001', '#helios',   now() - interval '28 days'),
  ('22222222-2222-4222-8222-222222222222', 'created', 'project', 'aaaaaaaa-0000-4000-8000-000000000002', 'hnn',       now() - interval '21 days'),
  ('22222222-2222-4222-8222-222222222222', 'created', 'channel', 'bbbbbbbb-0000-4000-8000-000000000002', '#hnn',      now() - interval '21 days'),
  ('22222222-2222-4222-8222-222222222222', 'created', 'project', 'aaaaaaaa-0000-4000-8000-000000000003', 'establo',   now() - interval '12 days'),
  ('22222222-2222-4222-8222-222222222222', 'created', 'channel', 'bbbbbbbb-0000-4000-8000-000000000003', '#establo',  now() - interval '12 days'),
  -- created: repos
  ('11111111-1111-4111-8111-111111111111', 'created', 'repo', '99999999-0000-4000-8000-000000000001', 'helios',  now() - interval '27 days 22 hours'),
  ('22222222-2222-4222-8222-222222222222', 'created', 'repo', '99999999-0000-4000-8000-000000000002', 'hnn',     now() - interval '20 days 22 hours'),
  ('22222222-2222-4222-8222-222222222222', 'created', 'repo', '99999999-0000-4000-8000-000000000003', 'establo', now() - interval '11 days 20 hours'),
  -- created: tasks (creator = owner)
  ('11111111-1111-4111-8111-111111111111', 'created', 'task', 'dddddddd-0000-4000-8000-000000000004', 'Calibrate flow sensors for the Fresno block',      now() - interval '12 days'),
  ('22222222-2222-4222-8222-222222222222', 'created', 'task', 'dddddddd-0000-4000-8000-000000000010', 'Price the establo monthly plans',                  now() - interval '8 days'),
  ('11111111-1111-4111-8111-111111111111', 'created', 'task', 'dddddddd-0000-4000-8000-000000000011', 'Incorporate the company',                          now() - interval '6 days 5 hours'),
  ('22222222-2222-4222-8222-222222222222', 'created', 'task', 'dddddddd-0000-4000-8000-000000000012', 'Open a business bank account',                     now() - interval '6 days 4 hours'),
  ('22222222-2222-4222-8222-222222222222', 'created', 'task', 'dddddddd-0000-4000-8000-000000000006', 'Fix dedupe for syndicated stories',                now() - interval '6 days 2 hours'),
  ('11111111-1111-4111-8111-111111111111', 'created', 'task', 'dddddddd-0000-4000-8000-000000000008', 'Auto-fill supplier order sheet from history',      now() - interval '5 days 6 hours'),
  ('11111111-1111-4111-8111-111111111111', 'created', 'task', 'dddddddd-0000-4000-8000-000000000007', 'Landing page for hnn public beta',                 now() - interval '3 days 7 hours'),
  ('11111111-1111-4111-8111-111111111111', 'created', 'task', 'dddddddd-0000-4000-8000-000000000001', 'Replace sticking solenoid on valve 3',             now() - interval '2 days 4 hours'),
  ('22222222-2222-4222-8222-222222222222', 'created', 'task', 'dddddddd-0000-4000-8000-000000000009', 'Prep Hotel Bellavista September proposal',         now() - interval '2 days 2 hours'),
  ('11111111-1111-4111-8111-111111111111', 'created', 'task', 'dddddddd-0000-4000-8000-000000000002', 'Draft Ramirez Farms pilot agreement',              now() - interval '2 days 1 hour'),
  ('22222222-2222-4222-8222-222222222222', 'created', 'task', 'dddddddd-0000-4000-8000-000000000005', 'Roll water-policy section out to all subscribers', now() - interval '1 day 3 hours'),
  ('22222222-2222-4222-8222-222222222222', 'created', 'task', 'dddddddd-0000-4000-8000-000000000003', 'Add soil moisture graphs to weekly email',         now() - interval '1 day 6 hours'),
  -- created: contacts
  ('22222222-2222-4222-8222-222222222222', 'created', 'contact', 'eeeeeeee-0000-4000-8000-000000000001', 'Miguel Ramirez',  now() - interval '20 days'),
  ('11111111-1111-4111-8111-111111111111', 'created', 'contact', 'eeeeeeee-0000-4000-8000-000000000009', 'Bertrand Faure',  now() - interval '17 days'),
  ('22222222-2222-4222-8222-222222222222', 'created', 'contact', 'eeeeeeee-0000-4000-8000-000000000002', 'Dana Whitfield',  now() - interval '15 days'),
  ('22222222-2222-4222-8222-222222222222', 'created', 'contact', 'eeeeeeee-0000-4000-8000-000000000007', 'Anders Boyle',    now() - interval '13 days'),
  ('11111111-1111-4111-8111-111111111111', 'created', 'contact', 'eeeeeeee-0000-4000-8000-000000000003', 'Priya Natarajan', now() - interval '9 days'),
  ('11111111-1111-4111-8111-111111111111', 'created', 'contact', 'eeeeeeee-0000-4000-8000-000000000008', 'Lena Ortiz',      now() - interval '8 days'),
  ('22222222-2222-4222-8222-222222222222', 'created', 'contact', 'eeeeeeee-0000-4000-8000-000000000004', 'Giulia Ferrero',  now() - interval '6 days'),
  ('11111111-1111-4111-8111-111111111111', 'created', 'contact', 'eeeeeeee-0000-4000-8000-000000000006', 'Sam Deluca',      now() - interval '6 days 2 hours'),
  ('22222222-2222-4222-8222-222222222222', 'created', 'contact', 'eeeeeeee-0000-4000-8000-000000000005', 'Tom Okafor',      now() - interval '3 days'),
  -- logged: touches (label = contact name, time = occurred_at)
  ('11111111-1111-4111-8111-111111111111', 'logged', 'touch', 'ffffffff-0000-4000-8000-000000000013', 'Bertrand Faure',  now() - interval '16 days'),
  ('22222222-2222-4222-8222-222222222222', 'logged', 'touch', 'ffffffff-0000-4000-8000-000000000014', 'Bertrand Faure',  now() - interval '14 days'),
  ('22222222-2222-4222-8222-222222222222', 'logged', 'touch', 'ffffffff-0000-4000-8000-000000000001', 'Miguel Ramirez',  now() - interval '13 days'),
  ('22222222-2222-4222-8222-222222222222', 'logged', 'touch', 'ffffffff-0000-4000-8000-000000000010', 'Anders Boyle',    now() - interval '12 days'),
  ('22222222-2222-4222-8222-222222222222', 'logged', 'touch', 'ffffffff-0000-4000-8000-000000000003', 'Dana Whitfield',  now() - interval '9 days'),
  ('11111111-1111-4111-8111-111111111111', 'logged', 'touch', 'ffffffff-0000-4000-8000-000000000004', 'Priya Natarajan', now() - interval '8 days'),
  ('11111111-1111-4111-8111-111111111111', 'logged', 'touch', 'ffffffff-0000-4000-8000-000000000011', 'Lena Ortiz',      now() - interval '7 days'),
  ('11111111-1111-4111-8111-111111111111', 'logged', 'touch', 'ffffffff-0000-4000-8000-000000000009', 'Sam Deluca',      now() - interval '6 days'),
  ('22222222-2222-4222-8222-222222222222', 'logged', 'touch', 'ffffffff-0000-4000-8000-000000000006', 'Giulia Ferrero',  now() - interval '5 days 7 hours'),
  ('22222222-2222-4222-8222-222222222222', 'logged', 'touch', 'ffffffff-0000-4000-8000-000000000005', 'Priya Natarajan', now() - interval '4 days'),
  ('11111111-1111-4111-8111-111111111111', 'logged', 'touch', 'ffffffff-0000-4000-8000-000000000007', 'Giulia Ferrero',  now() - interval '3 days'),
  ('22222222-2222-4222-8222-222222222222', 'logged', 'touch', 'ffffffff-0000-4000-8000-000000000012', 'Lena Ortiz',      now() - interval '2 days 8 hours'),
  ('22222222-2222-4222-8222-222222222222', 'logged', 'touch', 'ffffffff-0000-4000-8000-000000000008', 'Tom Okafor',      now() - interval '2 days 3 hours'),
  ('11111111-1111-4111-8111-111111111111', 'logged', 'touch', 'ffffffff-0000-4000-8000-000000000002', 'Miguel Ramirez',  now() - interval '1 day 7 hours'),
  -- moved: task status changes (time = task updated_at)
  ('11111111-1111-4111-8111-111111111111', 'moved', 'task', 'dddddddd-0000-4000-8000-000000000004', 'Calibrate flow sensors for the Fresno block → done',              now() - interval '6 days'),
  ('22222222-2222-4222-8222-222222222222', 'moved', 'task', 'dddddddd-0000-4000-8000-000000000006', 'Fix dedupe for syndicated stories → done',                        now() - interval '5 days 5 hours'),
  ('11111111-1111-4111-8111-111111111111', 'moved', 'task', 'dddddddd-0000-4000-8000-000000000001', 'Replace sticking solenoid on valve 3 → done',                     now() - interval '3 hours'),
  ('11111111-1111-4111-8111-111111111111', 'moved', 'task', 'dddddddd-0000-4000-8000-000000000002', 'Draft Ramirez Farms pilot agreement → in_progress',               now() - interval '40 minutes'),
  -- sent: the 10 most recent messages (time = message created_at)
  ('11111111-1111-4111-8111-111111111111', 'sent', 'message', 'cccccccc-0000-4000-8000-000000000030', '#establo', now() - interval '2 days 2 hours 30 minutes'),
  ('11111111-1111-4111-8111-111111111111', 'sent', 'message', 'cccccccc-0000-4000-8000-000000000016', '#helios',  now() - interval '1 day 7 hours'),
  ('11111111-1111-4111-8111-111111111111', 'sent', 'message', 'cccccccc-0000-4000-8000-000000000024', '#hnn',     now() - interval '1 day 4 hours'),
  ('22222222-2222-4222-8222-222222222222', 'sent', 'message', 'cccccccc-0000-4000-8000-000000000005', '#general', now() - interval '20 hours'),
  ('22222222-2222-4222-8222-222222222222', 'sent', 'message', 'cccccccc-0000-4000-8000-000000000025', '#hnn',     now() - interval '6 hours 30 minutes'),
  ('22222222-2222-4222-8222-222222222222', 'sent', 'message', 'cccccccc-0000-4000-8000-000000000006', '#general', now() - interval '5 hours'),
  ('11111111-1111-4111-8111-111111111111', 'sent', 'message', 'cccccccc-0000-4000-8000-000000000017', '#helios',  now() - interval '3 hours 20 minutes'),
  ('11111111-1111-4111-8111-111111111111', 'sent', 'message', 'cccccccc-0000-4000-8000-000000000026', '#hnn',     now() - interval '1 hour 10 minutes'),
  ('11111111-1111-4111-8111-111111111111', 'sent', 'message', 'cccccccc-0000-4000-8000-000000000018', '#helios',  now() - interval '41 minutes'),
  ('22222222-2222-4222-8222-222222222222', 'sent', 'message', 'cccccccc-0000-4000-8000-000000000007', '#general', now() - interval '22 minutes');

-- ---------------------------------------------------------------------------
-- 12. Goals (Q3 2026)
-- ---------------------------------------------------------------------------
insert into goals (id, title, quarter, status) values
  ('88888888-0000-4000-8000-000000000001', 'Sign 3 paid helios pilots', '2026Q3', 'active'),
  ('88888888-0000-4000-8000-000000000002', 'Ship hnn public beta',      '2026Q3', 'active');
