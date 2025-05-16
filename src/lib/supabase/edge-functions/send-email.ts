// This is a TypeScript definition for a Supabase Edge Function
// In your actual deployment, this would be placed in the supabase/functions/send-email/ directory

import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

export interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

// This is a reference implementation. In the actual deployment, this would use Deno APIs
Deno.serve(async (req: Request): Promise<Response> => {
  try {
    // CORS headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Content-Type": "application/json"
    };

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers });
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers }
      );
    }

    // Parse the request body
    const { to, subject, body, isHtml = true }: EmailRequest = await req.json();

    // Basic validation
    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields (to, subject, body)" }),
        { status: 400, headers }
      );
    }

    // Initialize SMTP client
    const client = new SmtpClient();
    
    const smtpConfig = {
      hostname: Deno.env.get("SMTP_HOST") || "smtp.gmail.com",
      port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
      username: Deno.env.get("SMTP_USERNAME") || "",
      password: Deno.env.get("SMTP_PASSWORD") || "",
      tls: true,
    };

    // Connect to SMTP server
    await client.connectTLS(smtpConfig);

    // Get the required configuration from environment variables
    const fromName = Deno.env.get("SMTP_FROM_NAME");
    const fromEmail = Deno.env.get("SMTP_FROM_EMAIL");
    
    // Validate that required environment variables are set
    if (!fromEmail) {
      throw new Error("SMTP_FROM_EMAIL environment variable is not set");
    }
    
    // Send the email
    await client.send({
      from: `${fromName || "EMS-GUB"} <${fromEmail}>`,
      to: to,
      subject: subject,
      content: isHtml ? undefined : body,
      html: isHtml ? body : undefined,
    });

    // Close the connection
    await client.close();

    console.log(`Email successfully sent to ${to} with subject: ${subject}`);

    // Return success response
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
        } 
      }
    );
  }
}); 