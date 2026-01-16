// Supabase Edge Function for feedback submission with IP-based rate limiting
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 5; // Maximum 5 submissions per hour per IP
const COOLDOWN_PERIOD = 5 * 60 * 1000; // 5 minutes cooldown between submissions

// In-memory store for rate limiting (consider using Redis in production)
const rateLimitStore = new Map<string, { submissions: number[], lastSubmission: number }>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    data.submissions = data.submissions.filter(time => now - time < RATE_LIMIT_WINDOW);
    if (data.submissions.length === 0) {
      rateLimitStore.delete(ip);
    }
  }
}, 60 * 1000); // Clean up every minute

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get client IP address
    const clientIp = req.headers.get('x-forwarded-for') ||
                     req.headers.get('x-real-ip') ||
                     'unknown';

    // Check rate limit
    const now = Date.now();
    const ipData = rateLimitStore.get(clientIp) || { submissions: [], lastSubmission: 0 };

    // Check cooldown
    if (ipData.lastSubmission && now - ipData.lastSubmission < COOLDOWN_PERIOD) {
      const remainingTime = Math.ceil((COOLDOWN_PERIOD - (now - ipData.lastSubmission)) / 1000);
      return new Response(
        JSON.stringify({
          error: `Please wait ${Math.floor(remainingTime / 60)} minutes and ${remainingTime % 60} seconds before submitting again.`,
          cooldown: remainingTime
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Filter old submissions
    ipData.submissions = ipData.submissions.filter(time => now - time < RATE_LIMIT_WINDOW);

    // Check rate limit
    if (ipData.submissions.length >= MAX_REQUESTS_PER_WINDOW) {
      return new Response(
        JSON.stringify({
          error: 'Too many submissions. Please try again in an hour.',
          retryAfter: RATE_LIMIT_WINDOW
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const { name, email, contact, organization, message, type } = await req.json();

    // Validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Message length validation
    if (message.length < 10 || message.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Message must be between 10 and 1000 characters.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Spam detection
    const spamPatterns = [
      /(.)\1{10,}/,  // Same character repeated 10+ times
      /\b(viagra|casino|lottery|prize|winner|crypto|bitcoin)\b/gi
    ];

    for (const pattern of spamPatterns) {
      if (pattern.test(message)) {
        return new Response(
          JSON.stringify({ error: 'Message contains inappropriate content.' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Sanitize inputs
    const sanitize = (input: string): string => {
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    };

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Insert feedback into database
    const { data, error } = await supabaseClient
      .from('feedbacks')
      .insert({
        name: sanitize(name).slice(0, 100),
        email: sanitize(email).slice(0, 100),
        contact: sanitize(contact || '').slice(0, 50),
        organization: sanitize(organization || '').slice(0, 100),
        message: sanitize(message).slice(0, 1000),
        type: type || 'feedback',
        ip_address: clientIp,
        user_agent: req.headers.get('user-agent') || 'unknown',
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to submit feedback. Please try again.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update rate limit store
    ipData.submissions.push(now);
    ipData.lastSubmission = now;
    rateLimitStore.set(clientIp, ipData);

    // Optional: Send notification to admin (implement if needed)
    // await sendAdminNotification(data[0]);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Feedback submitted successfully.',
        id: data[0].id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});