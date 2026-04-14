// supabase/functions/extract-paper-data/index.ts
// Uses Google Gemini 1.5 Flash — completely FREE, no credit card needed
// Get free API key: https://aistudio.google.com/apikey
// Deploy: supabase functions deploy extract-paper-data
// Set key: supabase secrets set GEMINI_API_KEY=your_key_here

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROMPT = `You are analyzing a competitive exam result screenshot (SSC, UPSC, IBPS, RRB, NEET, JEE, CAT, etc.).

Extract ALL visible data and return ONLY a valid JSON object with this exact structure (use null for any field not visible):

{
  "name": "exam name and year if visible, e.g. SSC CGL 2025 Tier I",
  "type": "mock or pyp",
  "score": number or null,
  "max_score": number or null,
  "total_questions": number or null,
  "attempted": number or null,
  "correct_answers": number or null,
  "incorrect_answers": number or null,
  "percentile": number or null,
  "rank": number or null,
  "rank_out_of": number or null,
  "total_time": number or null (minutes),
  "cutoff": number or null,
  "date": "YYYY-MM-DD" or null,
  "sections": [
    {
      "name": "section name",
      "score": number,
      "max_score": number,
      "attempted": number,
      "total_questions": number,
      "correct": number,
      "incorrect": number,
      "time_taken": number or null (minutes)
    }
  ]
}

Rules:
- sections should be [] if no section data is visible
- Decimal values like 40.5 are valid (negative marking)
- Return ONLY the JSON, no explanation, no markdown backticks`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageBase64, mediaType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Gemini 1.5 Flash — free tier, supports vision
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mediaType || 'image/jpeg',
                    data: imageBase64,
                  },
                },
                { text: PROMPT },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,      // Low temperature = more consistent output
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${err}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiData = await response.json();

    // Extract text from Gemini response
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // Strip any markdown code fences if present
    const clean = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    let extracted;
    try {
      extracted = JSON.parse(clean);
    } catch {
      // Try to extract JSON from the response if wrapped in text
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          extracted = JSON.parse(match[0]);
        } catch {
          return new Response(
            JSON.stringify({ error: 'Could not parse response', raw: text }),
            { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'No JSON found in response', raw: text }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ data: extracted }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
