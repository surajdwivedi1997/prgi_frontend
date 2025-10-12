// client/types/token.types.ts

export type QueueStatus = 'WAITING' | 'CALLED' | 'SERVING' | 'COMPLETED' | 'CANCELLED';

export interface Token {
  id: number;
  tokenNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  queueStatus: QueueStatus;
  queuePosition: number;
  estimatedTime: string | null;
  createdAt: string;
  calledAt: string | null;
  servingStartedAt: string | null;
  completedAt: string | null;
  appointment?: {
    id: number;
    title: string;
    description: string;
  };
}

export interface TokenStats {
  total: number;
  waiting: number;
  called: number;
  serving: number;
  completed: number;
  averageWaitTime: string;
}

export interface CreateTokenRequest {
  userId: number;
  appointmentId?: number;
}