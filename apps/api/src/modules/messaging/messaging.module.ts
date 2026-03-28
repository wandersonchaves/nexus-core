import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WhatsappService } from './whatsapp.service';
import { MessagingProcessor } from './messaging.processor';
import { QueueMonitorService } from './queue-monitor.service';
import { WhatsappProvider } from '../../infrastructure/messaging/whatsapp.provider';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Global()
@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: 'messaging',
    }),
  ],
  providers: [
    WhatsappService,
    MessagingProcessor,
    QueueMonitorService,
    {
      provide: 'IMessagingProvider',
      useClass: WhatsappProvider,
    },
  ],
  exports: [WhatsappService, QueueMonitorService, BullModule],
})
export class MessagingModule {}
