import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SupabaseEmailOptions {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

interface ApiEmailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Sends an email using Supabase Edge Function
 */
export const sendEmailViaSupabase = async (options: SupabaseEmailOptions): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: options.to,
        subject: options.subject,
        body: options.body,
        isHtml: options.isHtml ?? true,
      },
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error invoking email function:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error sending email' 
    };
  }
};

/**
 * Send an email using the API endpoint
 */
export async function sendEmailViaApi({ to, subject, html, text }: ApiEmailParams): Promise<boolean> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send email:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Primary method to send emails - tries Supabase Edge Function first,
 * falls back to API endpoint if needed.
 */
export async function sendEmail({ to, subject, html, text }: ApiEmailParams): Promise<boolean> {
  try {
    // Try to send via Supabase Edge Function first
    const result = await sendEmailViaSupabase({
      to,
      subject, 
      body: html || text || '',
      isHtml: !!html
    });
    
    if (result.success) {
      return true;
    }
    
    // If that fails, try the API endpoint
    return sendEmailViaApi({ to, subject, html, text });
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'Welcome to EMS-GUB!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Welcome to EMS-GUB!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for signing up to our Event Management System. We're excited to have you on board!</p>
        <p>You can now log in to your account and start exploring the platform.</p>
        <p>If you have any questions or need assistance, feel free to contact our support team.</p>
        <p>Best regards,<br>The EMS-GUB Team</p>
      </div>
    `,
  });
}

/**
 * Send a login notification email
 */
export async function sendLoginNotificationEmail(email: string, name: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'New Login Detected - EMS-GUB',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">New Login Detected</h2>
        <p>Hello ${name},</p>
        <p>We detected a new login to your EMS-GUB account.</p>
        <p>If this was you, you can safely ignore this email.</p>
        <p>If you didn't log in recently, please secure your account by changing your password immediately.</p>
        <p>Best regards,<br>The EMS-GUB Team</p>
      </div>
    `,
  });
} 