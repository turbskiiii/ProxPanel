"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Server,
  Users,
  Activity,
  AlertTriangle,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Shield,
  DollarSign,
  Settings,
  Eye,
  ServerCog,
} from "lucide-react"
import Link from "next/link"

interface AdminStats {
  totalServers: number
  activeServers: number
  totalUsers: number
  activeUsers: number
  totalVPS: number
  runningVPS: number
  totalRevenue: number
  monthlyRevenue: number
  systemAlerts: number
  resourceUsage: {
    cpu: number
    memory: number
    storage: number
    bandwidth: number
  }
  recentActivity: Array<{
    id: string
    type: string
    user: string
    action: string
    timestamp: string
    status: "success" | "warning" | "error"
  }>
}

interface ServerNode {
  id: string
  name: string
  location: string
  status: "online" | "offline" | "maintenance"
  cpu: { usage: number; cores: number }
  memory: { used: number; total: number }
  storage: { used: number; total: number }
  vpsCount: number
  uptime: string
  lastSeen: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [servers, setServers] = useState<ServerNode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockStats: AdminStats = {
        totalServers: 12,
        activeServers: 11,
        totalUsers: 1247,
        activeUsers: 892,
        totalVPS: 3456,
        runningVPS: 2891,
        totalRevenue: 125430.5,
        monthlyRevenue: 18750.25,
        systemAlerts: 3,
        resourceUsage: {
          cpu: 67,
          memory: 73,
          storage: 45,
          bandwidth: 82,
        },
        recentActivity: [
          {
            id: "1",
            type: "vps_create",
            user: "john.doe",
            action: 'Created VPS "web-server-01"',
            timestamp: "2 minutes ago",
            status: "success",
          },
          {
            id: "2",
            type: "user_login",
            user: "admin",
            action: "Admin login from 192.168.1.100",
            timestamp: "5 minutes ago",
            status: "success",
          },
          {
            id: "3",
            type: "server_alert",
            user: "system",
            action: "High CPU usage on node-fra-01",
            timestamp: "12 minutes ago",
            status: "warning",
          },
          {
            id: "4",
            type: "vps_delete",
            user: "jane.smith",
            action: 'Deleted VPS "test-environment"',
            timestamp: "18 minutes ago",
            status: "success",
          },
          {
            id: "5",
            type: "payment_failed",
            user: "bob.wilson",
            action: "Payment failed for invoice #INV-2024-001",
            timestamp: "25 minutes ago",
            status: "error",
          },
        ],
      }

      const mockServers: ServerNode[] = [
        {
          id: "node-ny-01",
          name: "New York Primary",
          location: "New York, USA",
          status: "online",
          cpu: { usage: 45, cores: 64 },
          memory: { used: 128, total: 256 },
          storage: { used: 2.5, total: 10 },
          vpsCount: 45,
          uptime: "99.98%",
          lastSeen: "1 minute ago",
        },
        {
          id: "node-fra-01",
          name: "Frankfurt Primary",
          location: "Frankfurt, Germany",
          status: "online",
          cpu: { usage: 78, cores: 64 },
          memory: { used: 180, total: 256 },
          storage: { used: 4.2, total: 10 },
          vpsCount: 52,
          uptime: "99.95%",
          lastSeen: "30 seconds ago",
        },
        {
          id: "node-sgp-01",
          name: "Singapore Primary",
          location: "Singapore",
          status: "online",
          cpu: { usage: 32, cores: 48 },
          memory: { used: 96, total: 192 },
          storage: { used: 1.8, total: 8 },
          vpsCount: 38,
          uptime: "99.99%",
          lastSeen: "2 minutes ago",
        },
        {
          id: "node-lon-01",
          name: "London Primary",
          location: "London, UK",
          status: "maintenance",
          cpu: { usage: 0, cores: 64 },
          memory: { used: 0, total: 256 },
          storage: { used: 3.1, total: 10 },
          vpsCount: 0,
          uptime: "99.92%",
          lastSeen: "15 minutes ago",
        },
      ]

      setStats(mockStats)
      setServers(mockServers)
      setLoading(false)
    }

    fetchAdminData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "offline":
        return "bg-red-500"
      case "maintenance":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "vps_create":
        return <Server className="h-4 w-4" />
      case "vps_delete":
        return <Server className="h-4 w-4" />
      case "user_login":
        return <Users className="h-4 w-4" />
      case "server_alert":
        return <AlertTriangle className="h-4 w-4" />
      case "payment_failed":
        return <DollarSign className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        </div>
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">System overview and management controls</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Activity className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/audit">
              <Eye className="mr-2 h-4 w-4" />
              View Audit Log
            </Link>
          </Button>
        </div>
      </div>

      {/* System Overview Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Server Nodes</CardTitle>
              <ServerCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.activeServers}/{stats.totalServers}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.activeServers} online, {stats.totalServers - stats.activeServers} offline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats.activeUsers} active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">VPS Instances</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVPS.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats.runningVPS.toLocaleString()} running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total: ${stats.totalRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Alerts */}
      {stats && stats.systemAlerts > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              System Alerts ({stats.systemAlerts})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">High CPU usage on Frankfurt node</span>
                <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                  Warning
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">London node in maintenance mode</span>
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  Info
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment failures detected</span>
                <Badge variant="outline" className="text-red-700 border-red-300">
                  Critical
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="servers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="servers">Server Nodes</TabsTrigger>
          <TabsTrigger value="resources">Resource Usage</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="management">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="servers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {servers.map((server) => (
              <Card key={server.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(server.status)}`} />
                      {server.name}
                    </CardTitle>
                    <Badge variant={server.status === "online" ? "default" : "secondary"}>{server.status}</Badge>
                  </div>
                  <CardDescription>
                    {server.location} • {server.vpsCount} VPS instances
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Cpu className="h-3 w-3" />
                          CPU ({server.cpu.cores} cores)
                        </span>
                        <span className="font-medium">{server.cpu.usage}%</span>
                      </div>
                      <Progress value={server.cpu.usage} className="h-2" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <MemoryStick className="h-3 w-3" />
                          Memory
                        </span>
                        <span className="font-medium">
                          {server.memory.used}GB / {server.memory.total}GB
                        </span>
                      </div>
                      <Progress value={(server.memory.used / server.memory.total) * 100} className="h-2" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          Storage
                        </span>
                        <span className="font-medium">
                          {server.storage.used}TB / {server.storage.total}TB
                        </span>
                      </div>
                      <Progress value={(server.storage.used / server.storage.total) * 100} className="h-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
                    <div>
                      <p className="text-muted-foreground">Uptime</p>
                      <p className="font-medium">{server.uptime}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Seen</p>
                      <p className="font-medium">{server.lastSeen}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="mr-1 h-3 w-3" />
                      Manage
                    </Button>
                    <Button size="sm" variant="outline">
                      <Activity className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {stats && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    CPU Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall CPU Usage</span>
                      <span className="font-medium">{stats.resourceUsage.cpu}%</span>
                    </div>
                    <Progress value={stats.resourceUsage.cpu} className="h-3" />
                    <p className="text-sm text-muted-foreground">Across all {stats.activeServers} active servers</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MemoryStick className="h-5 w-5" />
                    Memory Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall Memory Usage</span>
                      <span className="font-medium">{stats.resourceUsage.memory}%</span>
                    </div>
                    <Progress value={stats.resourceUsage.memory} className="h-3" />
                    <p className="text-sm text-muted-foreground">Total: 1.2TB allocated across cluster</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Storage Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall Storage Usage</span>
                      <span className="font-medium">{stats.resourceUsage.storage}%</span>
                    </div>
                    <Progress value={stats.resourceUsage.storage} className="h-3" />
                    <p className="text-sm text-muted-foreground">18.4TB used of 40TB total capacity</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Bandwidth Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monthly Bandwidth</span>
                      <span className="font-medium">{stats.resourceUsage.bandwidth}%</span>
                    </div>
                    <Progress value={stats.resourceUsage.bandwidth} className="h-3" />
                    <p className="text-sm text-muted-foreground">164TB used of 200TB monthly limit</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent System Activity
              </CardTitle>
              <CardDescription>Latest actions and events across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className={`${getActivityColor(activity.status)}`}>{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user} • {activity.timestamp}
                      </p>
                    </div>
                    <Badge
                      variant={
                        activity.status === "success"
                          ? "default"
                          : activity.status === "warning"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/audit">
                    <Eye className="mr-2 h-4 w-4" />
                    View Full Audit Log
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
              <Link href="/admin/users">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    User Management
                  </CardTitle>
                  <CardDescription>Manage user accounts, permissions, and billing</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total users</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
              <Link href="/admin/servers">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ServerCog className="h-5 w-5 text-green-500" />
                    Server Management
                  </CardTitle>
                  <CardDescription>Monitor and configure server nodes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {stats?.activeServers}/{stats?.totalServers}
                  </p>
                  <p className="text-sm text-muted-foreground">Active servers</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
              <Link href="/admin/audit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-500" />
                    Audit Logs
                  </CardTitle>
                  <CardDescription>View system activity and security logs</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-sm text-muted-foreground">Monitoring</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
              <Link href="/admin/billing">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-yellow-500" />
                    Billing & Revenue
                  </CardTitle>
                  <CardDescription>Monitor payments and financial metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${stats?.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">This month</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
              <Link href="/admin/settings">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-500" />
                    System Settings
                  </CardTitle>
                  <CardDescription>Configure global system settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">Config</p>
                  <p className="text-sm text-muted-foreground">Global settings</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
              <Link href="/admin/security">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    Security Center
                  </CardTitle>
                  <CardDescription>Security monitoring and threat detection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats?.systemAlerts}</p>
                  <p className="text-sm text-muted-foreground">Active alerts</p>
                </CardContent>
              </Link>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
