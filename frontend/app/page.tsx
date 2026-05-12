"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AuthPage from "@/components/auth-page"

export default function HomePage() {
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    const token = localStorage.getItem("authToken")
    if (savedUser && token) {
      // Already logged in — go straight to dashboard
      router.push("/dashboard")
    } else {
      setChecking(false)
    }
  }, [router])

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return <AuthPage />
}
