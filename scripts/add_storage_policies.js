// Script to add storage policies to Supabase
const fetch = require('node-fetch');
require('dotenv').config();

// Your Supabase project details
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const BUCKET_ID = 'event-images';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Simplified policies using the REST API direct to Supabase Storage API
async function createPolicy() {
  try {
    console.log('Adding storage policies for event-images bucket...');
    
    // Create a policy that allows authenticated users to upload files
    const response = await fetch(`${SUPABASE_URL}/storage/v1/policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({
        name: 'allow authenticated uploads',
        bucket_id: BUCKET_ID,
        definition: {
          role: 'authenticated',
          permission: 'insert'
        }
      })
    });

    const result = await response.json();
    console.log('Policy creation response:', result);
    
    // Also create a policy to allow anyone to read images (public)
    const readResponse = await fetch(`${SUPABASE_URL}/storage/v1/policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({
        name: 'allow public read',
        bucket_id: BUCKET_ID,
        definition: {
          role: '*',
          permission: 'select'
        }
      })
    });

    const readResult = await readResponse.json();
    console.log('Public read policy creation response:', readResult);
    
    console.log('Storage policies added successfully!');
  } catch (error) {
    console.error('Error creating storage policies:', error);
  }
}

createPolicy(); 