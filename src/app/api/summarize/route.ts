import { NextRequest, NextResponse } from 'next/server';
import { generateCallSummary } from '@/lib/openai';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { transcript } = body;

        if (!transcript) {
            return NextResponse.json(
                { error: 'Transcript is required' },
                { status: 400 }
            );
        }

        const summary = await generateCallSummary(transcript);

        return NextResponse.json({ summary });
    } catch (error) {
        console.error('Error in summarize route:', error);
        return NextResponse.json(
            { error: 'Failed to generate summary' },
            { status: 500 }
        );
    }
}
