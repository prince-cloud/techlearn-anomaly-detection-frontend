import React from "react"
import { fireEvent, render } from "@testing-library/react"
import Chatbot, { ChatbotEntry } from "../Chatbot"
import * as ChatbotApi from "@/app/api/chatbot"
jest.mock('@/app/api/chatbot', () => ({
  __esModule: true,
  ...jest.requireActual('@/app/api/chatbot')
}))

describe("Chatbot test", () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })

    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }))
  })

  test("Displays interactive chatbot window", () => {
    const { container } = render(
      <Chatbot sessionGuid="test" />
    )

    expect(container.querySelector('#prompt-input')).toBeTruthy()
    expect(container.querySelector('button')).toBeTruthy()
    expect(container.querySelector('.lds-chat')).toBeTruthy()
    expect(container.querySelector('.lds-chat .messages')).toBeTruthy()
    expect(container.querySelector('.lds-chat .footer')).toBeTruthy()
  })

  test("Displays chatbot window with messages", () => {
    const chatbotConversation: ChatbotEntry[] = [
      {
        message: "Hello, how can I help you?",
        type: "reply"
      }, {
        message: "I need help with a product",
        type: "query"
      }, {
        message: "What product do you need help with?",
        type: "reply"
      }, {
        message: "I need help with product A",
        type: "query"
      }
    ]

    const { container, getByText } = render(
      <Chatbot sessionGuid="test" initConversation={chatbotConversation} />
    )

    expect(container.querySelector('.lds-chat .messages')).toBeTruthy()
    expect(container.querySelector('.lds-chat .messages .lds-chat-message-bot')).toBeTruthy()
    expect(container.querySelector('.lds-chat .messages .lds-chat-message')).toBeTruthy()
    expect(getByText(/Hello, how can I help you?/i)).toBeTruthy()
    expect(getByText(/I need help with a product/i)).toBeTruthy()
    expect(getByText(/What product do you need help with?/i)).toBeTruthy()
    expect(getByText(/I need help with product A/i)).toBeTruthy()
  })

  test("Sends a message to the chatbot", () => {
    const spy = jest.spyOn(ChatbotApi, 'messageChatbot')

    const { container, getByText } = render(
      <Chatbot sessionGuid="test" />
    )

    const textarea = container.querySelector('#prompt-input')
    const button = container.querySelector('.button-area button')

    expect(textarea).toBeTruthy()
    expect(button).toBeTruthy()

    if (!textarea || !button) return

    fireEvent.change(textarea, { target: { value: 'Hello' } })
    fireEvent.click(button)

    expect(getByText(/Hello/i)).toBeTruthy()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith("test", "Hello")
  })
})
