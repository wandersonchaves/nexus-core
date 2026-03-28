export interface IMessagingProvider {
  sendMessage(to: string, message: string, sessionData?: any): Promise<void>;
}
