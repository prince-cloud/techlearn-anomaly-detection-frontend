import axios from "axios"

export const CHATBOT_URL = '/core/chat/'

export interface ChatbotResponse {
  user: string;
  userMsg: string;
  botMsg: string;
  dateCreated: string;
}

export async function messageChatbot(sessionId: string, message: string): Promise<ChatbotResponse[]> {
  if (!sessionId) return []

  const response = await axios.post(`/api/chatbot/${sessionId}`, { message })

  return response.data
}

export async function getChatbotHistory(sessionId: string): Promise<ChatbotResponse[]> {
  if (!sessionId) return []

  const response = await axios.get(`/api/chatbot/${sessionId}/history`)

  return response.data
}
