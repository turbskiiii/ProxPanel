"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Network, Globe, Shield, Settings, Plus, Trash2, Copy, CheckCircle } from "lucide-react"

interface VPSDetails {
  ip: string
  ipv6?: string
  network: {
    inbound: number
    outbound: number
    bandwidth: number
    totalIn: number
    totalOut: number
    packets: { in: number; out: number }
  }
  monthlyBandwidth: { used: number; total: number }
}

interface NetworkingPanelProps {
  vps: VPSDetails
}

export function NetworkingPanel({ vps }: NetworkingPanelProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  // Mock firewall rules
  const firewallRules = [
    { id: 1, port: "22", protocol: "TCP", source: "0.0.0.0/0", action: "ALLOW", description: "SSH Access" },
    { id: 2, port: "80", protocol: "TCP", source: "0.0.0.0/0", action: "ALLOW", description: "HTTP Traffic" },
    { id: 3, port: "443", protocol: "TCP", source: "0.0.0.0/0", action: "ALLOW", description: "HTTPS Traffic" },
    {
      id: 4,
      port: "3306",
      protocol: "TCP",
      source: "192.168.1.0/24",
      action: "ALLOW",
      description: "MySQL (Internal)",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth Usage</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vps.monthlyBandwidth.used} TB</div>
            <p className="text-xs text-muted-foreground">
              of {vps.monthlyBandwidth.total} TB (
              {((vps.monthlyBandwidth.used / vps.monthlyBandwidth.total) * 100).toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Traffic</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(vps.network.inbound + vps.network.outbound).toFixed(1)} Mbps</div>
            <p className="text-xs text-muted-foreground">
              ↓ {vps.network.inbound} Mbps ↑ {vps.network.outbound} Mbps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Data Transfer</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(vps.network.totalIn + vps.network.totalOut).toFixed(1)} TB</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Packet Count</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((vps.network.packets.in + vps.network.packets.out) / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">Total packets processed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="interfaces" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="interfaces">Network Interfaces</TabsTrigger>
          <TabsTrigger value="firewall">Firewall Rules</TabsTrigger>
          <TabsTrigger value="dns">DNS Settings</TabsTrigger>
          <TabsTrigger value="monitoring">Traffic Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="interfaces" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Network Interfaces
              </CardTitle>
              <CardDescription>Configure your VPS network interfaces and IP addresses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary IPv4 */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Primary</Badge>
                    <span className="font-medium">IPv4 Interface</span>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor="ipv4">IP Address</Label>
                    <div className="flex gap-2">
                      <Input id="ipv4" value={vps.ip} readOnly className="font-mono" />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(vps.ip, "ipv4")}>
                        {copied === "ipv4" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subnet">Subnet Mask</Label>
                    <Input id="subnet" value="255.255.255.0" readOnly className="font-mono" />
                  </div>
                  <div>
                    <Label htmlFor="gateway">Gateway</Label>
                    <Input id="gateway" value="192.168.1.1" readOnly className="font-mono" />
                  </div>
                  <div>
                    <Label htmlFor="interface">Interface</Label>
                    <Input id="interface" value="eth0" readOnly className="font-mono" />
                  </div>
                </div>
              </div>

              {/* IPv6 */}
              {vps.ipv6 && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">IPv6</Badge>
                      <span className="font-medium">IPv6 Interface</span>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Label htmlFor="ipv6">IPv6 Address</Label>
                      <div className="flex gap-2">
                        <Input id="ipv6" value={vps.ipv6} readOnly className="font-mono" />
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(vps.ipv6!, "ipv6")}>
                          {copied === "ipv6" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="ipv6-prefix">Prefix Length</Label>
                      <Input id="ipv6-prefix" value="/64" readOnly className="font-mono" />
                    </div>
                    <div>
                      <Label htmlFor="ipv6-gateway">Gateway</Label>
                      <Input id="ipv6-gateway" value="2001:db8::1" readOnly className="font-mono" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Additional IP
                </Button>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Routing
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="firewall" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Firewall Rules
              </CardTitle>
              <CardDescription>Manage inbound and outbound traffic rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Firewall Enabled</Badge>
                  <span className="text-sm text-muted-foreground">{firewallRules.length} active rules</span>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Rule
                </Button>
              </div>

              <div className="border rounded-lg">
                <div className="grid grid-cols-6 gap-4 p-3 border-b bg-muted/50 text-sm font-medium">
                  <span>Port</span>
                  <span>Protocol</span>
                  <span>Source</span>
                  <span>Action</span>
                  <span>Description</span>
                  <span>Actions</span>
                </div>
                {firewallRules.map((rule) => (
                  <div key={rule.id} className="grid grid-cols-6 gap-4 p-3 border-b last:border-b-0 text-sm">
                    <span className="font-mono">{rule.port}</span>
                    <span>{rule.protocol}</span>
                    <span className="font-mono text-xs">{rule.source}</span>
                    <Badge variant={rule.action === "ALLOW" ? "default" : "destructive"} className="w-fit">
                      {rule.action}
                    </Badge>
                    <span className="text-muted-foreground">{rule.description}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                DNS Configuration
              </CardTitle>
              <CardDescription>Configure DNS servers and domain settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="primary-dns">Primary DNS Server</Label>
                  <Input id="primary-dns" value="8.8.8.8" className="font-mono" />
                </div>
                <div>
                  <Label htmlFor="secondary-dns">Secondary DNS Server</Label>
                  <Input id="secondary-dns" value="8.8.4.4" className="font-mono" />
                </div>
              </div>

              <div>
                <Label htmlFor="hostname">Hostname</Label>
                <Input id="hostname" value="web-server.devloo.com" />
              </div>

              <div>
                <Label htmlFor="domain">Domain</Label>
                <Input id="domain" value="devloo.com" />
              </div>

              <Button>Update DNS Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Traffic Monitoring
              </CardTitle>
              <CardDescription>Real-time network traffic analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Inbound Traffic</h4>
                  <div className="text-2xl font-bold text-green-600">{vps.network.inbound} Mbps</div>
                  <p className="text-sm text-muted-foreground">{vps.network.packets.in.toLocaleString()} packets/sec</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Outbound Traffic</h4>
                  <div className="text-2xl font-bold text-blue-600">{vps.network.outbound} Mbps</div>
                  <p className="text-sm text-muted-foreground">
                    {vps.network.packets.out.toLocaleString()} packets/sec
                  </p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Top Connections</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-mono">203.0.113.1:443</span>
                    <span>25.3 Mbps</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-mono">198.51.100.2:80</span>
                    <span>18.7 Mbps</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-mono">192.0.2.3:22</span>
                    <span>2.1 Mbps</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
