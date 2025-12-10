"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Send, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatWindowProps {
  isOpen: boolean
  onClose: () => void
  recipient: {
    name: string
    avatar: string
  }
}

const mockMessages = [
  {
    id: "1",
    sender: "helper",
    text: "Hi! I saw your plumbing job. I can help you with that. When would be a good time?",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    sender: "me",
    text: "Great! Would today at 2 PM work for you?",
    timestamp: "10:32 AM",
  },
  {
    id: "3",
    sender: "helper",
    text: "Perfect! I will be there at 2 PM. Please make sure the area under the sink is accessible.",
    timestamp: "10:35 AM",
  },
  {
    id: "4",
    sender: "me",
    text: "Will do. See you then!",
    timestamp: "10:36 AM",
  },
]

export function ChatWindow({ isOpen, onClose, recipient }: ChatWindowProps) {
  const [messages, setMessages] = useState(mockMessages)
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const newMessage = {
      id: String(messages.length + 1),
      sender: "me",
      text: inputValue,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, newMessage])
    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Desktop View */}
      <div className="fixed bottom-0 right-4 z-50 hidden w-96 animate-fade-in-up md:block">
        <div className="overflow-hidden rounded-t-lg border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-primary p-4 text-primary-foreground">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary-foreground/20">
                <AvatarImage src={recipient.avatar || "/placeholder.svg"} />
                <AvatarFallback>{recipient.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{recipient.name}</p>
                <p className="text-xs opacity-80">Online</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full p-1 transition-colors hover:bg-primary-foreground/20">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-96 space-y-4 overflow-y-auto bg-muted/30 p-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.sender === "me" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg p-3 shadow-sm",
                    message.sender === "me" ? "bg-primary text-primary-foreground" : "bg-card",
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      message.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center space-x-2 border-t border-border bg-card p-4">
            <button className="text-muted-foreground transition-colors hover:text-primary">
              <Paperclip className="h-5 w-5" />
            </button>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon" className="transition-transform hover:scale-105">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile View - Full Screen */}
      <div className="fixed inset-0 z-50 flex flex-col bg-background md:hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-primary p-4 text-primary-foreground">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary-foreground/20">
              <AvatarImage src={recipient.avatar || "/placeholder.svg"} />
              <AvatarFallback>{recipient.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold">{recipient.name}</p>
              <p className="text-xs opacity-80">Online</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1 transition-colors hover:bg-primary-foreground/20">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto bg-muted/30 p-4">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex", message.sender === "me" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-lg p-3 shadow-sm",
                  message.sender === "me" ? "bg-primary text-primary-foreground" : "bg-card",
                )}
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className={cn(
                    "mt-1 text-xs",
                    message.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center space-x-2 border-t border-border bg-card p-4">
          <button className="text-muted-foreground transition-colors hover:text-primary">
            <Paperclip className="h-5 w-5" />
          </button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon" className="transition-transform hover:scale-105">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  )
}
