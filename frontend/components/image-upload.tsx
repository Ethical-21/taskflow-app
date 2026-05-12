"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X, Camera } from "lucide-react"

interface ImageUploadProps {
  currentImage?: string
  onImageChange: (imageUrl: string) => void
  userName: string
}

export default function ImageUpload({ currentImage, onImageChange, userName }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreview(result)
        onImageChange(result)
      }
      reader.readAsDataURL(file)
    } else {
      alert("Please select a valid image file")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const removeImage = () => {
    setPreview(null)
    onImageChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Current Avatar Display */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          {preview ? (
            <AvatarImage src={preview || "/placeholder.svg"} alt={userName} className="object-cover" />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xl">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h3 className="font-medium text-gray-900">{userName}</h3>
          <p className="text-sm text-gray-500">{preview ? "Custom profile picture" : "Default avatar"}</p>
        </div>
      </div>

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-all duration-200 ${
          isDragging ? "border-orange-400 bg-orange-50" : "border-gray-300 hover:border-orange-300"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <div
              className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                isDragging ? "bg-orange-100" : "bg-gray-100"
              }`}
            >
              <Upload className={`h-6 w-6 ${isDragging ? "text-orange-600" : "text-gray-400"}`} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                Drop your image here, or{" "}
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="text-orange-600 hover:text-orange-700 underline"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500">Supports: JPG, PNG, GIF (max 5MB)</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button type="button" variant="outline" onClick={openFileDialog} className="flex-1 bg-transparent">
          <Camera className="mr-2 h-4 w-4" />
          Choose Photo
        </Button>

        {preview && (
          <Button
            type="button"
            variant="outline"
            onClick={removeImage}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
          >
            <X className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}
