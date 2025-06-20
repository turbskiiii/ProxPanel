"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HardDrive, AlertTriangle, Loader2, CheckCircle } from "lucide-react"

interface VPSDetails {
  id: string
  name: string
  os: string
}

interface OSReinstallProps {
  vps: VPSDetails
}

const availableOS = [
  { value: "ubuntu-22.04", label: "Ubuntu 22.04 LTS" },
  { value: "ubuntu-20.04", label: "Ubuntu 20.04 LTS" },
  { value: "debian-11", label: "Debian 11" },
  { value: "debian-12", label: "Debian 12" },
  { value: "centos-8", label: "CentOS 8" },
  { value: "rocky-9", label: "Rocky Linux 9" },
  { value: "fedora-38", label: "Fedora 38" },
  { value: "windows-2022", label: "Windows Server 2022" },
]

export function OSReinstall({ vps }: OSReinstallProps) {
  const [selectedOS, setSelectedOS] = useState("")
  const [isReinstalling, setIsReinstalling] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [reinstallComplete, setReinstallComplete] = useState(false)

  const handleReinstall = async () => {
    setIsReinstalling(true)
    setShowConfirmDialog(false)

    try {
      // Simulate OS reinstall process
      await new Promise((resolve) => setTimeout(resolve, 5000))

      setReinstallComplete(true)

      // Reset after 5 seconds
      setTimeout(() => {
        setReinstallComplete(false)
        setSelectedOS("")
      }, 5000)
    } catch (error) {
      console.error("OS reinstall failed:", error)
    } finally {
      setIsReinstalling(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Operating System Reinstall
        </CardTitle>
        <CardDescription>Reinstall the operating system on your VPS</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {reinstallComplete && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium text-green-800">OS Reinstall Complete!</p>
                <p className="text-sm text-green-700">
                  Your VPS has been successfully reinstalled with the selected operating system. A new root password has
                  been generated and sent to your email.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Current OS: <span className="text-muted-foreground">{vps.os}</span>
            </label>
            <Select value={selectedOS} onValueChange={setSelectedOS}>
              <SelectTrigger>
                <SelectValue placeholder="Select new operating system" />
              </SelectTrigger>
              <SelectContent>
                {availableOS.map((os) => (
                  <SelectItem key={os.value} value={os.value}>
                    {os.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={!selectedOS || isReinstalling}>
                {isReinstalling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reinstalling OS...
                  </>
                ) : (
                  <>
                    <HardDrive className="mr-2 h-4 w-4" />
                    Reinstall Operating System
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Confirm OS Reinstall
                </DialogTitle>
                <DialogDescription>
                  This action will completely wipe your VPS and install a fresh operating system.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">⚠️ WARNING: This action is irreversible!</p>
                      <ul className="text-sm space-y-1 ml-4 list-disc">
                        <li>All data on the VPS will be permanently deleted</li>
                        <li>All installed software and configurations will be lost</li>
                        <li>A new root password will be generated</li>
                        <li>The VPS will be rebooted automatically</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="p-3 bg-muted rounded">
                  <p className="text-sm">
                    <strong>VPS:</strong> {vps.name}
                    <br />
                    <strong>Current OS:</strong> {vps.os}
                    <br />
                    <strong>New OS:</strong> {availableOS.find((os) => os.value === selectedOS)?.label}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReinstall}>
                  Yes, Reinstall OS
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Before reinstalling:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Backup any important data</li>
                <li>Note down any custom configurations</li>
                <li>Ensure you have alternative access methods</li>
                <li>The process may take 5-10 minutes to complete</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
