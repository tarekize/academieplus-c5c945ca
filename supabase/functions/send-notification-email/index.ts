import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'review_request' | 'review_completed' | 'course_published';
  courseId: number;
  recipientId: number;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const { type, courseId, recipientId, message }: NotificationRequest = await req.json();

    // Récupérer les informations du cours
    const { data: course, error: courseError } = await supabaseClient
      .from('cours')
      .select('titre, auteur_id')
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;

    // Récupérer l'email du destinataire
    const { data: recipient, error: recipientError } = await supabaseClient
      .from('profiles')
      .select('email, prenom, nom')
      .eq('id', recipientId)
      .single();

    if (recipientError) throw recipientError;

    // Préparer le contenu de l'email selon le type
    let subject = '';
    let html = '';

    switch (type) {
      case 'review_request':
        subject = `Nouveau cours à réviser: ${course.titre}`;
        html = `
          <h1>Demande de révision</h1>
          <p>Bonjour ${recipient.prenom},</p>
          <p>Un nouveau cours vous a été assigné pour révision.</p>
          <p><strong>Cours:</strong> ${course.titre}</p>
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          <p>Connectez-vous à la plateforme pour commencer la révision.</p>
        `;
        break;

      case 'review_completed':
        subject = `Révision terminée: ${course.titre}`;
        html = `
          <h1>Révision terminée</h1>
          <p>Bonjour ${recipient.prenom},</p>
          <p>La révision de votre cours a été complétée.</p>
          <p><strong>Cours:</strong> ${course.titre}</p>
          ${message ? `<p><strong>Commentaires:</strong> ${message}</p>` : ''}
        `;
        break;

      case 'course_published':
        subject = `Cours publié: ${course.titre}`;
        html = `
          <h1>Cours publié</h1>
          <p>Bonjour ${recipient.prenom},</p>
          <p>Votre cours a été publié avec succès!</p>
          <p><strong>Cours:</strong> ${course.titre}</p>
        `;
        break;
    }

    // Vérifier si Resend API key est configurée
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not configured. Email would be sent:', {
        to: recipient.email,
        subject,
        html
      });
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email logged (RESEND_API_KEY not configured)'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Envoyer l'email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Plateforme Éducative <onboarding@resend.dev>',
        to: [recipient.email],
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const emailResult = await resendResponse.json();

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in send-notification-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
};

serve(handler);
