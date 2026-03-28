export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

export interface TenantStatus {
  whatsapp: {
    status: ConnectionStatus;
    lastSeen?: string;
    phoneNumber?: string;
  };
  storage: {
    used: number;
    limit: number;
  };
}

export interface FunnelData {
  stage: string;
  count: number;
}

export interface ApiHealth {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  services: {
    database: boolean;
    redis: boolean;
    worker: boolean;
  };
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}
