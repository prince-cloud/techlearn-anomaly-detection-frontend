import React, { useEffect, useRef, useState } from "react"
import {
  LdsChat,
  LdsChatMessageBot,
  LdsChatMessage,
  LdsPromptInput
} from "@elilillyco/ux-lds-react"
import { messageChatbot } from "../app/api/chatbot"
import { LdsLoadingSpinner, LdsButton } from "@elilillyco/ux-lds-react"

export interface ChatbotEntry {
  type: "query" | "reply";
  message: string;
}

interface Props {
  sessionGuid: string;
  initConversation?: ChatbotEntry[]; // Use for testing purposes only
}

export default function Chatbot({ sessionGuid, initConversation }: Props) {
  const [ chatbotConversation, setChatbotConversation ] = useState<ChatbotEntry[]>([])
  const [ isChatting, setIsChatting ] = useState(true) // Disable until session ID is retrieved
  const [ chatbotText, setChatbotText ] = useState('')
  const promptInputRef = useRef(null)

  useEffect(() => {
    setIsChatting(true)
    if (!sessionGuid) return

    setChatbotConversation(initConversation ?? [])
    setIsChatting(false)
  }, [ sessionGuid, initConversation ])

  async function sendToChatbot() {
    if (!chatbotText.trim()) return

    setIsChatting(true)
    const message = `${chatbotText}`
    setChatbotText('')

    const chatToAdd: ChatbotEntry[] = [
      {
        type: 'query',
        message: chatbotText
      }
    ]

    setChatbotConversation([
      ...chatbotConversation,
      ...chatToAdd
    ])

    const responses = await messageChatbot(sessionGuid, message)
    const latestResponse = responses.shift() // This returns a history so we take the most recent entry

    chatToAdd.push({
      type: 'reply',
      message: latestResponse?.botMsg ?? ''
    })

    setChatbotConversation([
      ...chatbotConversation,
      ...chatToAdd
    ])
    setIsChatting(false)

    return sessionGuid
  }

  return (
    <div className="chatbot-area">
      <LdsChat>
        <LdsChat.Messages>
          {
            chatbotConversation.map((entry, index) => {
              const { type, message } = entry

              if (type === 'reply') {
                return <LdsChatMessageBot key={index}><LdsChatMessageBot.Text>{message}</LdsChatMessageBot.Text></LdsChatMessageBot>
              }

              return <LdsChatMessage key={index}><LdsChatMessage.Text>{message}</LdsChatMessage.Text></LdsChatMessage>
            })
          }

          {isChatting && <div><LdsLoadingSpinner iconName="sparkle-fill" className="primary" /> Generating Response</div>}
        </LdsChat.Messages>

        <LdsChat.Footer>
          <LdsPromptInput
            borderRadius="pill"
            inputAriaLabel="Prompt Input for Chatbot"
            inputId="prompt-input"
            inputPlaceholder="Ask a question"
            layout="multiline"
            showDivider={false}
            textValue={chatbotText}
            setTextValue={setChatbotText}
            ref={promptInputRef}
            onSubmit={sendToChatbot}
          >
            <LdsButton
              className="pill"
              disabled={!chatbotText.trim() || isChatting}
              icon="PaperPlaneTiltFill"
              iconOnly
              onClick={sendToChatbot}
            />
          </LdsPromptInput>
        </LdsChat.Footer>
      </LdsChat>
    </div>
  )
}
