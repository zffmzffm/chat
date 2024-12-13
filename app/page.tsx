'use client'

import { useState, useRef, useEffect } from 'react'

// 定义消息类型
type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    const newMessages: Message[] = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages })
      })

      if (!response.ok) {
        throw new Error('API 请求失败')
      }

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content
      }

      setMessages([...newMessages, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      setMessages([
        ...newMessages,
        {
          role: 'assistant' as const,
          content: `抱歉，发生了一些错误。错误信息：${errorData.details || errorData.error}`
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <main className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="message assistant-message">
            正在思考...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入消息..."
          disabled={isLoading}
        />
        <button 
          className={`send-button ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          发送
        </button>
      </div>
    </main>
  )
}
