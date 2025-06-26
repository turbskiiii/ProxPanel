"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Server, Shield, Zap, Globe } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store user info in localStorage for client-side access
        localStorage.setItem("user-email", data.user.email)
        localStorage.setItem("user-role", data.user.role)

        // Redirect based on server response
        router.push(data.redirectUrl)
        router.refresh() // Force a refresh to update auth state
      } else {
        setError(data.error || "Login failed. Please check your credentials.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Quick login function for demo credentials
  const quickLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    // Auto-submit after setting credentials
    setTimeout(() => {
      const form = document.querySelector("form") as HTMLFormElement
      if (form) {
        form.requestSubmit()
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Server className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ProxPanel</h1>
          <p className="text-blue-200">Professional VPS Management Platform</p>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
            <CardDescription className="text-blue-200">Sign in to manage your cloud infrastructure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-500/20 border-red-500/50 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@proxpanel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="demo123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Sign In Securely
                  </>
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-blue-200">{"Don't have an account? "}</span>
                <Link
                  href="/signup"
                  className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="text-blue-200">
            <Zap className="h-6 w-6 mx-auto mb-2 text-blue-400" />
            <p className="text-xs">Lightning Fast</p>
          </div>
          <div className="text-blue-200">
            <Shield className="h-6 w-6 mx-auto mb-2 text-blue-400" />
            <p className="text-xs">Enterprise Security</p>
          </div>
          <div className="text-blue-200">
            <Globe className="h-6 w-6 mx-auto mb-2 text-blue-400" />
            <p className="text-xs">Global Network</p>
          </div>
        </div>

        {/* Demo Credentials with Quick Login */}
        <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
          <p className="text-blue-200 text-sm text-center mb-3 font-semibold">🚀 Demo Credentials</p>
          <div className="space-y-3">
            <div className="text-xs text-blue-300 bg-blue-800/30 p-3 rounded border border-blue-500/20">
              <div className="flex justify-between items-start mb-2">
                <p className="text-blue-200 font-semibold">👑 Admin Access</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-xs bg-blue-600/20 border-blue-400/30 text-blue-200 hover:bg-blue-600/40"
                  onClick={() => quickLogin("admin@proxpanel.com", "demo123")}
                  disabled={isLoading}
                >
                  Quick Login
                </Button>
              </div>
              <p>
                <strong>Email:</strong> admin@proxpanel.com
              </p>
              <p>
                <strong>Password:</strong> demo123
              </p>
            </div>
            <div className="text-xs text-blue-300 bg-blue-800/30 p-3 rounded border border-blue-500/20">
              <div className="flex justify-between items-start mb-2">
                <p className="text-blue-200 font-semibold">👤 User Access</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-xs bg-blue-600/20 border-blue-400/30 text-blue-200 hover:bg-blue-600/40"
                  onClick={() => quickLogin("demo@proxpanel.com", "demo123")}
                  disabled={isLoading}
                >
                  Quick Login
                </Button>
              </div>
              <p>
                <strong>Email:</strong> demo@proxpanel.com
              </p>
              <p>
                <strong>Password:</strong> demo123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
