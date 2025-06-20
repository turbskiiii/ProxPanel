"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Power,
  RotateCcw,
  Square,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Activity,
  Network,
  Shield,
  Cpu,
  MemoryStick,
  DollarSign,
} from "lucide-react"
import { VPSActions } from "@/components/vps-actions"
import { SSHInfo } from "@/components/ssh-info"
import { OSReinstall } from "@/components/os-reinstall"
import { NetworkingPanel } from "@/components/networking-panel"
import { BackupPanel } from "@/components/backup-panel"
import { MonitoringPanel } from "@/components/monitoring-panel"

interface VPSDetails {
  id: string
  name: string
  status: "running" | "stopped" | "suspended" | "maintenance"
  ip: string
  ipv6?: string
  cpu: { usage: number; cores: number; model: string; frequency: string }
  memory: { used: number; total: number; usage: number; type: string }
  disk: { used: number; total: number; type: string; iops: number; readSpeed: number; writeSpeed: number }
  network: {
    inbound: number
    outbound: number
    bandwidth: number
    totalIn: number
    totalOut: number
    packets: { in: number; out: number }
  }
  uptime: string
  uptimeSeconds: number
  os: string
  kernel: string
  node: string
  vmid: number
  sshPort: number
  rootPassword?: string
  location: string
  datacenter: string
  plan: string
  monthlyBandwidth: { used: number; total: number }
  backups: {
    enabled: boolean
    lastBackup: string
    count: number
    schedule: string
    retention: number
  }
  monitoring: {
    alerts: number
    lastCheck: string
    responseTime: number
    availability: number
    checks: { http: boolean; ping: boolean; ssh: boolean }
  }
  security: {
    firewall: boolean
    ddosProtection: boolean
    sslCerts: number
    lastSecurityScan: string
    vulnerabilities: number
  }
  cost: {
    monthly: number
    current: number
    bandwidth: number
    storage: number
    compute: number
  }
  specs: {
    virtualization: string
    bootTime: number
    lastReboot: string
    architecture: string
  }
  performance: {
    cpuBenchmark: number
    diskBenchmark: number
    networkLatency: number
    loadAverage: number[]
  }
}

export default function VPSDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [vps, setVps] = useState<VPSDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchVPSDetails = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockVPS: VPSDetails = {
        id: params.id as string,
        name: "Production Web Server",
        status: "running",
        ip: "192.168.1.100",
        ipv6: "2001:db8::100",
        cpu: {
          usage: 45,
          cores: 4,
          model: "Intel Xeon E5-2686 v4",
          frequency: "2.3 GHz",
        },
        memory: {
          used: 3.2,
          total: 8,
          usage: 40,
          type: "DDR4 ECC",
        },
        disk: {
          used: 45,
          total: 100,
          type: "NVMe SSD",
          iops: 15000,
          readSpeed: 3200,
          writeSpeed: 2800,
        },
        network: {
          inbound: 125.5,
          outbound: 89.2,
          bandwidth: 1000,
          totalIn: 2.8,
          totalOut: 1.9,
          packets: { in: 1250000, out: 890000 },
        },
        uptime: "15 days, 7 hours, 23 minutes",
        uptimeSeconds: 1339403,
        os: "Ubuntu 22.04.3 LTS",
        kernel: "5.15.0-91-generic",
        node: "devloo-ny-01",
        vmid: 100,
        sshPort: 22,
        rootPassword: "DevlooSecure2024!",
        location: "New York, USA",
        datacenter: "NYC-DC1",
        plan: "Performance Plus",
        monthlyBandwidth: { used: 2.8, total: 10 },
        backups: {
          enabled: true,
          lastBackup: "2024-01-20 03:00:15 UTC",
          count: 7,
          schedule: "Daily at 03:00 UTC",
          retention: 30,
        },
        monitoring: {
          alerts: 0,
          lastCheck: "2024-01-20 15:42:30 UTC",
          responseTime: 45,
          availability: 99.97,
          checks: { http: true, ping: true, ssh: true },
        },
        security: {
          firewall: true,
          ddosProtection: true,
          sslCerts: 3,
          lastSecurityScan: "2024-01-19 12:00:00 UTC",
          vulnerabilities: 0,
        },
        cost: {
          monthly: 89.99,
          current: 67.49,
          bandwidth: 12.5,
          storage: 25.0,
          compute: 52.49,
        },
        specs: {
          virtualization: "KVM",
          bootTime: 23,
          lastReboot: "2024-01-05 14:30:00 UTC",
          architecture: "x86_64",
        },
        performance: {
          cpuBenchmark: 8750,
          diskBenchmark: 15000,
          networkLatency: 0.8,
          loadAverage: [0.45, 0.52, 0.38],
        },
      }

      setVps(mockVPS)
      setLoading(false)
    }

    fetchVPSDetails()
  }, [params.id])

  const handlePowerAction = async (action: "start" | "stop" | "reboot") => {
    if (!vps) return

    setActionLoading(action)

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))

      let newStatus = vps.status
      if (action === "start") newStatus = "running"
      if (action === "stop") newStatus = "stopped"
      if (action === "reboot") newStatus = "running"

      setVps((prev) => (prev ? { ...prev, status: newStatus } : null))
    } catch (error) {
      console.error("Power action failed:", error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!vps) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>VPS instance not found or failed to load.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Running
          </Badge>
        )
      case "stopped":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <Square className="mr-1 h-3 w-3" />
            Stopped
          </Badge>
        )
      case "suspended":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Suspended
          </Badge>
        )
      case "maintenance":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Maintenance
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{vps.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground mt-1">
              <span>VM ID: {vps.vmid}</span>
              <span>•</span>
              <span>Node: {vps.node}</span>
              <span>•</span>
              <span>{vps.location}</span>
              <span>•</span>
              <span>{vps.plan}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(vps.status)}
          <Button variant="outline" size="sm">
            <Activity className="mr-2 h-4 w-4" />
            Live Metrics
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vps.cpu.usage}%</div>
            <Progress value={vps.cpu.usage} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {vps.cpu.cores} cores • {vps.cpu.frequency}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vps.memory.usage}%</div>
            <Progress value={vps.memory.usage} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {vps.memory.used}GB / {vps.memory.total}GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vps.network.inbound + vps.network.outbound} Mbps</div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>↓ {vps.network.inbound} Mbps</span>
              <span>↑ {vps.network.outbound} Mbps</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${vps.cost.current}</div>
            <p className="text-xs text-muted-foreground mt-1">of ${vps.cost.monthly} budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="networking">Networking</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Information
                </CardTitle>
                <CardDescription>Detailed system specifications and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Operating System</span>
                    <p className="font-medium">{vps.os}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kernel Version</span>
                    <p className="font-medium">{vps.kernel}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Architecture</span>
                    <p className="font-medium">{vps.specs.architecture}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Virtualization</span>
                    <p className="font-medium">{vps.specs.virtualization}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Boot Time</span>
                    <p className="font-medium">{vps.specs.bootTime}s</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Reboot</span>
                    <p className="font-medium">{new Date(vps.specs.lastReboot).toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU ({vps.cpu.cores} cores)</span>
                      <span>{vps.cpu.usage}%</span>
                    </div>
                    <Progress value={vps.cpu.usage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{vps.cpu.model}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory ({vps.memory.type})</span>
                      <span>
                        {vps.memory.used}GB / {vps.memory.total}GB
                      </span>
                    </div>
                    <Progress value={vps.memory.usage} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage ({vps.disk.type})</span>
                      <span>
                        {vps.disk.used}GB / {vps.disk.total}GB
                      </span>
                    </div>
                    <Progress value={(vps.disk.used / vps.disk.total) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Read: {vps.disk.readSpeed} MB/s</span>
                      <span>Write: {vps.disk.writeSpeed} MB/s</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Power Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Power className="h-5 w-5" />
                  Power Management
                </CardTitle>
                <CardDescription>Control your VPS power state and operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <Button
                    onClick={() => handlePowerAction("start")}
                    disabled={vps.status === "running" || actionLoading !== null}
                    className="w-full justify-start"
                    variant={vps.status === "running" ? "secondary" : "default"}
                  >
                    {actionLoading === "start" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Power className="mr-2 h-4 w-4" />
                    )}
                    Start VPS
                  </Button>

                  <Button
                    onClick={() => handlePowerAction("reboot")}
                    disabled={vps.status !== "running" || actionLoading !== null}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    {actionLoading === "reboot" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="mr-2 h-4 w-4" />
                    )}
                    Reboot VPS
                  </Button>

                  <Button
                    onClick={() => handlePowerAction("stop")}
                    disabled={vps.status !== "running" || actionLoading !== null}
                    variant="destructive"
                    className="w-full justify-start"
                  >
                    {actionLoading === "stop" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Square className="mr-2 h-4 w-4" />
                    )}
                    Shutdown VPS
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-medium">{vps.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Load Average</span>
                    <span className="font-medium font-mono">{vps.performance.loadAverage.join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="font-medium">{vps.monitoring.responseTime}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* SSH Connection */}
            <SSHInfo vps={vps} />

            {/* VPS Actions */}
            <VPSActions vps={vps} />
          </div>

          {/* OS Reinstall */}
          <OSReinstall vps={vps} />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <MonitoringPanel vps={vps} />
        </TabsContent>

        <TabsContent value="networking" className="space-y-6">
          <NetworkingPanel vps={vps} />
        </TabsContent>

        <TabsContent value="backups" className="space-y-6">
          <BackupPanel vps={vps} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Overview
              </CardTitle>
              <CardDescription>Security settings and status for your VPS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Firewall Protection</span>
                    <Badge variant={vps.security.firewall ? "default" : "destructive"}>
                      {vps.security.firewall ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>DDoS Protection</span>
                    <Badge variant={vps.security.ddosProtection ? "default" : "destructive"}>
                      {vps.security.ddosProtection ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SSL Certificates</span>
                    <Badge variant="outline">{vps.security.sslCerts} installed</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Security Vulnerabilities</span>
                    <Badge variant={vps.security.vulnerabilities === 0 ? "default" : "destructive"}>
                      {vps.security.vulnerabilities} found
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Security Scan</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(vps.security.lastSecurityScan).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>VPS Configuration</CardTitle>
                <CardDescription>Basic configuration settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">VPS Name</label>
                  <input type="text" value={vps.name} className="w-full px-3 py-2 border rounded-md" readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SSH Port</label>
                  <input type="number" value={vps.sshPort} className="w-full px-3 py-2 border rounded-md" readOnly />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>Current billing cycle details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Compute Resources</span>
                    <span className="font-medium">${vps.cost.compute}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage</span>
                    <span className="font-medium">${vps.cost.storage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bandwidth</span>
                    <span className="font-medium">${vps.cost.bandwidth}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total This Month</span>
                    <span>${vps.cost.current}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
