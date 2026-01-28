import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCallSummary(transcript: string | Array<{ role: string, content: string }>) {
    let formattedTranscript = '';

    if (Array.isArray(transcript)) {
        formattedTranscript = transcript.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    } else {
        formattedTranscript = transcript;
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that summarizes technical recruiter phone screens. Provide a concise summary of the candidate's background, key technical skills mentioned, and overall communication style. Highlight any red flags or strong positives."
                },
                {
                    role: "user",
                    content: `Here is the transcript of the call:\n\n${formattedTranscript}`
                }
            ],
            temperature: 0.7,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error generating summary:', error);
        throw new Error('Failed to generate summary');
    }
}
