"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get callback URL from query params or default to dashboard
      const urlParams = new URLSearchParams(window.location.search)
      const callbackUrl = urlParams.get('callbackUrl') || '/dashboard'
      const isExtensionLogin = urlParams.get('extension') === 'true'

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: callbackUrl,
      })

      if (result?.error) {
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: isExtensionLogin 
            ? "Logged in successfully! You can now close this tab and return to the extension."
            : "Logged in successfully",
        })

        // If this is an extension login, notify the extension and provide instructions
        if (isExtensionLogin) {
          // Send a message to any listening extension content scripts
          try {
            window.postMessage({ 
              type: 'PROFYLE_LOGIN_SUCCESS',
        source: 'profyle-web-app'
            }, '*')
            
            // Also store a flag in localStorage that the extension can check
            localStorage.setItem('profyle-extension-login-success', Date.now().toString())
            
            // Wait a moment then redirect to ensure extension has time to detect the login
            setTimeout(() => {
              router.push('/dashboard?extension-login=success')
            }, 1000)
          } catch (error) {
            console.error('Failed to notify extension:', error)
            router.push('/dashboard?extension-login=success')
          }
        } else {
          // Add a small delay to ensure session is properly set on mobile
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
          
          if (isMobile) {
            // On mobile, use window.location.href for better session persistence
            setTimeout(() => {
              window.location.href = callbackUrl
            }, 800)
          } else {
            // On desktop, router.push is fine
            setTimeout(() => {
              router.push(callbackUrl)
            }, 300)
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader />
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
