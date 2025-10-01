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
    console.log('generate-matches function started');
    
    const { intakeResponseId } = await req.json();
    console.log('Received intakeResponseId:', intakeResponseId);
    
    if (!intakeResponseId) {
      return new Response(JSON.stringify({ error: 'intakeResponseId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get environment variables
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

    console.log('Env check - Has OpenAI Key:', !!OPENAI_API_KEY);
    console.log('Env check - Has Supabase URL:', !!SUPABASE_URL);
    console.log('Env check - Has Supabase Anon Key:', !!SUPABASE_ANON_KEY);

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating matches for user:', user.id, 'intake:', intakeResponseId);

    // Get the intake response with AI analysis
    const { data: intakeResponse, error: intakeError } = await supabase
      .from('intake_responses')
      .select('*')
      .eq('id', intakeResponseId)
      .eq('user_id', user.id)
      .single();

    if (intakeError || !intakeResponse) {
      console.error('Intake response error:', intakeError);
      return new Response(JSON.stringify({ error: 'Intake response not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Found intake response:', intakeResponse.id);

    // Get all available therapists
    const { data: therapists, error: therapistsError } = await supabase
      .from('therapists')
      .select('*')
      .eq('availability_status', 'available');

    if (therapistsError) {
      console.error('Therapists fetch error:', therapistsError);
      return new Response(JSON.stringify({ error: `Failed to fetch therapists: ${therapistsError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${therapists?.length || 0} available therapists`);

    if (!therapists || therapists.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        matches: [],
        message: 'No available therapists found'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Enhanced heuristic matching function
    const computeHeuristicMatch = (intake: any, therapist: any) => {
      let score = 0;
      let reasons: string[] = [];

      try {
        // Communication style alignment (25% weight)
        const intakeCommStyle = String(intake?.communication_style_preference || '').toLowerCase();
        const therapistCommStyle = String(therapist?.communication_style || '').toLowerCase();
        
        if (intakeCommStyle && therapistCommStyle) {
          if (therapistCommStyle.includes(intakeCommStyle) || intakeCommStyle.includes(therapistCommStyle)) {
            score += 0.25;
            reasons.push('Communication style match');
          }
        }

        // Therapy type overlap (30% weight)
        let intakeTherapyTypes: string[] = [];
        if (Array.isArray(intake?.therapy_type_preference)) {
          intakeTherapyTypes = intake.therapy_type_preference.map((t: any) => String(t).toLowerCase());
        } else if (intake?.therapy_type_preference) {
          intakeTherapyTypes = String(intake.therapy_type_preference).toLowerCase().split(/[,|&]/).map((s: string) => s.trim()).filter(Boolean);
        }

        let therapistTherapyTypes: string[] = [];
        if (Array.isArray(therapist?.therapy_types)) {
          therapistTherapyTypes = therapist.therapy_types.map((t: any) => String(t).toLowerCase());
        } else if (therapist?.therapy_types) {
          therapistTherapyTypes = String(therapist.therapy_types).toLowerCase().split(/[,|&]/).map((s: string) => s.trim()).filter(Boolean);
        }

        const therapyOverlap = therapistTherapyTypes.filter((t: string) => 
          intakeTherapyTypes.some((i: string) => t.includes(i) || i.includes(t))
        ).length;

        if (therapyOverlap > 0) {
          score += Math.min(0.3, 0.1 * therapyOverlap);
          reasons.push(`Shared therapy approaches: ${therapyOverlap}`);
        }

        // Language compatibility (15% weight)
        const preferredLanguage = String(intake?.preferred_language || 'english').toLowerCase();
        let therapistLanguages: string[] = [];
        
        if (Array.isArray(therapist?.languages)) {
          therapistLanguages = therapist.languages.map((l: any) => String(l).toLowerCase());
        } else if (therapist?.languages) {
          therapistLanguages = String(therapist.languages).toLowerCase().split(/[,|&]/).map((s: string) => s.trim()).filter(Boolean);
        }

        if (therapistLanguages.some((lang: string) => lang.includes(preferredLanguage) || preferredLanguage.includes(lang))) {
          score += 0.15;
          reasons.push('Language compatibility');
        }

        // Budget alignment (20% weight)
        const therapistRate = Number(therapist?.hourly_rate || 0);
        const budgetStr = String(intake?.budget_range || '');
        const budgetMatch = budgetStr.match(/\$?(\d+)\s*-\s*\$?(\d+)/);
        
        if (budgetMatch && therapistRate > 0) {
          const lowBudget = Number(budgetMatch[1]);
          const highBudget = Number(budgetMatch[2]);
          
          if (therapistRate >= lowBudget && therapistRate <= highBudget) {
            score += 0.2;
            reasons.push('Within budget range');
          } else if (therapistRate <= highBudget + 20) {
            score += 0.1;
            reasons.push('Near budget range');
          }
        }

        // Experience bonus (10% weight)
        const yearsExp = Number(therapist?.years_experience || 0);
        if (yearsExp >= 5) {
          score += 0.1;
          reasons.push('Experienced therapist');
        }

        // Normalize score
        score = Math.max(0, Math.min(1, score));
        
      } catch (error) {
        console.error('Error in heuristic calculation:', error);
        // Provide a minimal score if calculation fails
        score = 0.3;
        reasons = ['Basic compatibility'];
      }

      return {
        matchScore: score,
        confidenceLevel: score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low',
        matchReasons: reasons,
        explanation: 'Algorithm-based matching using profile compatibility analysis.'
      };
    };

    // Process matches - limit to reasonable number for performance
    const therapistsToProcess = therapists.slice(0, 8); // Reduced for better performance
    const matches = [];
    
    console.log(`Processing ${therapistsToProcess.length} therapists for matching...`);

    for (const therapist of therapistsToProcess) {
      try {
        console.log(`Processing therapist: ${therapist.name || therapist.id}`);
        
        let matchResult;
        
        // Use OpenAI if available and key is set
        if (OPENAI_API_KEY && OPENAI_API_KEY !== '') {
          try {
            const matchingPrompt = `
Analyze compatibility between client and therapist:

CLIENT:
- Situation: ${intakeResponse.current_situation || 'Not specified'}
- Goals: ${intakeResponse.goals || 'Not specified'}
- Communication: ${intakeResponse.communication_style_preference || 'Not specified'}
- Therapy Preference: ${intakeResponse.therapy_type_preference || 'Not specified'}
- Budget: ${intakeResponse.budget_range || 'Not specified'}

THERAPIST:
- Name: ${therapist.name || 'Unnamed'}
- Specializations: ${Array.isArray(therapist.specializations) ? therapist.specializations.join(', ') : therapist.specializations || 'General'}
- Communication Style: ${therapist.communication_style || 'Not specified'}
- Therapy Types: ${Array.isArray(therapist.therapy_types) ? therapist.therapy_types.join(', ') : therapist.therapy_types || 'Various'}
- Experience: ${therapist.years_experience || 'Unknown'} years
- Rate: $${therapist.hourly_rate || 'Unknown'}

Provide JSON response with:
{
  "matchScore": 0.0-1.0,
  "confidenceLevel": "high|medium|low",
  "matchReasons": ["reason1", "reason2"],
  "explanation": "brief explanation"
}`;

            const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-3.5-turbo', // Use more reliable model
                messages: [
                  {
                    role: 'system',
                    content: 'You are a therapist matching expert. Return ONLY valid JSON, no other text.'
                  },
                  {
                    role: 'user',
                    content: matchingPrompt
                  }
                ],
                max_tokens: 500,
                temperature: 0.2,
              }),
            });

            if (openAIResponse.ok) {
              const openAIData = await openAIResponse.json();
              const analysisText = openAIData.choices[0]?.message?.content;
              
              if (analysisText) {
                try {
                  // Clean and parse JSON response
                  const cleanJson = analysisText.replace(/```json\n?|\n?```/g, '').trim();
                  matchResult = JSON.parse(cleanJson);
                  console.log(`OpenAI match score for ${therapist.name}: ${matchResult.matchScore}`);
                } catch (parseError) {
                  console.error('JSON parse error, using heuristic:', parseError);
                  matchResult = computeHeuristicMatch(intakeResponse, therapist);
                }
              } else {
                throw new Error('Empty OpenAI response');
              }
            } else {
              console.error('OpenAI API error, using heuristic');
              matchResult = computeHeuristicMatch(intakeResponse, therapist);
            }
          } catch (openAIError) {
            console.error('OpenAI request failed, using heuristic:', openAIError);
            matchResult = computeHeuristicMatch(intakeResponse, therapist);
          }
        } else {
          // No OpenAI key, use heuristic
          matchResult = computeHeuristicMatch(intakeResponse, therapist);
        }

        // Save match to database
        const { data: savedMatch, error: matchError } = await supabase
          .from('matches')
          .insert({
            user_id: user.id,
            therapist_id: therapist.id,
            intake_response_id: intakeResponseId,
            match_score: matchResult.matchScore,
            confidence_level: matchResult.confidenceLevel,
            match_reasons: matchResult.matchReasons,
            ai_explanation: matchResult.explanation,
            status: 'pending'
          })
          .select()
          .single();

        if (matchError) {
          console.error('Error saving match:', matchError);
          // Continue with other therapists even if one fails
          matches.push({
            therapist: therapist,
            matchScore: matchResult.matchScore,
            confidenceLevel: matchResult.confidenceLevel,
            matchReasons: matchResult.matchReasons,
            explanation: matchResult.explanation,
            error: 'Failed to save to database'
          });
        } else if (savedMatch) {
          matches.push({
            ...savedMatch,
            therapist: therapist
          });
        }
        
      } catch (error) {
        console.error(`Error processing therapist ${therapist.id}:`, error);
        // Continue with next therapist even if one fails
      }
    }

    // Sort matches by score (highest first)
    matches.sort((a: any, b: any) => (b.matchScore || 0) - (a.matchScore || 0));
    
    const topMatches = matches.slice(0, 5);
    console.log(`Generated ${topMatches.length} top matches`);

    return new Response(JSON.stringify({
      success: true,
      matches: topMatches,
      totalTherapistsProcessed: therapistsToProcess.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-matches function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
