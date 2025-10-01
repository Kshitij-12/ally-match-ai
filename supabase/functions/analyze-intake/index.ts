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
    const { intakeData } = await req.json();
    const authHeader = req.headers.get('Authorization')!;
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Require authenticated user (JWT forwarded from client)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('Analyzing intake data for user:', user.id);
    
    // Helper: heuristic analysis when OpenAI is unavailable or fails
    const heuristicAnalysis = (input: any) => {
      const communication = String(input.communicationStylePreference || '').toLowerCase();
      const personalityProfile = {
        communicationStyle: communication === 'gentle' ? 'empathetic' : communication === 'collaborative' ? 'supportive' : communication === 'challenging' ? 'direct' : 'analytical',
        approachPreference: 'solution-focused',
        emotionalNeed: 'medium',
        structurePreference: 'moderate'
      };
      const therapyFocus = Array.isArray(input.specificConcerns) ? input.specificConcerns.slice(0, 5) : [];
      const toneScores = {
        directness: personalityProfile.communicationStyle === 'direct' ? 0.7 : 0.4,
        empathy: personalityProfile.communicationStyle === 'empathetic' ? 0.8 : 0.5,
        analyticalApproach: 0.6,
        supportiveness: personalityProfile.communicationStyle === 'supportive' ? 0.75 : 0.5
      };
      return {
        personalityProfile,
        toneScores,
        therapyFocus,
        personalityInsights: 'Heuristic-based analysis generated due to AI unavailability. Results provide a reasonable starting point.',
        matchingCriteria: 'Match on communication style preference, therapy approach overlap, language, budget, and experience.'
      };
    };

    // Prepare OpenAI prompt for personality analysis
    const prompt = `
Analyze the following therapy intake information and provide a detailed personality and communication style assessment:

Current Situation: ${intakeData.currentSituation}
Goals: ${intakeData.goals}
Specific Concerns: ${intakeData.specificConcerns?.join(', ') || 'None specified'}
Communication Style Preference: ${intakeData.communicationStylePreference}
Therapy Type Preference: ${intakeData.therapyTypePreference}
Previous Therapy: ${intakeData.previousTherapy ? 'Yes' : 'No'}
Urgency Level: ${intakeData.urgencyLevel}

Based on this information, provide a JSON response with the following structure:
{
  "personalityProfile": {
    "communicationStyle": "direct|empathetic|analytical|supportive",
    "approachPreference": "solution-focused|exploratory|cognitive|behavioral",
    "emotionalNeed": "high|medium|low",
    "structurePreference": "structured|flexible|moderate"
  },
  "toneScores": {
    "directness": 0.0-1.0,
    "empathy": 0.0-1.0,
    "analyticalApproach": 0.0-1.0,
    "supportiveness": 0.0-1.0
  },
  "therapyFocus": [list of relevant therapy approaches],
  "personalityInsights": "detailed analysis of the user's personality and therapeutic needs",
  "matchingCriteria": "key factors for finding the right therapist match"
}

Ensure all scores are between 0.0 and 1.0, with higher scores indicating stronger preference for that trait.`;

    let aiAnalysis;
    if (OPENAI_API_KEY) {
      // Call OpenAI API
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
              content: 'You are an expert clinical psychologist specializing in personality assessment and therapist matching. Provide accurate, professional analysis based on intake information.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.3,
        }),
      });

      if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();
        console.error('OpenAI API error:', errorText);
        aiAnalysis = heuristicAnalysis(intakeData);
      } else {
        const openAIData = await openAIResponse.json();
        const analysisText = openAIData.choices[0].message.content;
        console.log('OpenAI analysis response:', analysisText);
        try {
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            aiAnalysis = JSON.parse(jsonMatch[0]);
          } else {
            aiAnalysis = JSON.parse(analysisText);
          }
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError, '\nRaw response:', analysisText);
          aiAnalysis = heuristicAnalysis(intakeData);
        }
      }
    } else {
      // No API key configured; use heuristic
      aiAnalysis = heuristicAnalysis(intakeData);
    }

    // Save intake response to database
    // Ensure specificConcerns is always an array of strings
    let specificConcerns = intakeData.specificConcerns;
    if (!Array.isArray(specificConcerns)) {
      specificConcerns = typeof specificConcerns === 'string' && specificConcerns.length > 0 ? [specificConcerns] : [];
    }

    const { data: intakeResponse, error: insertError } = await supabase
      .from('intake_responses')
      .insert({
        user_id: user.id,
        current_situation: intakeData.currentSituation,
        goals: intakeData.goals,
        specific_concerns: specificConcerns,
        urgency_level: intakeData.urgencyLevel,
        budget_range: intakeData.budgetRange,
        session_format_preference: intakeData.sessionFormatPreference,
        therapy_type_preference: intakeData.therapyTypePreference,
        communication_style_preference: intakeData.communicationStylePreference,
        preferred_language: intakeData.preferredLanguage || 'English',
        previous_therapy: intakeData.previousTherapy,
        preferred_gender: intakeData.preferredGender,
        personality_profile: aiAnalysis.personalityProfile,
        ai_analysis: aiAnalysis
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insertion error:', insertError);
      throw new Error(`Failed to save intake response: ${insertError.message}`);
    }

    console.log('Intake response saved successfully:', intakeResponse.id);

    return new Response(JSON.stringify({
      success: true,
      intakeResponseId: intakeResponse.id,
      analysis: aiAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-intake function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
