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

    // Environment vars
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Init Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // ✅ Fix: explicitly pass token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating matches for user:', user.id, 'intake:', intakeResponseId);

    // Get intake response
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

    // Get therapists
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

    // 🔎 Heuristic function (unchanged from your version)
    const computeHeuristicMatch = (intake: any, therapist: any) => {
      let score = 0;
      let reasons: string[] = [];
      try {
        // Communication style
        const intakeComm = String(intake?.communication_style_preference || '').toLowerCase();
        const therapistComm = String(therapist?.communication_style || '').toLowerCase();
        if (intakeComm && therapistComm && (therapistComm.includes(intakeComm) || intakeComm.includes(therapistComm))) {
          score += 0.25;
          reasons.push('Communication style match');
        }
        // Therapy type
        let intakeTypes = Array.isArray(intake?.therapy_type_preference) ? intake.therapy_type_preference : [intake?.therapy_type_preference];
        let therapistTypes = Array.isArray(therapist?.therapy_types) ? therapist.therapy_types : [therapist?.therapy_types];
        intakeTypes = intakeTypes.filter(Boolean).map((t: any) => String(t).toLowerCase());
        therapistTypes = therapistTypes.filter(Boolean).map((t: any) => String(t).toLowerCase());
        const overlap = therapistTypes.filter((t: string) => intakeTypes.some((i: string) => t.includes(i) || i.includes(t))).length;
        if (overlap > 0) {
          score += Math.min(0.3, 0.1 * overlap);
          reasons.push(`Shared therapy approaches: ${overlap}`);
        }
        // Language
        const prefLang = String(intake?.preferred_language || 'english').toLowerCase();
        let therapistLangs = Array.isArray(therapist?.languages) ? therapist.languages : [therapist?.languages];
        therapistLangs = therapistLangs.filter(Boolean).map((l: any) => String(l).toLowerCase());
        if (therapistLangs.some((lang: string) => lang.includes(prefLang) || prefLang.includes(lang))) {
          score += 0.15;
          reasons.push('Language compatibility');
        }
        // Budget
        const rate = Number(therapist?.hourly_rate || 0);
        const budgetMatch = String(intake?.budget_range || '').match(/\$?(\d+)\s*-\s*\$?(\d+)/);
        if (budgetMatch && rate > 0) {
          const low = Number(budgetMatch[1]);
          const high = Number(budgetMatch[2]);
          if (rate >= low && rate <= high) {
            score += 0.2;
            reasons.push('Within budget range');
          } else if (rate <= high + 20) {
            score += 0.1;
            reasons.push('Near budget range');
          }
        }
        // Experience
        if (Number(therapist?.years_experience || 0) >= 5) {
          score += 0.1;
          reasons.push('Experienced therapist');
        }
        score = Math.max(0, Math.min(1, score));
      } catch (e) {
        console.error('Heuristic error:', e);
        score = 0.3;
        reasons = ['Basic compatibility'];
      }
      return { matchScore: score, confidenceLevel: score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low', matchReasons: reasons, explanation: 'Algorithm-based heuristic compatibility' };
    };

    const therapistsToProcess = therapists.slice(0, 8); 
    const matches = [];

    for (const therapist of therapistsToProcess) {
      let matchResult = computeHeuristicMatch(intakeResponse, therapist);
      if (OPENAI_API_KEY) {
        try {
          const prompt = `
Compare client and therapist compatibility:

CLIENT: ${JSON.stringify(intakeResponse)}
THERAPIST: ${JSON.stringify(therapist)}

Respond ONLY in JSON:
{
  "matchScore": 0.0-1.0,
  "confidenceLevel": "high|medium|low",
  "matchReasons": ["reason1", "reason2"],
  "explanation": "short explanation"
}`;
          const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'gpt-4o-mini', // or "gpt-3.5-turbo"
              messages: [
                { role: 'system', content: 'You are a therapist matching expert. Output ONLY valid JSON.' },
                { role: 'user', content: prompt }
              ],
              max_tokens: 500,
              temperature: 0.2,
            }),
          });
          if (aiRes.ok) {
            const data = await aiRes.json();
            const content = data.choices[0]?.message?.content;
            if (content) {
              const cleanJson = content.replace(/```json\n?|\n?```/g, '').trim();
              matchResult = JSON.parse(cleanJson);
            }
          }
        } catch (err) {
          console.error('AI fallback to heuristic:', err);
        }
      }

      // Save match
      const { data: saved, error: saveErr } = await supabase
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

      matches.push(saved || { therapist, ...matchResult, error: saveErr?.message });
    }

    matches.sort((a: any, b: any) => (b.match_score || b.matchScore || 0) - (a.match_score || a.matchScore || 0));

    return new Response(JSON.stringify({ success: true, matches: matches.slice(0, 5), totalTherapistsProcessed: therapistsToProcess.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error in generate-matches:', err);
    return new Response(JSON.stringify({ error: err.message || 'Unknown error', success: false }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
