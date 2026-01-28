import { NextRequest, NextResponse } from 'next/server'
import { VapiClient } from '@vapi-ai/server-sdk'

const vapi = new VapiClient({
  token: process.env.VAPI_API_KEY || ''
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, recipientName, assistantId } = body

    if (!phoneNumber || !recipientName) {
      return NextResponse.json(
        { error: 'Phone number and recipient name are required' },
        { status: 400 }
      )
    }

    if (!process.env.VAPI_API_KEY) {
      return NextResponse.json(
        { error: 'Vapi API key not configured' },
        { status: 500 }
      )
    }

    // Create the call using Vapi server SDK
    const callRequest: Record<string, unknown> = {
      customer: {
        number: phoneNumber,
        name: recipientName
      },
      assistantId: assistantId || process.env.VAPI_ASSISTANT_ID,
      // Override assistant settings with custom first message
      assistantOverrides: {
        firstMessage: "Hi, this is John calling from Saafi Software Services. I'm following up on your application for our Senior Software Engineer position. Do you have a few minutes to answer some questions?",
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are John, a senior technical recruiter at Saafi Software Services, a forward-thinking technology company. You are conducting an initial phone screen with a candidate who applied for a Senior Software Engineer (Full Stack) position.\n\nYour goal is to assess the candidate's communication skills, technical background, and enthusiasm for the role in a friendly, conversational, and professional manner.\n\n**Guidelines:**\n1.  **Tone**: Professional, warm, encouraging, and efficient.\n2.  **listen**: Wait for the candidate to finish speaking before responding.\n3.  **Structure of the call**:\n    *   Briefly ask about their current role and what they are looking for in their next opportunity.\n    *   Ask 1-2 high-level technical questions (e.g., \"What is your favorite part of the stack to work on?\" or \"Tell me about a challenging technical problem you solved recently.\").\n    *   Ask about their availability for a technical interview next week.\n    *   Wrap up by thanking them and letting them know the next steps.\n4.  **Constraints**: Do not promise a job offer. If asked about salary, say the range is competitive and depends on experience, typically between $140k-$180k.\n5.  **Keep it brief**: Aim for a 3-5 minute conversation.\n\n**Context**: You have already introduced yourself in the first message. Start by listening to their response or segue into the first question."
            }
          ]
        }
      }
    }

    // Use existing phone number ID if available, otherwise will need to be configured
    if (process.env.VAPI_PHONE_NUMBER_ID) {
      callRequest.phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID
    } else {
      // This will fail without a phone number - user needs to configure one
      throw new Error('VAPI_PHONE_NUMBER_ID environment variable is required. Please add a phone number ID from your Vapi dashboard.')
    }

    const callResponse = await vapi.calls.create(callRequest)

    // Handle single call vs batch response
    let callId = ''
    let callStatus = 'initiated'
    
    if ('id' in callResponse) {
      // Single call response
      callId = callResponse.id
      callStatus = callResponse.status || 'initiated'
    } else if ('results' in callResponse && callResponse.results && callResponse.results.length > 0) {
      // Batch response
      callId = callResponse.results[0]?.id || ''
      callStatus = callResponse.results[0]?.status || 'initiated'
    }

    return NextResponse.json({
      id: callId,
      status: callStatus,
      phoneNumber,
      recipientName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating Vapi call:', error)
    return NextResponse.json(
      { error: `Failed to create call: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!process.env.VAPI_API_KEY) {
      return NextResponse.json(
        { error: 'Vapi API key not configured' },
        { status: 500 }
      )
    }

    // Get recent calls from Vapi
    const calls = await vapi.calls.list({ limit })

    return NextResponse.json(calls)

  } catch (error) {
    console.error('Error fetching calls:', error)
    return NextResponse.json(
      { error: `Failed to fetch calls: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}