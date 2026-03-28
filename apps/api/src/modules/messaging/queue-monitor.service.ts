import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueMonitorService {
  private readonly logger = new Logger(QueueMonitorService.name);

  constructor(@InjectQueue('messaging') private readonly messagingQueue: Queue) {}

  async getJobCounts() {
    const counts = await this.messagingQueue.getJobCounts('waiting', 'active', 'failed', 'completed', 'delayed');
    this.logger.log(`[QUEUE MONITOR] Messaging Queue - Waiting: ${counts.waiting}, Active: ${counts.active}, Failed: ${counts.failed}`);
    return counts;
  }
}
