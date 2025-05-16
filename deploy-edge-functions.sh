#!/bin/bash

# Ensure the supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "Supabase CLI is not installed. Please install it using one of these methods:"
    echo ""
    echo "macOS or Linux with Homebrew:"
    echo "brew install supabase/tap/supabase"
    echo ""
    echo "Windows with Scoop:"
    echo "scoop bucket add supabase https://github.com/supabase/scoop-bucket.git"
    echo "scoop install supabase"
    echo ""
    echo "Other methods: https://github.com/supabase/cli#install-the-cli"
    exit 1
fi

# Project reference
PROJECT_REF="rucodmdvusixwechycax"

# Create directories if they don't exist
mkdir -p supabase/functions/send-email

# Copy the Edge Function file
echo "Copying Edge Function..."
cp src/lib/supabase/edge-functions/send-email.ts supabase/functions/send-email/index.ts

# Deploy the Edge Function
echo "Deploying Edge Function to Supabase..."
supabase functions deploy send-email --project-ref $PROJECT_REF

# Set secrets if they don't exist
echo "Setting required secrets..."
supabase secrets set SMTP_HOST="smtp.gmail.com" --project-ref $PROJECT_REF
supabase secrets set SMTP_PORT="465" --project-ref $PROJECT_REF
supabase secrets set SMTP_USERNAME="msa29.contact@gmail.com" --project-ref $PROJECT_REF
supabase secrets set SMTP_PASSWORD="ikaw tjhb bspq sohk" --project-ref $PROJECT_REF
supabase secrets set SMTP_FROM_EMAIL="msa29.contact@gmail.com" --project-ref $PROJECT_REF
supabase secrets set SMTP_FROM_NAME="EMS-GUB" --project-ref $PROJECT_REF

echo "Deployment complete!"
echo "Edge Function URL: https://${PROJECT_REF}.supabase.co/functions/v1/send-email" 