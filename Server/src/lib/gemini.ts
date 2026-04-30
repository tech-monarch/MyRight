import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const PRIMARY_MODEL   = 'gemini-2.5-flash'
const FALLBACK_MODEL  = 'gemini-2.5-pro'

const primary  = genAI.getGenerativeModel({ model: PRIMARY_MODEL })
const fallback = genAI.getGenerativeModel({ model: FALLBACK_MODEL })

export const geminiModel = {
  generateContent: async (prompt: string) => {
    try {
      console.log(`[Gemini] Using ${PRIMARY_MODEL}`)
      const result = await primary.generateContent(prompt)
      return result
    } catch (err: any) {
      console.warn(`[Gemini] ${PRIMARY_MODEL} failed — switching to ${FALLBACK_MODEL}. Reason: ${err?.message}`)
      const result = await fallback.generateContent(prompt)
      return result
    }
  }
}