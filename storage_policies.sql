-- Storage policies for recordings bucket
-- IMPORTANT: Do NOT run this SQL directly due to permission errors.
-- Instead, create these policies through the Supabase dashboard:

-- Step 1: Create the 'recordings' bucket in Storage (make it public for testing)
-- Step 2: Go to Storage → recordings bucket → Policies tab
-- Step 3: Create the following policies for 'authenticated' role:

-- Policy 1: "Users can upload recordings"
-- Operation: INSERT
-- Policy: bucket_id = 'recordings'

-- Policy 2: "Users can view recordings"
-- Operation: SELECT
-- Policy: bucket_id = 'recordings'

-- Policy 3: "Users can update recordings"
-- Operation: UPDATE
-- Policy: bucket_id = 'recordings'

-- Policy 4: "Users can delete recordings"
-- Operation: DELETE
-- Policy: bucket_id = 'recordings'

-- Alternative for testing: Make the bucket public in Settings
