"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, RefreshCw, AlertTriangle, Loader2, CheckCircle } from "lucide-react"

interface VPSDetails {
  id: string
  name: string
  rootPassword?: string
}

interface VPSActionsProps {
  vps: VPSDetails
}

export function VPSActions({ vps }: VPSActionsProps) {
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleResetPassword = async () => {
    setIsResettingPassword(true)

    try {
      // Simulate API call to Proxmox to reset password
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Generate new password (in real app, this would come from the API)
      const generatedPassword = `VPS-${Math.random().toString(36).substring(2, 15)}`
      setNewPassword(generatedPassword)
      setShowSuccess(true)

      // Hide success message after 10 seconds
      setTimeout(() => {
        setShowSuccess(false)
        setNewPassword(null)
      }, 10000)
    } catch (error) {
      console.error("Password reset failed:", error)
    } finally {
      setIsResettingPassword(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          VPS Actions
        </CardTitle>
        <CardDescription>Additional management actions for your VPS</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSuccess && newPassword && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-green-800">Password reset successful!</p>
                <p className="text-sm text-green-700">
                  New root password: <code className="bg-green-100 px-1 rounded">{newPassword}</code>
                </p>
                <p className="text-xs text-green-600">
                  Please save this password securely. This message will disappear in 10 seconds.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleResetPassword}
            disabled={isResettingPassword}
            variant="outline"
            className="w-full justify-start"
          >
            {isResettingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
            {isResettingPassword ? "Resetting Password..." : "Reset Root Password"}
          </Button>

          <Button variant="outline" className="w-full justify-start" disabled>
            <RefreshCw className="mr-2 h-4 w-4" />
            Backup VPS (Coming Soon)
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Important Notes:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Password reset will generate a new random password</li>
                <li>You will need to reconnect with the new password</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
