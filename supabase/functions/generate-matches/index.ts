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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
    
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

    // Helper: simple heuristic fallback scoring when OpenAI is unavailable or fails
    const computeHeuristic = (intake: any, therapist: any) => {
      let score = 0;
      let reasons: string[] = [];

      // Communication style alignment
      if (intake.communication_style_preference && therapist.communication_style) {
        if (String(therapist.communication_style).toLowerCase().includes(String(intake.communication_style_preference).toLowerCase())) {
          score += 0.2;
          reasons.push('Communication style alignment');
        }
      }

      // Therapy type overlap
      const intakeTypes = String(intake.therapy_type_preference || '').toLowerCase().split(/[,|]/).map((s: string) => s.trim()).filter(Boolean);
      const therapistTypes: string[] = Array.isArray(therapist.therapy_types) ? therapist.therapy_types : [];
      const overlap = therapistTypes.filter((t: string) => intakeTypes.some((i) => t.toLowerCase().includes(i)));
      if (overlap.length > 0) {
        score += Math.min(0.3, 0.1 * overlap.length);
        reasons.push('Therapy approach overlap');
      }

      // Language
      const langs: string[] = Array.isArray(therapist.languages) ? therapist.languages : [];
      if (langs.some((l) => String(l).toLowerCase().includes(String(intake.preferred_language || 'english').toLowerCase()))) {
        score += 0.1;
        reasons.push('Preferred language supported');
      }

      // Budget (simple heuristic: within +/- 50 of mid of range)
      const budgetStr: string = String(intake.budget_range || '');
      const match = budgetStr.match(/\$?(\d+)\s*-\s*\$?(\d+)/);
      const hourly = Number(therapist.hourly_rate);
      if (match && hourly) {
        const lo = Number(match[1]);
        const hi = Number(match[2]);
        const mid = (lo + hi) / 2;
        const diff = Math.abs(hourly - mid);
        if (diff <= 50) {
          score += 0.15;
          reasons.push('Within budget range');
        }
      }

      // Experience boost
      const years = Number(therapist.years_experience || 0);
      if (years >= 5) {
        score += 0.1;
        reasons.push('Experienced therapist');
      }

      // Availability
      if (therapist.availability_status === 'available') {
        score += 0.05;
      }

      // Normalize to [0,1]
      score = Math.max(0, Math.min(1, score));
      return {
        matchScore: score,
        confidenceLevel: score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low',
        matchReasons: reasons,
        explanation: 'Heuristic-based match computed due to AI unavailability.'
      };
    };

    // Generate matches using OpenAI when possible for each therapist
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
        if (OPENAI_API_KEY) {
          const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
              } else {
                // No JSON in response: fallback
                const h = computeHeuristic(intakeResponse, therapist);
                const { data: savedMatch, error: matchError } = await supabase
                  .from('matches')
                  .insert({
                    user_id: user.id,
                    therapist_id: therapist.id,
                    intake_response_id: intakeResponseId,
                    match_score: h.matchScore,
                    confidence_level: h.confidenceLevel,
                    match_reasons: h.matchReasons,
                    ai_explanation: h.explanation,
                    status: 'pending'
                  })
                  .select()
                  .single();
                if (!matchError && savedMatch) {
                  matches.push({ ...savedMatch, therapist });
                }
              }
            } catch (parseError) {
              console.error('Error parsing match analysis for therapist:', therapist.id, parseError);
              const h = computeHeuristic(intakeResponse, therapist);
              const { data: savedMatch, error: matchError } = await supabase
                .from('matches')
                .insert({
                  user_id: user.id,
                  therapist_id: therapist.id,
                  intake_response_id: intakeResponseId,
                  match_score: h.matchScore,
                  confidence_level: h.confidenceLevel,
                  match_reasons: h.matchReasons,
                  ai_explanation: h.explanation,
                  status: 'pending'
                })
                .select()
                .single();
              if (!matchError && savedMatch) {
                matches.push({ ...savedMatch, therapist });
              }
            }
          } else {
            // OpenAI call failed: fallback
            const h = computeHeuristic(intakeResponse, therapist);
            const { data: savedMatch, error: matchError } = await supabase
              .from('matches')
              .insert({
                user_id: user.id,
                therapist_id: therapist.id,
                intake_response_id: intakeResponseId,
                match_score: h.matchScore,
                confidence_level: h.confidenceLevel,
                match_reasons: h.matchReasons,
                ai_explanation: h.explanation,
                status: 'pending'
              })
              .select()
              .single();
            if (!matchError && savedMatch) {
              matches.push({ ...savedMatch, therapist });
            }
          }
        } else {
          // No API key: heuristic only
          const h = computeHeuristic(intakeResponse, therapist);
          const { data: savedMatch, error: matchError } = await supabase
            .from('matches')
            .insert({
              user_id: user.id,
              therapist_id: therapist.id,
              intake_response_id: intakeResponseId,
              match_score: h.matchScore,
              confidence_level: h.confidenceLevel,
              match_reasons: h.matchReasons,
              ai_explanation: h.explanation,
              status: 'pending'
            })
            .select()
            .single();
          if (!matchError && savedMatch) {
            matches.push({ ...savedMatch, therapist });
          }
        }
      } catch (error) {
        console.error('Error analyzing match for therapist:', therapist.id, error);
        // Final fallback to ensure at least a minimal result
        const h = computeHeuristic(intakeResponse, therapist);
        const { data: savedMatch, error: matchError } = await supabase
          .from('matches')
          .insert({
            user_id: user.id,
            therapist_id: therapist.id,
            intake_response_id: intakeResponseId,
            match_score: h.matchScore,
            confidence_level: h.confidenceLevel,
            match_reasons: h.matchReasons,
            ai_explanation: h.explanation,
            status: 'pending'
          })
          .select()
          .single();
        if (!matchError && savedMatch) {
          matches.push({ ...savedMatch, therapist });
        }
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
