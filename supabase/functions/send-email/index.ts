// This is a TypeScript definition for a Supabase Edge Function
// In your actual deployment, this would be placed in the supabase/functions/send-email/ directory

export interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

// This is a reference implementation. In the actual deployment, this would use Deno APIs
export const handler = async (req: Request): Promise<Response> => {
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

    // In production, this would use the SMTP client to send the email
    console.log(`Sending email to ${to} with subject: ${subject}`);

    // Return success response (simulated for this reference)
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
}; 