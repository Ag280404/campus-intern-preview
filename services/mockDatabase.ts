import { User, Submission, Campus, MetricRollup, Target, Notification } from '../types';
import { CAMPUSES, TASKS } from '../constants';

// Default targets for tasks
const DEFAULT_TARGETS: Record<string, number> = {
  't1': 50, // Flyer distribution
  't2': 1,  // Streak (binary)
  't3': 5,  // Social Media
  't4': 10, // Referrals
  't5': 10, // Coupons
};

// Pre-defined credentials mapping User ID -> { password, name, campusId }
const VALID_CREDENTIALS: Record<string, { p: string, n: string, c: string, e?: string, ph?: string, rqr?: string, sqr?: string }> = {
  'admin': { p: 'swiggy_admin', n: 'Super Admin', c: 'c1', e: 'admin@campus.swiggy.com' },
  'catalyst_iitd': { 
    p: 'swiggy_iitd', n: 'Agniswar Das', c: 'c2', 
    e: 'agniswardas28042004@gmail.com', ph: '8335028828',
    rqr: 'RQR-IITD-99', sqr: 'SQR-IITD-99'
  },
  'catalyst_bits': { 
    p: 'swiggy_bits', n: 'Rahul Sharma', c: 'c3', 
    e: 'rahul.bits@campus.com', ph: '9876543210',
    rqr: 'RQR-BITS-22', sqr: 'SQR-BITS-22'
  },
  'catalyst_iitb': { 
    p: 'swiggy_iitb', n: 'Priya Singh', c: 'c1', 
    e: 'priya.iitb@campus.com', ph: '9988776655',
    rqr: 'RQR-IITB-11', sqr: 'SQR-IITB-11'
  },
};

const getInitialUsers = (): User[] => {
  const stored = localStorage.getItem('cg_users');
  if (stored) return JSON.parse(stored);
  
  return [
    {
      id: 'catalyst_iitd',
      displayName: 'Agniswar Das',
      campusId: 'c2',
      email: 'agniswardas28042004@gmail.com',
      phoneNumber: '8335028828',
      createdAt: Date.now() - 10000000,
      lastLoginAt: Date.now(),
      qrCodeId: 'QR-IITD-1',
      rewardsQrCode: 'RQR-IITD-99',
      streaksQrCode: 'SQR-IITD-99',
      shareContactInfo: true,
      taskTargets: { ...DEFAULT_TARGETS }
    },
    {
      id: 'catalyst_bits',
      displayName: 'Rahul Sharma',
      campusId: 'c3',
      email: 'rahul.bits@campus.com',
      phoneNumber: '9876543210',
      createdAt: Date.now() - 20000000,
      lastLoginAt: Date.now(),
      qrCodeId: 'QR-BITS-5',
      rewardsQrCode: 'RQR-BITS-22',
      streaksQrCode: 'SQR-BITS-22',
      shareContactInfo: true,
      taskTargets: { ...DEFAULT_TARGETS }
    },
    {
      id: 'catalyst_iitb',
      displayName: 'Priya Singh',
      campusId: 'c1',
      email: 'priya.iitb@campus.com',
      phoneNumber: '9988776655',
      createdAt: Date.now() - 5000000,
      lastLoginAt: Date.now(),
      qrCodeId: 'QR-IITB-9',
      rewardsQrCode: 'RQR-IITB-11',
      streaksQrCode: 'SQR-IITB-11',
      shareContactInfo: true,
      taskTargets: { ...DEFAULT_TARGETS }
    }
  ];
};

const getInitialSubmissions = (): Submission[] => {
  const stored = localStorage.getItem('cg_submissions');
  if (stored) return JSON.parse(stored);

  const subs: Submission[] = [];
  const taskIds = ['t1', 't3', 't4', 't5'];
  const userIds = ['catalyst_iitd', 'catalyst_bits', 'catalyst_iitb'];

  userIds.forEach((uid, i) => {
    taskIds.forEach((tid, j) => {
      subs.push({
        id: `seed_${uid}_${tid}`,
        userId: uid,
        campusId: uid === 'catalyst_iitd' ? 'c2' : uid === 'catalyst_bits' ? 'c3' : 'c1',
        taskId: tid,
        status: 'approved',
        payload: { count: (i + 1) * 5, scans: (j + 1) * 1, url: 'https://demo.com' },
        createdAt: Date.now() - (86400000 * (i + j)),
        reviewerNote: 'Seed data verified'
      });
    });
  });

  return subs;
};

class MockDatabase {
  private users: User[] = getInitialUsers();
  private submissions: Submission[] = getInitialSubmissions();
  private notifications: Notification[] = JSON.parse(localStorage.getItem('cg_notifications') || '[]');
  private currentUser: User | null = JSON.parse(localStorage.getItem('cg_currentUser') || 'null');

  constructor() {
    this.save();
  }

  private save() {
    localStorage.setItem('cg_users', JSON.stringify(this.users));
    localStorage.setItem('cg_submissions', JSON.stringify(this.submissions));
    localStorage.setItem('cg_notifications', JSON.stringify(this.notifications));
    localStorage.setItem('cg_currentUser', JSON.stringify(this.currentUser));
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
      const latest = this.users.find(u => u.id === this.currentUser?.id);
      if (latest) this.currentUser = latest;
      this.save();
    }
    return this.currentUser;
  }

  getAllUsers(): User[] {
    return this.users;
  }

  updateUser(userId: string, updates: Partial<User>): User | null {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      if (this.currentUser?.id === userId) {
        this.currentUser = { ...this.currentUser, ...updates };
      }
      this.save();
      return this.users[userIndex];
    }
    return null;
  }

  updateUserAvatar(userId: string, avatarUrl: string): User | null {
    return this.updateUser(userId, { avatarUrl });
  }

  login(id: string, password?: string): User | null {
    const cred = VALID_CREDENTIALS[id];
    if (!cred || cred.p !== password) return null;

    let user = this.users.find(u => u.id === id);
    if (!user) {
      user = {
        id: id,
        displayName: cred.n,
        campusId: cred.c,
        email: cred.e || `${id}@campus.swiggy.com`,
        phoneNumber: cred.ph,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        qrCodeId: `QR-${id.split('_')[1]?.toUpperCase() || 'ADMIN'}`,
        rewardsQrCode: cred.rqr || `RQR-${id.toUpperCase()}`,
        streaksQrCode: cred.sqr || `SQR-${id.toUpperCase()}`,
        taskTargets: id === 'admin' ? undefined : { ...DEFAULT_TARGETS }
      };
      this.users.push(user);
    } else {
      user.lastLoginAt = Date.now();
      if (!user.taskTargets && id !== 'admin') {
        user.taskTargets = { ...DEFAULT_TARGETS };
      }
    }
    
    this.currentUser = user;
    this.save();
    return user;
  }

  logout() {
    this.currentUser = null;
    this.save();
  }

  sendNotification(recipientId: string, content: string) {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      recipientId,
      content,
      createdAt: Date.now(),
      isRead: false
    };
    this.notifications.push(newNotif);
    this.save();
    return newNotif;
  }

  getNotifications(userId: string): Notification[] {
    return this.notifications.filter(n => n.recipientId === 'all' || n.recipientId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  markNotificationAsRead(id: string) {
    const n = this.notifications.find(notif => notif.id === id);
    if (n) {
      n.isRead = true;
      this.save();
    }
  }

  markAllNotificationsRead(userId: string) {
    this.notifications.forEach(n => {
      if (n.recipientId === 'all' || n.recipientId === userId) {
        n.isRead = true;
      }
    });
    this.save();
  }

  deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.save();
  }

  submitTask(submission: Omit<Submission, 'id' | 'createdAt' | 'status'>): Submission {
    const newSub: Submission = {
      ...submission,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      status: 'submitted'
    };
    this.submissions.push(newSub);
    this.save();
    return newSub;
  }

  getSubmissions(userId?: string): Submission[] {
    if (userId) return this.submissions.filter(s => s.userId === userId);
    return this.submissions;
  }

  approveSubmission(id: string, note?: string) {
    const sub = this.submissions.find(s => s.id === id);
    if (sub) {
      sub.status = 'approved';
      sub.reviewerNote = note;
      this.save();
    }
  }

  rejectSubmission(id: string, note?: string) {
    const sub = this.submissions.find(s => s.id === id);
    if (sub) {
      sub.status = 'rejected';
      sub.reviewerNote = note;
      this.save();
    }
  }

  getLeaderboard(): MetricRollup[] {
    const rollups: Record<string, MetricRollup> = {};
    
    this.users.forEach(u => {
      if (u.id === 'admin') return;
      rollups[u.id] = {
        userId: u.id,
        score: 0,
        metrics: { flyers: 0, content: 0, scans: 0, signups: 0, coupons: 0 }
      };
    });

    this.submissions.filter(s => s.status === 'approved').forEach(s => {
      const task = TASKS.find(t => t.id === s.taskId);
      if (!task || !rollups[s.userId]) return;

      rollups[s.userId].score += task.points;

      if (task.type === 'offline_activation') rollups[s.userId].metrics.flyers += Number(s.payload.count || 0);
      if (task.type === 'social_media') rollups[s.userId].metrics.content += 1;
      if (task.type === 'referral') rollups[s.userId].metrics.scans += 1;
      if (task.type === 'student_rewards') rollups[s.userId].metrics.coupons += 1;
    });
    
    return Object.values(rollups).sort((a, b) => b.score - a.score);
  }

  getCampusName(id: string) {
    return CAMPUSES.find(c => c.id === id)?.name || 'Unknown';
  }

  getUserById(id: string): User {
    const user = this.users.find(u => u.id === id);
    if (user) return user;
    const cred = VALID_CREDENTIALS[id];
    return { 
      id: id,
      displayName: cred?.n || 'Catalyst', 
      campusId: cred?.c || 'c1',
      email: cred?.e || `${id}@campus.swiggy.com`,
      createdAt: 0,
      lastLoginAt: 0,
      qrCodeId: `QR-${id.split('_')[1]?.toUpperCase() || 'UNKNOWN'}`,
      rewardsQrCode: cred?.rqr || `RQR-${id.toUpperCase()}`,
      streaksQrCode: cred?.sqr || `SQR-${id.toUpperCase()}`,
      taskTargets: { ...DEFAULT_TARGETS }
    };
  }
}

export const db = new MockDatabase();