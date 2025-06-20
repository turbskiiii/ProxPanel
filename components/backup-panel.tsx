"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Database, Calendar, Download, Play, Settings, Clock, HardDrive, CheckCircle, Loader2 } from "lucide-react"

interface VPSDetails {
  backups: {
    enabled: boolean
    lastBackup: string
    count: number
    schedule: string
    retention: number
  }
}

interface BackupPanelProps {
  vps: VPSDetails
}

export function BackupPanel({ vps }: BackupPanelProps) {
  const [backupEnabled, setBackupEnabled] = useState(vps.backups.enabled)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)
    // Simulate backup creation
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsCreatingBackup(false)
  }

  // Mock backup history
  const backupHistory = [
    {
      id: 1,
      name: "auto-backup-2024-01-20-03-00",
      date: "2024-01-20 03:00:15 UTC",
      size: "2.3 GB",
      type: "Automatic",
      status: "Completed",
    },
    {
      id: 2,
      name: "auto-backup-2024-01-19-03-00",
      date: "2024-01-19 03:00:12 UTC",
      size: "2.2 GB",
      type: "Automatic",
      status: "Completed",
    },
    {
      id: 3,
      name: "manual-backup-2024-01-18-14-30",
      date: "2024-01-18 14:30:45 UTC",
      size: "2.1 GB",
      type: "Manual",
      status: "Completed",
    },
    {
      id: 4,
      name: "auto-backup-2024-01-18-03-00",
      date: "2024-01-18 03:00:08 UTC",
      size: "2.1 GB",
      type: "Automatic",
      status: "Completed",
    },
    {
      id: 5,
      name: "auto-backup-2024-01-17-03-00",
      date: "2024-01-17 03:00:11 UTC",
      size: "2.0 GB",
      type: "Automatic",
      status: "Completed",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Backup Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backup Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backupEnabled ? (
                <span className="text-green-600">Enabled</span>
              ) : (
                <span className="text-red-600">Disabled</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{vps.backups.count} backups available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(vps.backups.lastBackup).toLocaleDateString()}</div>
            <p className="text-xs text-muted-foreground">{new Date(vps.backups.lastBackup).toLocaleTimeString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">11.2 GB</div>
            <p className="text-xs text-muted-foreground">Across {vps.backups.count} backups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vps.backups.retention} days</div>
            <p className="text-xs text-muted-foreground">Auto-delete policy</p>
          </CardContent>
        </Card>
      </div>

      {/* Backup Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Backup Configuration
          </CardTitle>
          <CardDescription>Configure automatic backup settings for your VPS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="backup-enabled" className="text-base">
                Automatic Backups
              </Label>
              <p className="text-sm text-muted-foreground">Enable scheduled automatic backups of your VPS</p>
            </div>
            <Switch id="backup-enabled" checked={backupEnabled} onCheckedChange={setBackupEnabled} />
          </div>

          {backupEnabled && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="backup-schedule">Backup Schedule</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily at 3:00 AM</SelectItem>
                      <SelectItem value="weekly">Weekly (Sunday 3:00 AM)</SelectItem>
                      <SelectItem value="monthly">Monthly (1st day 3:00 AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-retention">Retention Period</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue placeholder="Select retention" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="compress-backups" defaultChecked />
                <Label htmlFor="compress-backups">Compress backups to save storage space</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="encrypt-backups" defaultChecked />
                <Label htmlFor="encrypt-backups">Encrypt backups for enhanced security</Label>
              </div>

              <Button>Save Configuration</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Manual Backup
          </CardTitle>
          <CardDescription>Create an immediate backup of your VPS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Create Backup Now</h4>
              <p className="text-sm text-muted-foreground">
                This will create a full system backup that you can restore later
              </p>
            </div>
            <Button onClick={handleCreateBackup} disabled={isCreatingBackup}>
              {isCreatingBackup ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Create Backup
                </>
              )}
            </Button>
          </div>

          {isCreatingBackup && (
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="font-medium">Backup in Progress</span>
              </div>
              <Progress value={65} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Creating backup snapshot... This may take several minutes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup History
          </CardTitle>
          <CardDescription>View and manage your backup snapshots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{backup.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{backup.date}</span>
                      <span>•</span>
                      <span>{backup.size}</span>
                      <span>•</span>
                      <Badge variant={backup.type === "Automatic" ? "secondary" : "outline"}>{backup.type}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Restore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
