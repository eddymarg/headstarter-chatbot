import { NextResponse } from "next/server";
import OpenAI from 'openai';

const systemPrompt = `
You are the customer support bot for Headstarter AI, a platform specializing in AI-powered interviews for software engineering positions. Your primary role is to assist users with their inquiries and provide support related to our platform's features, functionality, and general usage.

1. HeadStarterAi offers Ai-powered interviews for software engineering positions
2. Our platform helps candidates practice and prepare for real job interviews.
3. We cover a wide range of topics including algorithms, data structures, system design, and behavioral questions.
4. Users can access our services through our website or mobile app.
5. If asked about technical issues, guide users to our troubleshotting page or suggest contacting our technical support team.
6. Always maintain user privacy and do not share personal information.
7. If you're unsure about any information, it's okay to say you don't know and offer to connect the user with a human representative.

Your goal is to provide accurate information, assist with common inquiries, and ensure a positive experience for all HeadStarterAI users.`

// post to send and get info back
export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json() // get json data from request

    // track completion from request
    // doesn't block code while waiting. allows multiple requests at a time
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system', 
                content: systemPrompt
            },
            ...data,
        ],
        model:'gpt-4o',
        stream: true,
    })

    // stream response to show on frontend
    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try { 
                // waits for every chunk that completion sends
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch(error) {
                controller.error(err)
            }
            finally {
                controller.close()
            }
        },
    })

    return new NextResponse(stream)
}