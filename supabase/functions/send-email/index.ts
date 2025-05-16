// Supabase Edge Function for sending emails via SMTP
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

export interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

// Handle the request using Deno's serve function
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

    // Get SMTP configuration from environment variables
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = Deno.env.get("SMTP_PORT");
    const smtpUsername = Deno.env.get("SMTP_USERNAME");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    const fromName = Deno.env.get("SMTP_FROM_NAME");
    const fromEmail = Deno.env.get("SMTP_FROM_EMAIL");
    
    // Validate that required environment variables are set
    if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword || !fromEmail) {
      const missingVars = [];
      if (!smtpHost) missingVars.push("SMTP_HOST");
      if (!smtpPort) missingVars.push("SMTP_PORT");
      if (!smtpUsername) missingVars.push("SMTP_USERNAME");
      if (!smtpPassword) missingVars.push("SMTP_PASSWORD");
      if (!fromEmail) missingVars.push("SMTP_FROM_EMAIL");
      
      console.error(`Missing required environment variables: ${missingVars.join(", ")}`);
      return new Response(
        JSON.stringify({ 
          error: "Email configuration incomplete", 
          details: `Missing environment variables: ${missingVars.join(", ")}` 
        }),
        { status: 500, headers }
      );
    }
    
    // Initialize SMTP client
    const client = new SmtpClient();
    
    // Connect to SMTP server
    await client.connectTLS({
      hostname: smtpHost,
      port: parseInt(smtpPort),
      username: smtpUsername,
      password: smtpPassword,
      tls: true,
    });

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