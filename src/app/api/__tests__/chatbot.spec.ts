/**
 * @jest-environment node
 */

import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import * as chatbotHandler from '@/app/api/chatbot/[session]/route'
import { NextRequest } from 'next/server'
import { CFG } from '../../../envConfig'

const mockAxios = new AxiosMockAdapter(axios)

describe("Chatbot API Tests", () => {
  test("Sends a message to the chatbot and gets a reply", async () => {
    const dateCreated = new Date().toISOString()

    const mockedResponse = [{
      user: 'user',
      bot_msg: "Hello, how can I assist you today?",
      user_msg: "What is the weather like?",
      date_created: dateCreated,
    }]

    const convertedReply = [{
      user: 'user',
      botMsg: "Hello, how can I assist you today?",
      userMsg: "What is the weather like?",
      dateCreated,
    }]

    mockAxios.onPost().replyOnce(200, mockedResponse)

    const res = await chatbotHandler.POST(new NextRequest(`${CFG.NEXTAUTH_URL}/api/file`, { method: 'POST', body: JSON.stringify({}) }), { params: Promise.resolve({ session: "session-id" }) })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual(convertedReply)
  })
})
