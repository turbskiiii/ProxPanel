import { NextRequest, NextResponse } from 'next/server';
import { backupDisasterRecovery } from '@/lib/backup-disaster-recovery';
import { logger } from '@/lib/logger';
import { apiRateLimiter } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'unknown';
    const { allowed } = await apiRateLimiter.isAllowed(identifier);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const snapshotId = searchParams.get('snapshotId');
    const planId = searchParams.get('planId');
    const type = searchParams.get('type'); // 'backup', 'recovery', 'storage'

    if (jobId) {
      const job = backupDisasterRecovery.getBackupJob(jobId);
      if (!job) {
        return NextResponse.json(
          { error: 'Backup job not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ job });
    }

    if (snapshotId) {
      const snapshot = backupDisasterRecovery.getSnapshot(snapshotId);
      if (!snapshot) {
        return NextResponse.json(
          { error: 'Snapshot not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ snapshot });
    }

    if (planId) {
      const plan = backupDisasterRecovery.getRecoveryPlan(planId);
      if (!plan) {
        return NextResponse.json(
          { error: 'Recovery plan not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ plan });
    }

    // Get all data based on type
    const backupJobs = Array.from(
      backupDisasterRecovery['backupJobs'].values()
    );
    const snapshots = Array.from(
      backupDisasterRecovery['backupSnapshots'].values()
    );
    const recoveryPlans = Array.from(
      backupDisasterRecovery['recoveryPlans'].values()
    );
    const recoveryJobs = Array.from(
      backupDisasterRecovery['recoveryJobs'].values()
    );
    const storageProviders = backupDisasterRecovery.getStorageProviders();

    if (type === 'backup') {
      return NextResponse.json({
        jobs: backupJobs,
        snapshots,
        storage: storageProviders,
        total: {
          jobs: backupJobs.length,
          snapshots: snapshots.length,
          storage: storageProviders.length,
        },
      });
    } else if (type === 'recovery') {
      return NextResponse.json({
        plans: recoveryPlans,
        jobs: recoveryJobs,
        total: {
          plans: recoveryPlans.length,
          jobs: recoveryJobs.length,
        },
      });
    } else if (type === 'storage') {
      return NextResponse.json({
        providers: storageProviders,
        total: storageProviders.length,
      });
    }

    // Return all data
    return NextResponse.json({
      backup: {
        jobs: backupJobs,
        snapshots,
        total: {
          jobs: backupJobs.length,
          snapshots: snapshots.length,
        },
      },
      recovery: {
        plans: recoveryPlans,
        jobs: recoveryJobs,
        total: {
          plans: recoveryPlans.length,
          jobs: recoveryJobs.length,
        },
      },
      storage: {
        providers: storageProviders,
        total: storageProviders.length,
      },
      analytics: backupDisasterRecovery.getSystemAnalytics(),
    });
  } catch (error) {
    logger.error('Error fetching backup/disaster recovery data', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'unknown';
    const { allowed } = await apiRateLimiter.isAllowed(identifier);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { type, ...data } = body;

    if (!type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 });
    }

    if (type === 'backup-job') {
      const { name, target, schedule, retention, storage } = data;

      if (!name || !target || !schedule || !retention || !storage) {
        return NextResponse.json(
          { error: 'Missing required fields for backup job' },
          { status: 400 }
        );
      }

      const job = backupDisasterRecovery.createBackupJob(
        name,
        target,
        schedule,
        retention,
        storage
      );
      return NextResponse.json(
        {
          job,
          message: 'Backup job created successfully',
        },
        { status: 201 }
      );
    } else if (type === 'recovery-plan') {
      const { name, description, priority, rto, rpo, steps } = data;

      if (!name || !description || !priority || !rto || !rpo || !steps) {
        return NextResponse.json(
          { error: 'Missing required fields for recovery plan' },
          { status: 400 }
        );
      }

      const plan = backupDisasterRecovery.createRecoveryPlan(
        name,
        description,
        priority,
        rto,
        rpo,
        steps
      );
      return NextResponse.json(
        {
          plan,
          message: 'Recovery plan created successfully',
        },
        { status: 201 }
      );
    } else if (type === 'execute-backup') {
      const { jobId } = data;

      if (!jobId) {
        return NextResponse.json(
          { error: 'Job ID is required' },
          { status: 400 }
        );
      }

      const snapshot = await backupDisasterRecovery.executeBackup(jobId);
      if (!snapshot) {
        return NextResponse.json(
          { error: 'Failed to execute backup' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        snapshot,
        message: 'Backup executed successfully',
      });
    } else if (type === 'execute-recovery') {
      const { planId, name } = data;

      if (!planId || !name) {
        return NextResponse.json(
          { error: 'Plan ID and name are required' },
          { status: 400 }
        );
      }

      const job = await backupDisasterRecovery.executeRecovery(planId, name);
      if (!job) {
        return NextResponse.json(
          { error: 'Failed to execute recovery' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        job,
        message: 'Recovery executed successfully',
      });
    } else if (type === 'verify-backup') {
      const { snapshotId, verificationType } = data;

      if (!snapshotId || !verificationType) {
        return NextResponse.json(
          { error: 'Snapshot ID and verification type are required' },
          { status: 400 }
        );
      }

      const verification = await backupDisasterRecovery.verifyBackup(
        snapshotId,
        verificationType
      );
      if (!verification) {
        return NextResponse.json(
          { error: 'Failed to verify backup' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        verification,
        message: 'Backup verification completed',
      });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Error in backup/disaster recovery operation', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'unknown';
    const { allowed } = await apiRateLimiter.isAllowed(identifier);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { type, id, updates } = body;

    if (!type || !id || !updates) {
      return NextResponse.json(
        { error: 'Type, ID, and updates are required' },
        { status: 400 }
      );
    }

    let result;
    if (type === 'backup-job') {
      result = backupDisasterRecovery.updateBackupJob(id, updates);
    } else if (type === 'recovery-plan') {
      result = backupDisasterRecovery.updateRecoveryPlan(id, updates);
    } else if (type === 'storage-provider') {
      result = backupDisasterRecovery.updateStorageProvider(id, updates);
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      result,
      message: 'Resource updated successfully',
    });
  } catch (error) {
    logger.error('Error updating backup/disaster recovery resource', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'unknown';
    const { allowed } = await apiRateLimiter.isAllowed(identifier);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const snapshotId = searchParams.get('snapshotId');
    const planId = searchParams.get('planId');

    if (jobId) {
      const success = backupDisasterRecovery.deleteBackupJob(jobId);
      if (!success) {
        return NextResponse.json(
          { error: 'Backup job not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ message: 'Backup job deleted successfully' });
    }

    if (snapshotId) {
      const success = backupDisasterRecovery.deleteSnapshot(snapshotId);
      if (!success) {
        return NextResponse.json(
          { error: 'Snapshot not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ message: 'Snapshot deleted successfully' });
    }

    if (planId) {
      // Note: We don't have a deleteRecoveryPlan method, so we'll update it to archived status
      const plan = backupDisasterRecovery.updateRecoveryPlan(planId, {
        status: 'archived',
      });
      if (!plan) {
        return NextResponse.json(
          { error: 'Recovery plan not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        message: 'Recovery plan archived successfully',
      });
    }

    return NextResponse.json(
      { error: 'No resource specified for deletion' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Error deleting backup/disaster recovery resource', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
