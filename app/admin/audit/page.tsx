"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Eye,
  Search,
  Download,
  CalendarIcon,
  Server,
  Users,
  Shield,
  DollarSign,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
} from "lucide-react"
import { format } from "date-fns"

interface AuditLog {
  id: string
  timestamp: string
  user: string
  userId: string
  action: string
  category: "auth" | "vps" | "user" | "system" | "billing" | "security"
  status: "success" | "warning" | "error" | "info"
  ipAddress: string
  userAgent: string
  details: string
  resourceId?: string
  resourceType?: string
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  useEffect(() => {
    const fetchAuditLogs = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockLogs: AuditLog[] = [
        {
          id: "1",
          timestamp: "2024-01-20T14:30:25Z",
          user: "admin",
          userId: "2",
          action: "Admin login successful",
          category: "auth",
          status: "success",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          details: "Administrator logged in from trusted IP address",
        },
        {
          id: "2",
          timestamp: "2024-01-20T14:25:12Z",
          user: "john.doe",
          userId: "1",
          action: "VPS created",
          category: "vps",
          status: "success",
          ipAddress: "203.0.113.45",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          details: 'Created VPS instance "web-server-01" with 4GB RAM, 2 CPU cores',
          resourceId: "vm-100",
          resourceType: "vps",
        },
        {
          id: "3",
          timestamp: "2024-01-20T14:20:08Z",
          user: "system",
          userId: "system",
          action: "High CPU usage detected",
          category: "system",
          status: "warning",
          ipAddress: "127.0.0.1",
          userAgent: "ProxPanel-Monitor/1.0",
          details: "CPU usage exceeded 80% threshold on node-fra-01",
          resourceId: "node-fra-01",
          resourceType: "server",
        },
        {
          id: "4",
          timestamp: "2024-01-20T14:15:33Z",
          user: "jane.smith",
          userId: "3",
          action: "Failed login attempt",
          category: "auth",
          status: "error",
          ipAddress: "198.51.100.23",
          userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
          details: "Invalid password provided for user jane.smith",
        },
        {
          id: "5",
          timestamp: "2024-01-20T14:10:45Z",
          user: "bob.wilson",
          userId: "4",
          action: "Payment processed",
          category: "billing",
          status: "success",
          ipAddress: "203.0.113.67",
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
          details: "Payment of $89.99 processed successfully for invoice INV-2024-001",
          resourceId: "INV-2024-001",
          resourceType: "invoice",
        },
        {
          id: "6",
          timestamp: "2024-01-20T14:05:22Z",
          user: "moderator",
          userId: "5",
          action: "User account suspended",
          category: "user",
          status: "warning",
          ipAddress: "192.168.1.101",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          details: 'Suspended user account "spam.user" for policy violation',
          resourceId: "spam.user",
          resourceType: "user",
        },
        {
          id: "7",
          timestamp: "2024-01-20T14:00:15Z",
          user: "system",
          userId: "system",
          action: "Backup completed",
          category: "system",
          status: "success",
          ipAddress: "127.0.0.1",
          userAgent: "ProxPanel-Backup/1.0",
          details: "Automated backup completed for all VPS instances",
        },
        {
          id: "8",
          timestamp: "2024-01-20T13:55:41Z",
          user: "alice.brown",
          userId: "6",
          action: "VPS power cycle",
          category: "vps",
          status: "success",
          ipAddress: "198.51.100.89",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          details: 'Restarted VPS instance "database-server"',
          resourceId: "vm-101",
          resourceType: "vps",
        },
        {
          id: "9",
          timestamp: "2024-01-20T13:50:18Z",
          user: "system",
          userId: "system",
          action: "Security scan completed",
          category: "security",
          status: "info",
          ipAddress: "127.0.0.1",
          userAgent: "ProxPanel-Security/1.0",
          details: "Daily security scan completed - no threats detected",
        },
        {
          id: "10",
          timestamp: "2024-01-20T13:45:33Z",
          user: "admin",
          userId: "2",
          action: "System settings updated",
          category: "system",
          status: "success",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          details: "Updated global rate limiting settings",
        },
      ]

      setLogs(mockLogs)
      setLoading(false)
    }

    fetchAuditLogs()
  }, [])

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || log.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || log.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "auth":
        return <Shield className="h-4 w-4" />
      case "vps":
        return <Server className="h-4 w-4" />
      case "user":
        return <Users className="h-4 w-4" />
      case "system":
        return <Settings className="h-4 w-4" />
      case "billing":
        return <DollarSign className="h-4 w-4" />
      case "security":
        return <Shield className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      auth: "bg-blue-100 text-blue-800 border-blue-200",
      vps: "bg-green-100 text-green-800 border-green-200",
      user: "bg-purple-100 text-purple-800 border-purple-200",
      system: "bg-gray-100 text-gray-800 border-gray-200",
      billing: "bg-yellow-100 text-yellow-800 border-yellow-200",
      security: "bg-red-100 text-red-800 border-red-200",
    }

    return (
      <Badge className={colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {getCategoryIcon(category)}
        <span className="ml-1 capitalize">{category}</span>
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "info":
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Success</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Warning</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>
      case "info":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Info</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const exportLogs = () => {
    const csvContent = [
      ["Timestamp", "User", "Action", "Category", "Status", "IP Address", "Details"].join(","),
      ...filteredLogs.map((log) =>
        [log.timestamp, log.user, log.action, log.category, log.status, log.ipAddress, `"${log.details}"`].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const categoryStats = {
    auth: logs.filter((l) => l.category === "auth").length,
    vps: logs.filter((l) => l.category === "vps").length,
    user: logs.filter((l) => l.category === "user").length,
    system: logs.filter((l) => l.category === "system").length,
    billing: logs.filter((l) => l.category === "billing").length,
    security: logs.filter((l) => l.category === "security").length,
  }

  const statusStats = {
    success: logs.filter((l) => l.status === "success").length,
    warning: logs.filter((l) => l.status === "warning").length,
    error: logs.filter((l) => l.status === "error").length,
    info: logs.filter((l) => l.status === "info").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">System activity and security monitoring</p>
        </div>
        <Button onClick={exportLogs}>
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {((statusStats.success / logs.length) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{statusStats.success} successful events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statusStats.warning}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statusStats.error}</div>
            <p className="text-xs text-muted-foreground">Failed operations</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <CardDescription>Filter and search system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="vps">VPS</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Date Range
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">{format(new Date(log.timestamp), "MMM dd, HH:mm:ss")}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(log.timestamp), "yyyy")}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{log.user}</div>
                      {log.userId !== "system" && <div className="text-xs text-muted-foreground">ID: {log.userId}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{log.action}</div>
                      {log.resourceId && (
                        <div className="text-xs text-muted-foreground">
                          {log.resourceType}: {log.resourceId}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getCategoryBadge(log.category)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        {getStatusBadge(log.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">{log.ipAddress}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm" title={log.details}>
                        {log.details}
                      </div>
                      {log.userAgent && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs" title={log.userAgent}>
                          {log.userAgent}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No logs found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
