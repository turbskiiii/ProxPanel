import nodemailer from 'nodemailer';
import { logger } from './logger';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'localhost',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransporter(config);
  }

  async sendVPSCreated(userEmail: string, vpsDetails: any): Promise<boolean> {
    try {
      const template = this.getVPSCreatedTemplate(vpsDetails);

      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@proxpanel.com',
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      logger.info('VPS creation email sent', {
        userEmail,
        vpsId: vpsDetails.id,
      });
      return true;
    } catch (error) {
      logger.error('Failed to send VPS creation email', {
        error: error.message,
        userEmail,
      });
      return false;
    }
  }

  async sendVPSStatusChange(
    userEmail: string,
    vpsDetails: any,
    oldStatus: string,
    newStatus: string
  ): Promise<boolean> {
    try {
      const template = this.getStatusChangeTemplate(
        vpsDetails,
        oldStatus,
        newStatus
      );

      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@proxpanel.com',
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      logger.info('VPS status change email sent', {
        userEmail,
        vpsId: vpsDetails.id,
        oldStatus,
        newStatus,
      });
      return true;
    } catch (error) {
      logger.error('Failed to send status change email', {
        error: error.message,
        userEmail,
      });
      return false;
    }
  }

  async sendMaintenanceNotification(
    userEmail: string,
    maintenanceDetails: any
  ): Promise<boolean> {
    try {
      const template = this.getMaintenanceTemplate(maintenanceDetails);

      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@proxpanel.com',
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      logger.info('Maintenance notification sent', { userEmail });
      return true;
    } catch (error) {
      logger.error('Failed to send maintenance notification', {
        error: error.message,
        userEmail,
      });
      return false;
    }
  }

  private getVPSCreatedTemplate(vpsDetails: any): EmailTemplate {
    return {
      subject: `Your VPS "${vpsDetails.name}" is Ready!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Your VPS is Ready! 🎉</h2>
          
          <p>Your virtual private server has been successfully created and is ready to use.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>VPS Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Name:</strong> ${vpsDetails.name}</li>
              <li><strong>VM ID:</strong> ${vpsDetails.vmid}</li>
              <li><strong>Location:</strong> ${vpsDetails.node}</li>
              <li><strong>IP Address:</strong> ${vpsDetails.ipAddress || 'Will be assigned shortly'}</li>
              <li><strong>Root Password:</strong> <code>${vpsDetails.rootPassword}</code></li>
            </ul>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>⚠️ Security Note:</strong> Please change your root password after first login for security.</p>
          </div>
          
          <p>You can manage your VPS from the <a href="${process.env.APP_URL}/dashboard/vps/${vpsDetails.id}">ProxPanel Dashboard</a>.</p>
          
          <p>Need help? Check our <a href="${process.env.APP_URL}/docs">documentation</a> or contact support.</p>
        </div>
      `,
      text: `Your VPS "${vpsDetails.name}" is Ready!

VPS Details:
- Name: ${vpsDetails.name}
- VM ID: ${vpsDetails.vmid}
- Location: ${vpsDetails.node}
- Root Password: ${vpsDetails.rootPassword}

Please change your root password after first login for security.

Manage your VPS: ${process.env.APP_URL}/dashboard/vps/${vpsDetails.id}`,
    };
  }

  private getStatusChangeTemplate(
    vpsDetails: any,
    oldStatus: string,
    newStatus: string
  ): EmailTemplate {
    const statusEmoji =
      newStatus === 'running' ? '🟢' : newStatus === 'stopped' ? '🔴' : '🟡';

    return {
      subject: `VPS "${vpsDetails.name}" Status Changed: ${newStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>VPS Status Update ${statusEmoji}</h2>
          
          <p>Your VPS status has changed:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>VPS:</strong> ${vpsDetails.name}</p>
            <p><strong>Previous Status:</strong> ${oldStatus}</p>
            <p><strong>Current Status:</strong> ${newStatus}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>View details in your <a href="${process.env.APP_URL}/dashboard/vps/${vpsDetails.id}">ProxPanel Dashboard</a>.</p>
        </div>
      `,
      text: `VPS Status Update

Your VPS "${vpsDetails.name}" status changed from ${oldStatus} to ${newStatus}.

Time: ${new Date().toLocaleString()}

View details: ${process.env.APP_URL}/dashboard/vps/${vpsDetails.id}`,
    };
  }

  private getMaintenanceTemplate(maintenanceDetails: any): EmailTemplate {
    return {
      subject: `Scheduled Maintenance: ${maintenanceDetails.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Scheduled Maintenance Notice 🔧</h2>
          
          <p>We have scheduled maintenance that may affect your services:</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3>${maintenanceDetails.title}</h3>
            <p><strong>Start Time:</strong> ${maintenanceDetails.startTime}</p>
            <p><strong>End Time:</strong> ${maintenanceDetails.endTime}</p>
            <p><strong>Affected Services:</strong> ${maintenanceDetails.affectedServices}</p>
            <p><strong>Description:</strong> ${maintenanceDetails.description}</p>
          </div>
          
          <p>We apologize for any inconvenience and will work to minimize downtime.</p>
          
          <p>For updates, check your <a href="${process.env.APP_URL}/dashboard">ProxPanel Dashboard</a>.</p>
        </div>
      `,
      text: `Scheduled Maintenance Notice

${maintenanceDetails.title}

Start Time: ${maintenanceDetails.startTime}
End Time: ${maintenanceDetails.endTime}
Affected Services: ${maintenanceDetails.affectedServices}

Description: ${maintenanceDetails.description}

Check dashboard for updates: ${process.env.APP_URL}/dashboard`,
    };
  }
}
