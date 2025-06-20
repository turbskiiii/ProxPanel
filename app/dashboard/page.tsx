"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Power,
  RotateCcw,
  Settings,
  Activity,
  AlertCircle,
  Clock,
  Shield,
  Globe,
  BarChart3,
  Zap,
  Users,
  DollarSign,
} from "lucide-react"
import Link from "next/link"

interface VPSData {
  id: string
  name: string
  status: "running" | "stopped" | "suspended" | "maintenance"
  ip: string
  ipv6?: string
  cpu: { usage: number; cores: number; model: string }
  memory: { used: number; total: number; usage: number }
  disk: { used: number; total: number; type: string; iops: number }
  network: { inbound: number; outbound: number; bandwidth: number }
  uptime: string
  uptimeSeconds: number
  os: string
  location: string
  plan: string
  monthlyBandwidth: { used: number; total: number }
  backups: { enabled: boolean; lastBackup: string; count: number }
  monitoring: {
    alerts: number
    lastCheck: string
    responseTime: number
  }
  security: {
    firewall: boolean
    ddosProtection: boolean
    sslCerts: number
  }
  cost: {
    monthly: number
    current: number
  }
}

interface SystemStats {
  totalVPS: number
  runningVPS: number
  totalBandwidth: number
  usedBandwidth: number
  totalCost: number
  alerts: number
  uptime: number
}

export default function DashboardPage() {
  const [vpsData, setVpsData] = useState<VPSData[]>([])
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h")

  useEffect(() => {
    const fetchDashboardData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockVPSData: VPSData[] = [
        {
          id: "vm-100",
          name: "Production Web Server",
          status: "running",
          ip: "192.168.1.100",
          ipv6: "2001:db8::100",
          cpu: { usage: 45, cores: 4, model: "Intel Xeon E5-2686 v4" },
          memory: { used: 3.2, total: 8, usage: 40 },
          disk: { used: 45, total: 100, type: "NVMe SSD", iops: 15000 },
          network: { inbound: 125.5, outbound: 89.2, bandwidth: 1000 },
          uptime: "15 days, 7 hours, 23 minutes",
          uptimeSeconds: 1339403,
          os: "Ubuntu 22.04 LTS",
          location: "New York, USA",
          plan: "Performance Plus",
          monthlyBandwidth: { used: 2.8, total: 10 },
          backups: { enabled: true, lastBackup: "2024-01-20 03:00", count: 7 },
          monitoring: {
            alerts: 0,
            lastCheck: "2 minutes ago",
            responseTime: 45,
          },
          security: {
            firewall: true,
            ddosProtection: true,
            sslCerts: 3,
          },
          cost: {
            monthly: 89.99,
            current: 67.49,
          },
        },
        {
          id: "vm-101",
          name: "Database Cluster Node 1",
          status: "running",
          ip: "192.168.1.101",
          ipv6: "2001:db8::101",
          cpu: { usage: 78, cores: 8, model: "AMD EPYC 7542" },
          memory: { used: 14.2, total: 16, usage: 89 },
          disk: { used: 180, total: 200, type: "NVMe SSD", iops: 25000 },
          network: { inbound: 245.8, outbound: 156.3, bandwidth: 1000 },
          uptime: "32 days, 14 hours, 8 minutes",
          uptimeSeconds: 2823688,
          os: "CentOS Stream 9",
          location: "Frankfurt, Germany",
          plan: "Enterprise",
          monthlyBandwidth: { used: 8.5, total: 20 },
          backups: { enabled: true, lastBackup: "2024-01-20 02:30", count: 14 },
          monitoring: {
            alerts: 1,
            lastCheck: "1 minute ago",
            responseTime: 23,
          },
          security: {
            firewall: true,
            ddosProtection: true,
            sslCerts: 1,
          },
          cost: {
            monthly: 199.99,
            current: 149.99,
          },
        },
        {
          id: "vm-102",
          name: "Development Environment",
          status: "stopped",
          ip: "192.168.1.102",
          cpu: { usage: 0, cores: 2, model: "Intel Xeon E5-2676 v3" },
          memory: { used: 0, total: 4, usage: 0 },
          disk: { used: 25, total: 50, type: "SSD", iops: 8000 },
          network: { inbound: 0, outbound: 0, bandwidth: 500 },
          uptime: "Stopped 3 hours ago",
          uptimeSeconds: 0,
          os: "Debian 12",
          location: "London, UK",
          plan: "Developer",
          monthlyBandwidth: { used: 0.5, total: 5 },
          backups: { enabled: false, lastBackup: "Never", count: 0 },
          monitoring: {
            alerts: 0,
            lastCheck: "N/A",
            responseTime: 0,
          },
          security: {
            firewall: true,
            ddosProtection: false,
            sslCerts: 0,
          },
          cost: {
            monthly: 29.99,
            current: 0,
          },
        },
        {
          id: "vm-103",
          name: "Load Balancer",
          status: "running",
          ip: "192.168.1.103",
          ipv6: "2001:db8::103",
          cpu: { usage: 23, cores: 2, model: "Intel Xeon Gold 6248" },
          memory: { used: 1.8, total: 4, usage: 45 },
          disk: { used: 15, total: 40, type: "NVMe SSD", iops: 12000 },
          network: { inbound: 456.7, outbound: 389.2, bandwidth: 1000 },
          uptime: "8 days, 12 hours, 45 minutes",
          uptimeSeconds: 740700,
          os: "Ubuntu 22.04 LTS",
          location: "Singapore",
          plan: "Business",
          monthlyBandwidth: { used: 12.3, total: 15 },
          backups: { enabled: true, lastBackup: "2024-01-20 01:15", count: 4 },
          monitoring: {
            alerts: 0,
            lastCheck: "30 seconds ago",
            responseTime: 12,
          },
          security: {
            firewall: true,
            ddosProtection: true,
            sslCerts: 5,
          },
          cost: {
            monthly: 59.99,
            current: 44.99,
          },
        },
        {
          id: "vm-104",
          name: "Staging Server",
          status: "maintenance",
          ip: "192.168.1.104",
          cpu: { usage: 0, cores: 2, model: "Intel Xeon E5-2686 v4" },
          memory: { used: 0.5, total: 2, usage: 25 },
          disk: { used: 18, total: 30, type: "SSD", iops: 6000 },
          network: { inbound: 0, outbound: 0, bandwidth: 500 },
          uptime: "Maintenance mode",
          uptimeSeconds: 0,
          os: "Rocky Linux 9",
          location: "Tokyo, Japan",
          plan: "Standard",
          monthlyBandwidth: { used: 1.2, total: 5 },
          backups: { enabled: true, lastBackup: "2024-01-19 23:45", count: 3 },
          monitoring: {
            alerts: 1,
            lastCheck: "5 minutes ago",
            responseTime: 0,
          },
          security: {
            firewall: true,
            ddosProtection: false,
            sslCerts: 1,
          },
          cost: {
            monthly: 39.99,
            current: 30.0,
          },
        },
      ]

      const mockSystemStats: SystemStats = {
        totalVPS: mockVPSData.length,
        runningVPS: mockVPSData.filter((vps) => vps.status === "running").length,
        totalBandwidth: mockVPSData.reduce((sum, vps) => sum + vps.monthlyBandwidth.total, 0),
        usedBandwidth: mockVPSData.reduce((sum, vps) => sum + vps.monthlyBandwidth.used, 0),
        totalCost: mockVPSData.reduce((sum, vps) => sum + vps.cost.current, 0),
        alerts: mockVPSData.reduce((sum, vps) => sum + vps.monitoring.alerts, 0),
        uptime: 99.97,
      }

      setVpsData(mockVPSData)
      setSystemStats(mockSystemStats)
      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500"
      case "stopped":
        return "bg-red-500"
      case "suspended":
        return "bg-yellow-500"
      case "maintenance":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Running</Badge>
      case "stopped":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Stopped</Badge>
      case "suspended":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Suspended</Badge>
      case "maintenance":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Maintenance</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Infrastructure Overview</h2>
        </div>

        {/* Loading skeleton for stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading skeleton for VPS cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Infrastructure Overview</h2>
          <p className="text-muted-foreground">Monitor and manage your cloud infrastructure</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Activity className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button size="sm">
            <Server className="mr-2 h-4 w-4" />
            Deploy New VPS
          </Button>
        </div>
      </div>

      {/* System Overview Stats */}
      {systemStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total VPS Instances</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalVPS}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats.runningVPS} running, {systemStats.totalVPS - systemStats.runningVPS} offline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Bandwidth</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.usedBandwidth.toFixed(1)} TB</div>
              <p className="text-xs text-muted-foreground">
                of {systemStats.totalBandwidth} TB (
                {((systemStats.usedBandwidth / systemStats.totalBandwidth) * 100).toFixed(1)}%)
              </p>
              <Progress value={(systemStats.usedBandwidth / systemStats.totalBandwidth) * 100} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${systemStats.totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">This billing cycle</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{systemStats.uptime}%</div>
              <p className="text-xs text-muted-foreground">{systemStats.alerts} active alerts</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Time Range Selector */}
      <Tabs value={selectedTimeframe} onValueChange={setSelectedTimeframe} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="1h">Last Hour</TabsTrigger>
          <TabsTrigger value="24h">24 Hours</TabsTrigger>
          <TabsTrigger value="7d">7 Days</TabsTrigger>
          <TabsTrigger value="30d">30 Days</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTimeframe} className="space-y-6">
          {/* VPS Instance Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vpsData.map((vps) => (
              <Card
                key={vps.id}
                className="hover:shadow-lg transition-all duration-200 border-l-4"
                style={{
                  borderLeftColor:
                    vps.status === "running"
                      ? "#10b981"
                      : vps.status === "stopped"
                        ? "#ef4444"
                        : vps.status === "maintenance"
                          ? "#3b82f6"
                          : "#f59e0b",
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      {vps.name}
                    </CardTitle>
                    {getStatusBadge(vps.status)}
                  </div>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      <span className="font-mono">{vps.ip}</span>
                      {vps.ipv6 && <span className="text-xs text-muted-foreground">IPv6</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-3 w-3" />
                      {vps.location} • {vps.plan}
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Resource Usage */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Cpu className="h-3 w-3" />
                          CPU ({vps.cpu.cores} cores)
                        </span>
                        <span className="font-medium">{vps.cpu.usage}%</span>
                      </div>
                      <Progress value={vps.cpu.usage} className="h-2" />
                      <p className="text-xs text-muted-foreground">{vps.cpu.model}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Memory</span>
                        <span className="font-medium">
                          {vps.memory.used}GB / {vps.memory.total}GB
                        </span>
                      </div>
                      <Progress value={vps.memory.usage} className="h-2" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          Storage ({vps.disk.type})
                        </span>
                        <span className="font-medium">
                          {vps.disk.used}GB / {vps.disk.total}GB
                        </span>
                      </div>
                      <Progress value={(vps.disk.used / vps.disk.total) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">{vps.disk.iops.toLocaleString()} IOPS</p>
                    </div>
                  </div>

                  {/* Network & Performance */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Network In</p>
                      <p className="font-medium">{vps.network.inbound} Mbps</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Network Out</p>
                      <p className="font-medium">{vps.network.outbound} Mbps</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Response Time</p>
                      <p className="font-medium">{vps.monitoring.responseTime}ms</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Monthly Cost</p>
                      <p className="font-medium text-green-600">${vps.cost.current}</p>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className="pt-2 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Uptime
                      </span>
                      <span className="font-medium">{vps.uptime}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>OS</span>
                      <span className="font-medium">{vps.os}</span>
                    </div>

                    {vps.monitoring.alerts > 0 && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>
                          {vps.monitoring.alerts} active alert{vps.monitoring.alerts > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t">
                    <div className="flex gap-2">
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/dashboard/vps/${vps.id}`}>
                          <Settings className="mr-1 h-3 w-3" />
                          Manage
                        </Link>
                      </Button>

                      {vps.status === "running" ? (
                        <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700">
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      ) : vps.status === "stopped" ? (
                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                          <Power className="h-3 w-3" />
                        </Button>
                      ) : null}

                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {vpsData.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Server className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Welcome to Devloo Hosting</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              You don't have any VPS instances yet. Deploy your first virtual private server to get started with our
              cloud infrastructure.
            </p>
            <div className="flex gap-3">
              <Button size="lg">
                <Zap className="mr-2 h-4 w-4" />
                Deploy VPS
              </Button>
              <Button variant="outline" size="lg">
                <Users className="mr-2 h-4 w-4" />
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
