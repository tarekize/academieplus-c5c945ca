import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { question_id, user_answer } = await req.json()

    if (!question_id || !user_answer) {
      throw new Error('Missing required fields')
    }

    // Fetch the correct answer (only accessible server-side with service role would be even better)
    const { data: question, error: questionError } = await supabase
      .from('quiz_questions')
      .select('correct_answer, explanation')
      .eq('id', question_id)
      .single()

    if (questionError || !question) {
      throw new Error('Question not found')
    }

    const isCorrect = question.correct_answer === user_answer

    // Store the submission
    const { error: submissionError } = await supabase
      .from('quiz_submissions')
      .insert({
        user_id: user.id,
        question_id,
        user_answer,
        is_correct: isCorrect,
      })

    if (submissionError) {
      console.error('Submission error:', submissionError)
      throw submissionError
    }

    return new Response(
      JSON.stringify({
        is_correct: isCorrect,
        explanation: question.explanation,
        correct_answer: isCorrect ? null : question.correct_answer, // Only reveal if incorrect
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
