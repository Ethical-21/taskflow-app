"use client"

import BASE_URL from "@/lib/api-config"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import axios from "axios"

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false) // Start with sign in
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Team Member",
    department: "Engineering",
    position: "Software Engineer",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (isSignUp && (!formData.firstName || !formData.lastName)) {
      setError("Please enter your name")
      setIsLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          department: formData.department,
          position: formData.position,
        })
        if (response.status === 201) {
          setIsSignUp(false)
          setSuccess("Account created! Please sign in.")
          setFormData({
            firstName: "",
            lastName: "",
            email: formData.email, // Keep email for convenience
            password: "",
            role: "Team Member",
            department: "Engineering",
            position: "Software Engineer",
          })
        }
      } else {
        const response = await axios.post(`${BASE_URL}/api/auth/signin`, {
          email: formData.email,
          password: formData.password,
        })
        const { token, user } = response.data

        // Fix #1 & #9 — Save BOTH token AND user (with name field) to localStorage
        localStorage.setItem("authToken", token)
        localStorage.setItem("currentUser", JSON.stringify({
          ...user,
          // Ensure name is always available (backend now sends it, but double-safe)
          name: user.name || `${user.firstName} ${user.lastName}`,
        }))

        router.push("/dashboard")
      }
    } catch (err: unknown) {
      const axiosErr = err as any
      if (axiosErr?.response?.data?.message) {
        setError(axiosErr.response.data.message)
      } else {
        setError("Authentication failed. Please check your connection and try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError("")
    setSuccess("")
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError("")
    setSuccess("")
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "Team Member",
      department: "Engineering",
      position: "Software Engineer",
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-100 via-white to-orange-200 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-orange-200/30 rounded-full blur-xl"></div>
      <div className="absolute top-1/3 right-20 w-48 h-48 bg-orange-300/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-orange-100/40 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-orange-400/25 rounded-full blur-lg"></div>

      <Card className="w-full max-w-5xl h-[620px] overflow-hidden shadow-2xl rounded-3xl bg-white/95 backdrop-blur-sm border-0 relative z-10">
        <div className="flex h-full relative">
          {/* Sliding Overlay Panel */}
          <div
            className={`absolute top-0 w-1/2 h-full bg-gradient-to-br from-orange-400 via-red-400 to-red-500 transition-all duration-700 ease-in-out z-10 flex flex-col items-center justify-start pt-8 ${
              isSignUp ? "left-1/2 rounded-l-[100px]" : "left-0 rounded-r-[100px]"
            }`}
          >
            <img src="/logo.png" alt="TaskFlow Logo" className="mx-auto mt-6 mb-6 w-72 h-auto" />
            <div className="text-center text-white p-8 flex-1 flex flex-col justify-start">
              <h1 className="text-4xl font-bold mb-4">{isSignUp ? "Hello, Friend!" : "Welcome Back!"}</h1>
              <p className="text-base mb-8 opacity-90 leading-relaxed max-w-sm mx-auto">
                {isSignUp
                  ? "Enter your details and start your journey with TaskFlow"
                  : "Sign in to manage your tasks and collaborate with your team"}
              </p>
              <Button
                variant="outline"
                className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-orange-500 px-12 py-4 rounded-full font-bold text-sm tracking-wider transition-all duration-300 transform hover:scale-105 shadow-lg"
                onClick={toggleMode}
                disabled={isLoading}
              >
                {isSignUp ? "SIGN IN" : "SIGN UP"}
              </Button>
            </div>
          </div>

          {/* Sign Up Form - Left Side */}
          <div
            className={`w-1/2 flex items-center justify-center p-10 bg-white/90 backdrop-blur-sm transition-all duration-700 ${
              isSignUp ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
            }`}
          >
            <div className="w-full max-w-md space-y-1">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                <p className="text-gray-500 text-sm">Join TaskFlow to manage your projects</p>
              </div>

              {error && (
                <div className="mb-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">{error}</div>
              )}
              {success && (
                <div className="mb-3 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">{success}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input type="text" name="firstName" placeholder="First Name" value={formData.firstName}
                    onChange={handleInputChange}
                    className="px-4 py-3 bg-gray-50/80 border-0 rounded-xl focus:ring-2 focus:ring-orange-400 shadow-sm"
                    required disabled={isLoading} />
                  <Input type="text" name="lastName" placeholder="Last Name" value={formData.lastName}
                    onChange={handleInputChange}
                    className="px-4 py-3 bg-gray-50/80 border-0 rounded-xl focus:ring-2 focus:ring-orange-400 shadow-sm"
                    required disabled={isLoading} />
                </div>

                <Input type="email" name="email" placeholder="Email" value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/80 border-0 rounded-xl focus:ring-2 focus:ring-orange-400 shadow-sm"
                  required disabled={isLoading} />

                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} name="password" placeholder="Password"
                    value={formData.password} onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50/80 border-0 rounded-xl focus:ring-2 focus:ring-orange-400 shadow-sm pr-12"
                    required disabled={isLoading} />
                  <Button type="button" variant="ghost" size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                <select name="role" value={formData.role} onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/80 border-0 rounded-xl text-gray-700 focus:ring-2 focus:ring-orange-400 appearance-none cursor-pointer shadow-sm"
                  disabled={isLoading}>
                  <option value="Team Member">Team Member</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>

                <select name="department" value={formData.department} onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/80 border-0 rounded-xl text-gray-700 focus:ring-2 focus:ring-orange-400 appearance-none cursor-pointer shadow-sm"
                  disabled={isLoading} required>
                  <option value="Engineering">Engineering</option>
                </select>

                <select name="position" value={formData.position} onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/80 border-0 rounded-xl text-gray-700 focus:ring-2 focus:ring-orange-400 appearance-none cursor-pointer shadow-sm"
                  disabled={isLoading} required>
                  <option value="Software Engineer">Software Engineer</option>
                </select>

                <Button type="submit"
                  className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white rounded-full py-4 font-bold text-sm tracking-wider transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />CREATING ACCOUNT...</> : "SIGN UP"}
                </Button>
              </form>
            </div>
          </div>

          {/* Sign In Form - Right Side */}
          <div
            className={`w-1/2 flex items-center justify-center p-10 bg-white/90 backdrop-blur-sm transition-all duration-700 ml-auto ${
              !isSignUp ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
            }`}
          >
            <div className="w-full max-w-md space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
                <p className="text-gray-500 text-sm">Enter your credentials to continue</p>
              </div>

              {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">{error}</div>
              )}
              {success && (
                <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">{success}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input type="email" name="email" placeholder="Email" value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-50/80 border-0 rounded-xl focus:ring-2 focus:ring-orange-400 shadow-sm"
                  required disabled={isLoading} />

                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} name="password" placeholder="Password"
                    value={formData.password} onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-50/80 border-0 rounded-xl focus:ring-2 focus:ring-orange-400 shadow-sm pr-12"
                    required disabled={isLoading} />
                  <Button type="button" variant="ghost" size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Fix #12 - Forgot password note instead of dead link */}
                <div className="text-center">
                  <span className="text-sm text-gray-400 italic">
                    Forgot password? Please contact your administrator.
                  </span>
                </div>

                <Button type="submit"
                  className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white rounded-full py-4 font-bold text-sm tracking-wider transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />SIGNING IN...</> : "SIGN IN"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
