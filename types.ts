export type TaskType = 'offline_activation' | 'streaks' | 'social_media' | 'student_rewards' | 'referral';

export interface Campus {
  id: string;
  name: string;
  city: string;
}

export interface User {
  id: string;
  displayName: string;
  campusId: string;
  email?: string;
  phoneNumber?: string;
  createdAt: number;
  lastLoginAt: number;
  qrCodeId: string;
  rewardsQrCode?: string;
  streaksQrCode?: string;
  rewardsOnelink?: string;
  streaksOnelink?: string;
  avatarUrl?: string; // Base64 or URL for the profile picture
  shareContactInfo?: boolean; // Whether the user wants to share details with peers
  taskTargets?: Record<string, number>; // Mapping task ID to a target number
}

export interface Notification {
  id: string;
  recipientId: string; // userId or 'all'
  content: string;
  createdAt: number;
  isRead: boolean;
}

export interface Task {
  id: string;
  type: TaskType;
  name: string;
  description: string;
  points: number;
  instructions?: string;
  deadlineDays?: number; // Days left for the task completion
}

export interface Submission {
  id: string;
  userId: string;
  campusId: string;
  taskId: string;
  status: 'submitted' | 'approved' | 'rejected';
  payload: any;
  proofUrl?: string;
  location?: { lat: number; lng: number };
  createdAt: number;
  reviewerNote?: string;
}

export interface Target {
  userId: string;
  targets: {
    flyers: number;
    reels: number;
    qrScans: number;
    signups: number;
    coupons: number;
  };
}

export interface MetricRollup {
  userId: string;
  score: number;
  metrics: {
    flyers: number;
    content: number;
    scans: number;
    signups: number;
    coupons: number;
  };
}