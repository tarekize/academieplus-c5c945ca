# TODO List - AI Report Modifications

## Phase 1: Database Changes
- [x] Create migration to add new columns to learning_styles table:
  - report_first_shown_at: timestamp
  - last_advice_generated_at: timestamp  
  - periodic_advice: JSONB

## Phase 2: Modify ITSRecommendations Component
- [x] Update ITSRecommendations.tsx to:
  - Hide report after 2 minutes
  - Track first shown timestamp in database
  - Add periodic advice display logic (every 10 days)

## Phase 3: Create Edge Function
- [x] Create generate-periodic-advice Edge Function for AI-generated advice

## Phase 4: Test and Verify
- [ ] Apply database migration to Supabase
- [ ] Deploy Edge Function to Supabase
- [ ] Test that report disappears after 2 minutes
- [ ] Test periodic advice generation logic
