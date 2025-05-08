import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const bucketName = 'event-images';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

async function main() {
  try {
    // Create a Supabase client with the service role key
    // TypeScript type assertion to handle the potential undefined values
    const supabase = createClient(supabaseUrl as string, supabaseKey as string);
    
    console.log('Checking if bucket exists...');
    
    // Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketError) {
      throw bucketError;
    }
    
    let bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error } = await supabase
        .storage
        .createBucket(bucketName, { public: true });
      
      if (error) {
        throw error;
      }
      console.log('Bucket created successfully');
    } else {
      console.log(`Bucket ${bucketName} already exists`);
      
      // Update bucket to public if it exists
      const { error } = await supabase
        .storage
        .updateBucket(bucketName, { public: true });
      
      if (error) {
        throw error;
      }
      console.log('Bucket updated to public');
    }
    
    // Test by directly trying to upload a small buffer instead of a file
    console.log('Uploading test buffer to verify permissions...');
    const testBuffer = Buffer.from('This is a test file to check storage permissions');
    
    const { error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload('test-permissions.txt', testBuffer, {
        contentType: 'text/plain',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Error uploading test file:', uploadError);
      console.log('Detailed error:', JSON.stringify(uploadError, null, 2));
    } else {
      console.log('Test file uploaded successfully');
      
      // If upload worked, also test inserting a policy directly
      try {
        // Directly try to create a policy using the storage API
        console.log('Attempting to create policy for authenticated uploads...');
        
        // This is more like an RPC call to storage function
        const { data: policyData, error: policyError } = await supabase
          .rpc('create_storage_policy', {
            bucket_id: bucketName,
            name: 'allow_authenticated_uploads',
            definition: 'auth.role() = \'authenticated\'',
            operation: 'INSERT'
          });
        
        if (policyError) {
          console.error('Error creating policy:', policyError);
        } else {
          console.log('Policy created:', policyData);
        }
      } catch (policyErr) {
        console.error('Exception creating policy:', policyErr);
      }
    }
    
    console.log('Storage setup complete!');
  } catch (error) {
    console.error('Error setting up storage:', error);
    process.exit(1);
  }
}

main(); 