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

# Check if .env file exists and source it
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
fi

# Set secrets using values from environment variables or prompt for them
echo "Setting required secrets..."

# SMTP_HOST
if [ -z "$SMTP_HOST" ]; then
  read -p "Enter SMTP host (e.g. smtp.gmail.com): " SMTP_HOST
fi
supabase secrets set SMTP_HOST="$SMTP_HOST" --project-ref $PROJECT_REF

# SMTP_PORT
if [ -z "$SMTP_PORT" ]; then
  read -p "Enter SMTP port (e.g. 465): " SMTP_PORT
fi
supabase secrets set SMTP_PORT="$SMTP_PORT" --project-ref $PROJECT_REF

# SMTP_USERNAME
if [ -z "$SMTP_USERNAME" ]; then
  read -p "Enter SMTP username (your email): " SMTP_USERNAME
fi
supabase secrets set SMTP_USERNAME="$SMTP_USERNAME" --project-ref $PROJECT_REF

# SMTP_PASSWORD
if [ -z "$SMTP_PASSWORD" ]; then
  read -sp "Enter SMTP password (app password for Gmail): " SMTP_PASSWORD
  echo ""
fi
supabase secrets set SMTP_PASSWORD="$SMTP_PASSWORD" --project-ref $PROJECT_REF

# SMTP_FROM_EMAIL
if [ -z "$SMTP_FROM_EMAIL" ]; then
  read -p "Enter sender email (usually same as SMTP_USERNAME): " SMTP_FROM_EMAIL
fi
supabase secrets set SMTP_FROM_EMAIL="$SMTP_FROM_EMAIL" --project-ref $PROJECT_REF

# SMTP_FROM_NAME
if [ -z "$SMTP_FROM_NAME" ]; then
  read -p "Enter sender name (e.g. EMS-GUB): " SMTP_FROM_NAME
fi
supabase secrets set SMTP_FROM_NAME="$SMTP_FROM_NAME" --project-ref $PROJECT_REF

echo "Deployment complete!"
echo "Edge Function URL: https://${PROJECT_REF}.supabase.co/functions/v1/send-email" 