import { Injectable, Logger } from '@nestjs/common';
import { IMessagingProvider } from '../../core/messaging/interfaces';

@Injectable()
export class WhatsappProvider implements IMessagingProvider {
  private readonly logger = new Logger(WhatsappProvider.name);

  async sendMessage(to: string, message: string, sessionData?: any): Promise<void> {
    this.logger.log(`[WHATSAPP PROVIDER] Sending message to ${to}: "${message.substring(0, 50)}..."`);
    // Emulate sending through a WhatsApp API/Gateway
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.logger.log(`[WHATSAPP PROVIDER] Message sent to ${to}`);
  }
}
