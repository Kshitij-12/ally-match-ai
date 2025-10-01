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
    // Log the start of the function
    console.log('analyze-intake function started');
    
    const { intakeData } = await req.json();
    console.log('Received intake data:', JSON.stringify(intakeData, null, 2));
    
    if (!intakeData) {
      return new Response(JSON.stringify({ error: 'intakeData is required' }), {
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

    // Get environment variables with better error handling
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

    // Require authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Analyzing intake data for user:', user.id);

    // Enhanced heuristic analysis
    const heuristicAnalysis = (input: any) => {
      console.log('Using heuristic analysis fallback');
      
      const communication = String(input?.communicationStylePreference || '').toLowerCase();
      let communicationStyle = 'analytical';
      
      if (communication.includes('gentle')) communicationStyle = 'empathetic';
      else if (communication.includes('collaborative')) communicationStyle = 'supportive';
      else if (communication.includes('challenging')) communicationStyle = 'direct';

      const personalityProfile = {
        communicationStyle,
        approachPreference: 'solution-focused',
        emotionalNeed: 'medium',
        structurePreference: 'moderate'
      };

      let therapyFocus = [];
      if (Array.isArray(input?.specificConcerns)) {
        therapyFocus = input.specificConcerns.slice(0, 5);
      } else if (input?.specificConcerns) {
        therapyFocus = [input.specificConcerns];
      }

      const toneScores = {
        directness: communicationStyle === 'direct' ? 0.7 : 0.4,
        empathy: communicationStyle === 'empathetic' ? 0.8 : 0.5,
        analyticalApproach: 0.6,
        supportiveness: communicationStyle === 'supportive' ? 0.75 : 0.5
      };

      return {
        personalityProfile,
        toneScores,
        therapyFocus,
        personalityInsights: 'Heuristic-based analysis generated. Consider setting OPENAI_API_KEY for more accurate results.',
        matchingCriteria: 'Match based on communication style, therapy approach, and user preferences.'
      };
    };

    let aiAnalysis;

    // Only use OpenAI if API key is available
    if (OPENAI_API_KEY && OPENAI_API_KEY !== '') {
      console.log('Attempting OpenAI analysis...');
      
      const prompt = `
Analyze this therapy intake information and provide a JSON assessment:

Current Situation: ${intakeData?.currentSituation || 'Not specified'}
Goals: ${intakeData?.goals || 'Not specified'}
Specific Concerns: ${Array.isArray(intakeData?.specificConcerns) ? intakeData.specificConcerns.join(', ') : intakeData?.specificConcerns || 'None'}
Communication Style: ${intakeData?.communicationStylePreference || 'Not specified'}
Therapy Type: ${intakeData?.therapyTypePreference || 'Not specified'}
Previous Therapy: ${intakeData?.previousTherapy ? 'Yes' : 'No'}
Urgency: ${intakeData?.urgencyLevel || 'Not specified'}

Provide JSON with this structure:
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
  "therapyFocus": ["approach1", "approach2"],
  "personalityInsights": "brief analysis",
  "matchingCriteria": "key matching factors"
}`;

      try {
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo', // Using more available model
            messages: [
              {
                role: 'system',
                content: 'You are a clinical psychologist. Return ONLY valid JSON, no other text.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.3,
          }),
        });

        if (openAIResponse.ok) {
          const openAIData = await openAIResponse.json();
          const analysisText = openAIData.choices[0]?.message?.content;
          
          if (analysisText) {
            try {
              // Clean the response and parse JSON
              const cleanJson = analysisText.replace(/```json\n?|\n?```/g, '').trim();
              aiAnalysis = JSON.parse(cleanJson);
              console.log('OpenAI analysis successful');
            } catch (parseError) {
              console.error('JSON parse error:', parseError);
              aiAnalysis = heuristicAnalysis(intakeData);
            }
          } else {
            throw new Error('Empty response from OpenAI');
          }
        } else {
          const errorText = await openAIResponse.text();
          console.error('OpenAI API error:', openAIResponse.status, errorText);
          aiAnalysis = heuristicAnalysis(intakeData);
        }
      } catch (openAIError) {
        console.error('OpenAI request failed:', openAIError);
        aiAnalysis = heuristicAnalysis(intakeData);
      }
    } else {
      console.log('No OpenAI API key, using heuristic analysis');
      aiAnalysis = heuristicAnalysis(intakeData);
    }

    // Prepare data for database with null checks
    const intakeRecord: any = {
      user_id: user.id,
      current_situation: intakeData?.currentSituation || null,
      goals: intakeData?.goals || null,
      specific_concerns: Array.isArray(intakeData?.specificConcerns) ? 
        intakeData.specificConcerns : 
        (intakeData?.specificConcerns ? [intakeData.specificConcerns] : []),
      urgency_level: intakeData?.urgencyLevel || null,
      budget_range: intakeData?.budgetRange || null,
      session_format_preference: intakeData?.sessionFormatPreference || null,
      therapy_type_preference: intakeData?.therapyTypePreference || null,
      communication_style_preference: intakeData?.communicationStylePreference || null,
      preferred_language: intakeData?.preferredLanguage || 'English',
      previous_therapy: intakeData?.previousTherapy || false,
      preferred_gender: intakeData?.preferredGender || null,
      personality_profile: aiAnalysis.personalityProfile || {},
      ai_analysis: aiAnalysis || {}
    };

    console.log('Inserting intake record...');
    
    const { data: intakeResponse, error: insertError } = await supabase
      .from('intake_responses')
      .insert(intakeRecord)
      .select()
      .single();

    if (insertError) {
      console.error('Database insertion error:', insertError);
      // Check if it's a schema issue
      if (insertError.code === '42703') {
        throw new Error(`Database column error: ${insertError.message}. Check if all columns exist in intake_responses table.`);
      }
      throw new Error(`Failed to save intake: ${insertError.message}`);
    }

    console.log('Intake saved successfully, ID:', intakeResponse.id);

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
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
