import https from 'https';

interface ProxmoxConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  realm: string;
  rejectUnauthorized?: boolean;
}

interface ProxmoxTicket {
  ticket: string;
  CSRFPreventionToken: string;
}

export class ProxmoxClient {
  private config: ProxmoxConfig;
  private ticket: string | null = null;
  private csrfToken: string | null = null;
  private authenticated = false;

  constructor(config: ProxmoxConfig) {
    this.config = {
      rejectUnauthorized: false, // For self-signed certificates
      ...config,
    };
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.makeRequest(
        '/access/ticket',
        'POST',
        {
          username: `${this.config.username}@${this.config.realm}`,
          password: this.config.password,
        },
        false
      );

      if (response.data) {
        this.ticket = response.data.ticket;
        this.csrfToken = response.data.CSRFPreventionToken;
        this.authenticated = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Proxmox authentication failed:', error);
      return false;
    }
  }

  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    requireAuth = true
  ): Promise<any> {
    if (requireAuth && !this.authenticated) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) {
        throw new Error('Authentication failed');
      }
    }

    const url = `https://${this.config.host}:${this.config.port}/api2/json${endpoint}`;

    const options: any = {
      method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      agent: new https.Agent({
        rejectUnauthorized: this.config.rejectUnauthorized,
      }),
    };

    if (requireAuth && this.ticket) {
      options.headers.Cookie = `PVEAuthCookie=${this.ticket}`;
      if (this.csrfToken && method !== 'GET') {
        options.headers['CSRFPreventionToken'] = this.csrfToken;
      }
    }

    let body = '';
    if (data && method !== 'GET') {
      body = new URLSearchParams(data).toString();
    }

    return new Promise((resolve, reject) => {
      const req = https.request(url, options, res => {
        let responseData = '';
        res.on('data', chunk => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (
              res.statusCode &&
              res.statusCode >= 200 &&
              res.statusCode < 300
            ) {
              resolve(parsed);
            } else {
              reject(
                new Error(
                  `HTTP ${res.statusCode}: ${parsed.errors || responseData}`
                )
              );
            }
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${responseData}`));
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(body);
      }
      req.end();
    });
  }

  // Get all VMs across all nodes
  async getVMs(): Promise<any[]> {
    const response = await this.makeRequest('/cluster/resources?type=vm');
    return response.data || [];
  }

  // Get specific VM details
  async getVMConfig(node: string, vmid: number): Promise<any> {
    const response = await this.makeRequest(
      `/nodes/${node}/qemu/${vmid}/config`
    );
    return response.data;
  }

  // Get VM status
  async getVMStatus(node: string, vmid: number): Promise<any> {
    const response = await this.makeRequest(
      `/nodes/${node}/qemu/${vmid}/status/current`
    );
    return response.data;
  }

  // Create new VM
  async createVM(node: string, vmid: number, config: any): Promise<string> {
    const response = await this.makeRequest(`/nodes/${node}/qemu`, 'POST', {
      vmid,
      ...config,
    });
    return response.data; // Returns task ID
  }

  // Start VM
  async startVM(node: string, vmid: number): Promise<string> {
    const response = await this.makeRequest(
      `/nodes/${node}/qemu/${vmid}/status/start`,
      'POST'
    );
    return response.data;
  }

  // Stop VM
  async stopVM(node: string, vmid: number): Promise<string> {
    const response = await this.makeRequest(
      `/nodes/${node}/qemu/${vmid}/status/stop`,
      'POST'
    );
    return response.data;
  }

  // Reboot VM
  async rebootVM(node: string, vmid: number): Promise<string> {
    const response = await this.makeRequest(
      `/nodes/${node}/qemu/${vmid}/status/reboot`,
      'POST'
    );
    return response.data;
  }

  // Delete VM
  async deleteVM(node: string, vmid: number): Promise<string> {
    const response = await this.makeRequest(
      `/nodes/${node}/qemu/${vmid}`,
      'DELETE'
    );
    return response.data;
  }

  // Get available nodes
  async getNodes(): Promise<any[]> {
    const response = await this.makeRequest('/nodes');
    return response.data || [];
  }

  // Get node status
  async getNodeStatus(node: string): Promise<any> {
    const response = await this.makeRequest(`/nodes/${node}/status`);
    return response.data;
  }

  // Get storage information
  async getStorage(node: string): Promise<any[]> {
    const response = await this.makeRequest(`/nodes/${node}/storage`);
    return response.data || [];
  }

  // Get available VM templates
  async getTemplates(node: string, storage: string): Promise<any[]> {
    const response = await this.makeRequest(
      `/nodes/${node}/storage/${storage}/content?content=vztmpl`
    );
    return response.data || [];
  }

  // Clone VM from template
  async cloneVM(
    node: string,
    vmid: number,
    newid: number,
    config: any
  ): Promise<string> {
    const response = await this.makeRequest(
      `/nodes/${node}/qemu/${vmid}/clone`,
      'POST',
      {
        newid,
        ...config,
      }
    );
    return response.data;
  }

  // Get task status
  async getTaskStatus(node: string, upid: string): Promise<any> {
    const response = await this.makeRequest(
      `/nodes/${node}/tasks/${upid}/status`
    );
    return response.data;
  }

  // Wait for task completion
  async waitForTask(
    node: string,
    upid: string,
    timeout = 300000
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const status = await this.getTaskStatus(node, upid);

      if (status.status === 'stopped') {
        return status.exitstatus === 'OK';
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Task timeout');
  }

  // Get VM metrics
  async getVMMetrics(node: string, vmid: number): Promise<any> {
    const response = await this.makeRequest(
      `/nodes/${node}/qemu/${vmid}/rrddata?timeframe=hour`
    );
    return response.data;
  }

  // Set VM password
  async setVMPassword(
    node: string,
    vmid: number,
    username: string,
    password: string
  ): Promise<boolean> {
    try {
      await this.makeRequest(
        `/nodes/${node}/qemu/${vmid}/agent/set-user-password`,
        'POST',
        {
          username,
          password,
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to set VM password:', error);
      return false;
    }
  }

  // Get next available VM ID
  async getNextVMID(): Promise<number> {
    const vms = await this.getVMs();
    const usedIds = vms.map(vm => vm.vmid).sort((a, b) => a - b);

    // Start from 100 and find first available ID
    for (let id = 100; id < 999999; id++) {
      if (!usedIds.includes(id)) {
        return id;
      }
    }

    throw new Error('No available VM IDs');
  }

  /**
   * Request a VNC proxy ticket for a VM
   */
  public async requestVNCProxy(node: string, vmid: number): Promise<any> {
    return this.makeRequest(`/nodes/${node}/qemu/${vmid}/vncproxy`, 'POST', {
      websocket: 1,
    }).then(resp => resp.data);
  }
}
