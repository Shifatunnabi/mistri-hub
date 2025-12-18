"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"

interface CreatePostSectionProps {
  userAvatar?: string
  userName?: string
  onCreateClick: () => void
}

export function CreatePostSection({ userAvatar, userName, onCreateClick }: CreatePostSectionProps) {
  const initials = userName ? userName.substring(0, 2).toUpperCase() : "U"

  return (
    <Card className="mb-6 p-6 shadow-lg animate-fade-in-up">
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={userAvatar || "/placeholder.svg?key=currentuser"} />
          <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
        <Button
          onClick={onCreateClick}
          variant="outline"
          className="flex-1 justify-start text-muted-foreground transition-all duration-300 hover:scale-[1.02] hover:bg-background"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Need help? Post a job...
        </Button>
      </div>
    </Card>
  )
}
