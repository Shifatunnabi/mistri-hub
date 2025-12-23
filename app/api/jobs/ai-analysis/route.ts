import { NextRequest, NextResponse } from "next/server"
import { Groq } from "groq-sdk"
import connectDB from "@/lib/mongodb"
import Job from "@/models/Job"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { jobId, title, description } = await req.json()

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    await connectDB()

    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Use provided title/description or fetch from job
    const jobTitle = title || job.title
    const jobDescription = description || job.description

    // Construct the prompt for GROQ AI
    const systemPrompt = `You are a helpful assistant that analyzes problems and provides step-by-step solutions. 
When given a problem, you must respond ONLY with a valid JSON object in this exact format:
{
  "problemAnalysis": "one line analysis of the problem",
  "steps": [
    {"order": "Step 1: Short title (3-4 words)", "description": "Brief description of this step"},
    {"order": "Step 2: Short title (3-4 words)", "description": "Brief description of this step"},
    {"order": "Step 3: Short title (3-4 words)", "description": "Brief description of this step"}
  ],
  "budget": "xxx-xxxx BDT"
}

Provide up to 5 steps. Budget should be a range in BDT (Bangladeshi Taka), also as this is repair service do not push the limit higher than 5000 BDT, and for each problem try to suggest different range. Do not include any other text, only the JSON.`

    const userPrompt = `Job Title: ${jobTitle}

Job Description: ${jobDescription}

Please analyze this problem and provide a solution in the specified JSON format.`

    // Call GROQ API
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
    })

    const aiResponse = chatCompletion.choices[0]?.message?.content || ""

    // Parse JSON response
    let aiAnalysis
    try {
      // Try to extract JSON from response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse
      aiAnalysis = JSON.parse(jsonString)

      // Validate the structure
      if (!aiAnalysis.problemAnalysis || !aiAnalysis.steps || !aiAnalysis.budget) {
        throw new Error("Invalid AI response structure")
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse)
      // Provide fallback analysis
      aiAnalysis = {
        problemAnalysis: "Unable to generate automatic analysis. Please consult with a professional.",
        steps: [
          {
            order: "Step 1: Assess the situation",
            description: "Carefully examine the problem area and identify the root cause.",
          },
          {
            order: "Step 2: Gather tools",
            description: "Collect all necessary tools and materials for the job.",
          },
          {
            order: "Step 3: Consult professional",
            description: "Consider hiring a verified helper for best results.",
          },
        ],
        budget: "Varies based on problem complexity",
      }
    }

    // Update job with AI analysis
    job.aiAnalysis = aiAnalysis
    await job.save()

    return NextResponse.json(
      {
        message: "AI analysis generated successfully",
        aiAnalysis: aiAnalysis,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error generating AI analysis:", error)
    return NextResponse.json({ error: "Failed to generate AI analysis" }, { status: 500 })
  }
}
