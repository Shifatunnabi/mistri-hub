"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Send, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface ChatWindowProps {
  isOpen: boolean
  onClose: () => void
  jobId: string
  currentUserId: string
  recipient: {
    _id: string
    name: string
    profilePhoto?: string
    averageRating: number
    isVerified: boolean
  }
}

interface Message {
  _id: string
  sender: {
    _id: string
    name: string
    profilePhoto?: string
  }
  text: string
  createdAt: string
}

export function ChatWindow({ isOpen, onClose, jobId, currentUserId, recipient }: ChatWindowProps) {
  const recipientAvatar = recipient.profilePhoto || "/placeholder.svg"
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setIsLoadingMessages(true)
      const response = await fetch(`/api/jobs/${jobId}/messages`)
      const data = await response.json()

      if (response.ok) {
        setMessages(data.messages)
      } else {
        console.error("Failed to fetch messages:", data.error)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Initial fetch and setup polling
  useEffect(() => {
    if (isOpen && jobId) {
      fetchMessages()
      
      // Poll for new messages every 3 seconds
      pollingInterval.current = setInterval(fetchMessages, 3000)
      
      return () => {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current)
        }
      }
    }
  }, [isOpen, jobId])

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return

    const messageText = inputValue.trim()
    setInputValue("")
    setIsSending(true)

    try {
      const response = await fetch(`/api/jobs/${jobId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: messageText }),
      })

      const data = await response.json()

      if (response.ok) {
        // Add the new message to the list immediately
        setMessages([...messages, data.data])
      } else {
        toast.error(data.error || "Failed to send message")
        // Restore the input value on error
        setInputValue(messageText)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
      setInputValue(messageText)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
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
                <AvatarImage src={recipientAvatar} />
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
            {isLoadingMessages && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isMyMessage = message.sender._id === currentUserId
                return (
                  <div key={message._id} className={cn("flex", isMyMessage ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-lg p-3 shadow-sm",
                        isMyMessage ? "bg-primary text-primary-foreground" : "bg-card",
                      )}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={cn(
                          "mt-1 text-xs",
                          isMyMessage ? "text-primary-foreground/70" : "text-muted-foreground",
                        )}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center space-x-2 border-t border-border bg-card p-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
              disabled={isSending}
            />
            <Button 
              onClick={handleSend} 
              size="icon" 
              className="transition-transform hover:scale-105"
              disabled={isSending || !inputValue.trim()}
            >
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
              <AvatarImage src={recipientAvatar} />
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
          {isLoadingMessages && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isMyMessage = message.sender._id === currentUserId
              return (
                <div key={message._id} className={cn("flex", isMyMessage ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg p-3 shadow-sm",
                      isMyMessage ? "bg-primary text-primary-foreground" : "bg-card",
                    )}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        isMyMessage ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center space-x-2 border-t border-border bg-card p-4">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button 
            onClick={handleSend} 
            size="icon" 
            className="transition-transform hover:scale-105"
            disabled={isSending || !inputValue.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  )
}
