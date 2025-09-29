import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { intakeResponseId } = await req.json();
    const authHeader = req.headers.get('Authorization')!;
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Generating matches for intake response:', intakeResponseId);

    // Get the intake response with AI analysis
    const { data: intakeResponse, error: intakeError } = await supabase
      .from('intake_responses')
      .select('*')
      .eq('id', intakeResponseId)
      .eq('user_id', user.id)
      .single();

    if (intakeError || !intakeResponse) {
      throw new Error('Intake response not found');
    }

    // Get all available therapists
    const { data: therapists, error: therapistsError } = await supabase
      .from('therapists')
      .select('*')
      .eq('availability_status', 'available');

    if (therapistsError) {
      throw new Error(`Failed to fetch therapists: ${therapistsError.message}`);
    }

    console.log(`Found ${therapists.length} available therapists`);

    // Generate matches using OpenAI for each therapist
    const matches = [];
    
    for (const therapist of therapists.slice(0, 10)) { // Limit to top 10 for processing
      const matchingPrompt = `
Analyze the compatibility between this client and therapist:

CLIENT PROFILE:
- Current Situation: ${intakeResponse.current_situation}
- Goals: ${intakeResponse.goals}
- Communication Style: ${intakeResponse.communication_style_preference}
- Therapy Type Preference: ${intakeResponse.therapy_type_preference}
- Budget Range: ${intakeResponse.budget_range}
- Session Format: ${intakeResponse.session_format_preference}
- Urgency: ${intakeResponse.urgency_level}
- AI Analysis: ${JSON.stringify(intakeResponse.ai_analysis)}

THERAPIST PROFILE:
- Name: ${therapist.name}
- Specializations: ${therapist.specializations?.join(', ') || 'General practice'}
- Communication Style: ${therapist.communication_style}
- Approach: ${therapist.approach_style}
- Therapy Types: ${therapist.therapy_types?.join(', ') || 'Various'}
- Years Experience: ${therapist.years_experience}
- Hourly Rate: $${therapist.hourly_rate}
- Languages: ${therapist.languages?.join(', ') || 'English'}

Provide a JSON response with:
{
  "matchScore": 0.0-1.0,
  "confidenceLevel": "high|medium|low",
  "matchReasons": ["reason1", "reason2", "reason3"],
  "explanation": "detailed explanation of why this is a good/poor match"
}

Consider personality compatibility, therapeutic approach alignment, specialization relevance, and practical factors.`;

      try {
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are an expert in therapist-client matching. Provide accurate compatibility assessments based on therapeutic needs and professional qualifications.'
              },
              {
                role: 'user',
                content: matchingPrompt
              }
            ],
            max_tokens: 800,
            temperature: 0.2,
          }),
        });

        if (openAIResponse.ok) {
          const openAIData = await openAIResponse.json();
          const analysisText = openAIData.choices[0].message.content;
          
          try {
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const matchAnalysis = JSON.parse(jsonMatch[0]);
              
              // Save match to database
              const { data: savedMatch, error: matchError } = await supabase
                .from('matches')
                .insert({
                  user_id: user.id,
                  therapist_id: therapist.id,
                  intake_response_id: intakeResponseId,
                  match_score: matchAnalysis.matchScore,
                  confidence_level: matchAnalysis.confidenceLevel,
                  match_reasons: matchAnalysis.matchReasons,
                  ai_explanation: matchAnalysis.explanation,
                  status: 'pending'
                })
                .select()
                .single();

              if (!matchError && savedMatch) {
                matches.push({
                  ...savedMatch,
                  therapist: therapist
                });
              }
            }
          } catch (parseError) {
            console.error('Error parsing match analysis for therapist:', therapist.id, parseError);
          }
        }
      } catch (error) {
        console.error('Error analyzing match for therapist:', therapist.id, error);
      }
    }

    // Sort matches by score
    matches.sort((a, b) => b.match_score - a.match_score);

    console.log(`Generated ${matches.length} matches`);

    return new Response(JSON.stringify({
      success: true,
      matches: matches.slice(0, 5) // Return top 5 matches
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-matches function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});