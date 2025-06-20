// Enhanced Proxmox VE API integration
interface ProxmoxConfig {
  host: string
  port: number
  username: string
  password: string
  realm: string
}

interface VPSStatus {
  vmid: number
  name: string
  status: "running" | "stopped" | "suspended"
  cpu: number
  mem: number
  disk: number
  uptime: number
  node: string
}

export class ProxmoxAPI {
  private config: ProxmoxConfig
  private ticket: string | null = null
  private csrfToken: string | null = null
  private authenticated = false

  constructor(config: ProxmoxConfig) {
    this.config = config
  }

  // Authenticate with Proxmox VE
  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`https://${this.config.host}:${this.config.port}/api2/json/access/ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: `${this.config.username}@${this.config.realm}`,
          password: this.config.password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        this.ticket = data.data.ticket
        this.csrfToken = data.data.CSRFPreventionToken
        this.authenticated = true
        return true
      }
      return false
    } catch (error) {
      console.error("Proxmox authentication failed:", error)
      return false
    }
  }

  private async ensureAuthenticated(): Promise<boolean> {
    if (!this.authenticated) {
      return await this.authenticate()
    }
    return true
  }

  private async makeRequest(endpoint: string, method = "GET", body?: any): Promise<any> {
    if (!(await this.ensureAuthenticated())) {
      throw new Error("Authentication failed")
    }

    const url = `https://${this.config.host}:${this.config.port}/api2/json${endpoint}`
    const headers: Record<string, string> = {
      Cookie: `PVEAuthCookie=${this.ticket}`,
    }

    if (this.csrfToken && method !== "GET") {
      headers["CSRFPreventionToken"] = this.csrfToken
    }

    if (body && method !== "GET") {
      headers["Content-Type"] = "application/x-www-form-urlencoded"
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? new URLSearchParams(body) : undefined,
    })

    if (!response.ok) {
      throw new Error(`Proxmox API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  // Get all VMs for a user
  async getVMs(): Promise<VPSStatus[]> {
    try {
      const data = await this.makeRequest("/cluster/resources?type=vm")
      return data.data.map((vm: any) => ({
        vmid: vm.vmid,
        name: vm.name,
        status: vm.status,
        cpu: vm.cpu || 0,
        mem: vm.mem || 0,
        disk: vm.disk || 0,
        uptime: vm.uptime || 0,
        node: vm.node,
      }))
    } catch (error) {
      console.error("Failed to fetch VMs:", error)
      return []
    }
  }

  // Get VM details
  async getVMDetails(node: string, vmid: number): Promise<any> {
    try {
      const data = await this.makeRequest(`/nodes/${node}/qemu/${vmid}/status/current`)
      return data.data
    } catch (error) {
      console.error("Failed to fetch VM details:", error)
      return null
    }
  }

  // Start a VM
  async startVM(node: string, vmid: number): Promise<boolean> {
    try {
      await this.makeRequest(`/nodes/${node}/qemu/${vmid}/status/start`, "POST")
      return true
    } catch (error) {
      console.error("Failed to start VM:", error)
      return false
    }
  }

  // Stop a VM
  async stopVM(node: string, vmid: number): Promise<boolean> {
    try {
      await this.makeRequest(`/nodes/${node}/qemu/${vmid}/status/stop`, "POST")
      return true
    } catch (error) {
      console.error("Failed to stop VM:", error)
      return false
    }
  }

  // Reboot a VM
  async rebootVM(node: string, vmid: number): Promise<boolean> {
    try {
      await this.makeRequest(`/nodes/${node}/qemu/${vmid}/status/reboot`, "POST")
      return true
    } catch (error) {
      console.error("Failed to reboot VM:", error)
      return false
    }
  }

  // Reset VM password
  async resetVMPassword(node: string, vmid: number, newPassword?: string): Promise<string | null> {
    try {
      // Generate new password if not provided
      const password = newPassword || this.generatePassword()

      // Execute password reset command via guest agent
      await this.makeRequest(`/nodes/${node}/qemu/${vmid}/agent/exec`, "POST", {
        command: `echo 'root:${password}' | chpasswd`,
      })

      return password
    } catch (error) {
      console.error("Failed to reset VM password:", error)
      return null
    }
  }

  // Create VM
  async createVM(node: string, vmid: number, config: any): Promise<boolean> {
    try {
      await this.makeRequest(`/nodes/${node}/qemu`, "POST", {
        vmid,
        ...config,
      })
      return true
    } catch (error) {
      console.error("Failed to create VM:", error)
      return false
    }
  }

  // Delete VM
  async deleteVM(node: string, vmid: number): Promise<boolean> {
    try {
      await this.makeRequest(`/nodes/${node}/qemu/${vmid}`, "DELETE")
      return true
    } catch (error) {
      console.error("Failed to delete VM:", error)
      return false
    }
  }

  // Get VM configuration
  async getVMConfig(node: string, vmid: number): Promise<any> {
    try {
      const data = await this.makeRequest(`/nodes/${node}/qemu/${vmid}/config`)
      return data.data
    } catch (error) {
      console.error("Failed to get VM config:", error)
      return null
    }
  }

  // Update VM configuration
  async updateVMConfig(node: string, vmid: number, config: any): Promise<boolean> {
    try {
      await this.makeRequest(`/nodes/${node}/qemu/${vmid}/config`, "PUT", config)
      return true
    } catch (error) {
      console.error("Failed to update VM config:", error)
      return false
    }
  }

  // Create VM snapshot
  async createSnapshot(node: string, vmid: number, snapname: string, description?: string): Promise<boolean> {
    try {
      await this.makeRequest(`/nodes/${node}/qemu/${vmid}/snapshot`, "POST", {
        snapname,
        description: description || `Snapshot created on ${new Date().toISOString()}`,
      })
      return true
    } catch (error) {
      console.error("Failed to create snapshot:", error)
      return false
    }
  }

  // Get VM snapshots
  async getSnapshots(node: string, vmid: number): Promise<any[]> {
    try {
      const data = await this.makeRequest(`/nodes/${node}/qemu/${vmid}/snapshot`)
      return data.data || []
    } catch (error) {
      console.error("Failed to get snapshots:", error)
      return []
    }
  }

  // Restore from snapshot
  async restoreSnapshot(node: string, vmid: number, snapname: string): Promise<boolean> {
    try {
      await this.makeRequest(`/nodes/${node}/qemu/${vmid}/snapshot/${snapname}/rollback`, "POST")
      return true
    } catch (error) {
      console.error("Failed to restore snapshot:", error)
      return false
    }
  }

  // Get node statistics
  async getNodeStats(node: string): Promise<any> {
    try {
      const data = await this.makeRequest(`/nodes/${node}/status`)
      return data.data
    } catch (error) {
      console.error("Failed to get node stats:", error)
      return null
    }
  }

  // Get cluster status
  async getClusterStatus(): Promise<any> {
    try {
      const data = await this.makeRequest("/cluster/status")
      return data.data
    } catch (error) {
      console.error("Failed to get cluster status:", error)
      return null
    }
  }

  private generatePassword(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }
}
