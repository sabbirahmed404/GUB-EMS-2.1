# Email Notifications for GUB-EMS

This document explains how email notifications have been implemented for the GUB Event Management System.

## Overview

The system sends email notifications to users for:
1. Sign up for a new account (Welcome email)
2. Log in to their existing account (Login notification)
3. And more custom notifications as needed

## Implementation Details

### Email Service
- Emails are sent using a Supabase Edge Function with SMTP integration
- SMTP Configuration is managed securely through environment variables:
  - `SMTP_HOST`: The SMTP server (e.g., smtp.gmail.com)
  - `SMTP_PORT`: The SMTP port (typically 465 for SSL)
  - `SMTP_USERNAME`: The email account username
  - `SMTP_PASSWORD`: The email account password (or app password for Gmail)
  - `SMTP_FROM_EMAIL`: The sender's email address
  - `SMTP_FROM_NAME`: The sender's display name (e.g., EMS-GUB)
- Security: SSL/TLS is used for all email communications

### Components

1. **Email Utility Library** (`src/lib/email.ts`)
   - Provides functions for sending different types of emails
   - Primary function: `sendEmail()` - tries Supabase Edge Function first, with fallback to API
   - Helper functions: 
     - `sendWelcomeEmail(email, name)`
     - `sendLoginNotificationEmail(email, name)`

2. **Supabase Edge Function** (`src/lib/supabase/edge-functions/send-email.ts`)
   - Uses Deno's SMTP client to send emails
   - Securely manages email credentials using Supabase secrets
   - Deployed to: `https://[PROJECT_REF].supabase.co/functions/v1/send-email`

3. **Auth Context Integration** (`src/contexts/AuthContext.tsx`)
   - Detects auth events (sign-up, sign-in)
   - Triggers appropriate email notifications

## How to Use in Your Code

To send an email from your application code:

```typescript
// Import the email utility
import { sendEmail, sendWelcomeEmail } from '@/lib/email';

// Option 1: Use the generic email function
await sendEmail({
  to: 'user@example.com',
  subject: 'Your Custom Subject',
  html: '<h1>HTML Email Content</h1><p>This is an HTML email.</p>',
  // Or use text for plain text emails
  // text: 'This is a plain text email'
});

// Option 2: Use a pre-defined template
await sendWelcomeEmail('user@example.com', 'John Doe');
```

## Deployment Instructions

### 1. Deploy the Edge Function

Run the included deployment script:
```bash
chmod +x deploy-edge-functions.sh
./deploy-edge-functions.sh
```

The script will:
- Copy the edge function code to the supabase/functions directory
- Deploy to your project using the included reference ID
- Set up all required environment secrets

### 2. Verify Deployment

After deployment:
1. Go to your Supabase project dashboard
2. Navigate to Edge Functions
3. Ensure the `send-email` function is enabled and deployed
4. Check the Edge Function logs to verify it's working correctly

## Testing

To test that emails are working:
1. Register a new user (should receive welcome email)
2. Log out and log back in (should receive login notification)
3. Or use the following code in a component or page:

```typescript
import { sendEmail } from '@/lib/email';

// Add this to a button click handler or useEffect
const testEmail = async () => {
  const result = await sendEmail({
    to: 'your-test-email@example.com',
    subject: 'Test Email from GUB-EMS',
    html: '<h1>Test Email</h1><p>This email confirms that the system is working!</p>',
  });
  
  console.log('Email sent:', result ? 'success' : 'failed');
};
```

## Troubleshooting

If emails are not being sent:
1. Check the Edge Function logs in the Supabase dashboard
2. Verify that the SMTP credentials are correct 
3. Make sure the Google account has "Less secure app access" enabled or is using an App Password
4. Verify the Edge Function is properly deployed and accessible

## Notes on Gmail Usage

When using Gmail as your SMTP provider:
1. You'll need to create an "App Password" if you have 2FA enabled
2. Or enable "Less secure app access" (not recommended for production)
3. Consider upgrading to a transactional email service like SendGrid, Mailgun, or Amazon SES for production use 