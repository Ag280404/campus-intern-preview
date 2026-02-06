
import { createClient } from '@supabase/supabase-js';
import { User, Submission, Campus, MetricRollup, Notification, Task } from '../types';
import { CAMPUSES } from '../constants';

const SUPABASE_URL = 'https://vecxlslkdyqtuxhrvcuz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlY3hsc2xrZHlxdHV4aHJ2Y3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMDY2OTAsImV4cCI6MjA4NTY4MjY5MH0.ldSCs5ebGeki_3Ik_X7JRaVlb4sj0GH_u76izRMNKdA'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DEFAULT_PROFILES: Record<string, any> = {
  'admin': { p: 'swiggy_admin', n: 'Super Admin', c: 'c1', e: 'admin@campus.swiggy.com' },
  'catalyst_iitd': { p: 'swiggy_iitd', n: 'Agniswar Das', c: 'c2', e: 'agniswardas28042004@gmail.com' },
  'catalyst_bits': { p: 'swiggy_bits', n: 'BITS Catalyst', c: 'c3', e: 'catalyst.bits@campus.com' },
  'catalyst_iitb': { p: 'swiggy_iitb', n: 'Priya Singh', c: 'c1', e: 'priya.iitb@campus.com' },
};

class MockDatabase {
  private currentUser: User | null = JSON.parse(localStorage.getItem('cg_currentUser') || 'null');

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('cg_currentUser');
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return (data || []).map((u: any) => this.mapUser(u));
  }

  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) throw error;
    return (data || []).map((t: any) => ({
      id: t.id,
      type: t.type,
      name: t.name,
      description: t.description,
      points: t.points,
      instructions: t.instructions,
      deadlineDays: t.deadline_days
    }));
  }

  async login(id: string, password?: string): Promise<User | null> {
    if (!id || !password) throw new Error("Credentials required.");
    
    const { data: dbUser, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (error) throw error;

    let userToMap = dbUser;

    if (!dbUser) {
      const profile = DEFAULT_PROFILES[id];
      if (!profile || profile.p !== password) throw new Error("Invalid credentials or user not found.");
      
      const newUser = {
        id, password: profile.p, display_name: profile.n, campus_id: profile.c,
        email: profile.e, created_at: Date.now(), last_login_at: Date.now(),
        task_targets: { 't1': 50, 't2': 1, 't3': 5, 't4': 10, 't5': 10 }
      };
      const { data: seeded, error: iErr } = await supabase.from('users').insert(newUser).select().single();
      if (iErr) throw iErr;
      userToMap = seeded;
    } else {
      if (dbUser.password !== password) throw new Error("Invalid password.");
      await supabase.from('users').update({ last_login_at: Date.now() }).eq('id', id);
    }

    const mapped = this.mapUser(userToMap);
    this.currentUser = mapped;
    localStorage.setItem('cg_currentUser', JSON.stringify(mapped));
    return mapped;
  }

  private mapUser(dbUser: any): User {
    return {
      id: dbUser.id,
      displayName: dbUser.display_name,
      campusId: dbUser.campus_id,
      email: dbUser.email,
      phoneNumber: dbUser.phone_number,
      createdAt: dbUser.created_at,
      lastLoginAt: dbUser.last_login_at,
      qrCodeId: dbUser.qr_code_id,
      rewardsQrCode: dbUser.rewards_qr_code,
      streaksQrCode: dbUser.streaks_qr_code,
      rewardsOnelink: dbUser.rewards_onelink,
      streaksOnelink: dbUser.streaks_onelink,
      avatarUrl: dbUser.avatar_url,
      shareContactInfo: dbUser.share_contact_info,
      taskTargets: dbUser.task_targets
    };
  }

  async submitTask(submission: Omit<Submission, 'id' | 'createdAt' | 'status'>): Promise<Submission> {
    const dbSub = {
      user_id: submission.userId,
      campus_id: submission.campusId,
      task_id: submission.taskId,
      status: 'submitted',
      recipient_name: submission.payload?.recipientName || null,
      recipient_phone: submission.payload?.recipientPhone || null,
      recipient_email: submission.payload?.recipientEmail || null,
      payload: submission.payload,
      location: submission.location,
      created_at: Date.now()
    };
    const { data, error } = await supabase.from('submissions').insert(dbSub).select().single();
    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      campusId: data.campus_id,
      taskId: data.task_id,
      status: data.status,
      payload: data.payload,
      location: data.location,
      createdAt: data.created_at
    };
  }

  async getSubmissions(userId?: string): Promise<Submission[]> {
    let query = supabase.from('submissions').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map((s: any) => ({
      id: s.id,
      userId: s.user_id,
      campusId: s.campus_id,
      taskId: s.task_id,
      status: s.status,
      payload: {
        ...s.payload,
        recipientName: s.recipient_name || s.payload?.recipientName,
        recipientPhone: s.recipient_phone || s.payload?.recipientPhone,
        recipientEmail: s.recipient_email || s.payload?.recipientEmail
      },
      location: s.location,
      createdAt: s.created_at,
      reviewerNote: s.reviewer_note
    }));
  }

  async getLeaderboard(): Promise<MetricRollup[]> {
    const [users, tasks, subs] = await Promise.all([
      this.getAllUsers(),
      this.getTasks(),
      this.getSubmissions()
    ]);
    
    const rollups: Record<string, MetricRollup> = {};
    users.filter(u => u.id !== 'admin').forEach(u => {
      rollups[u.id] = {
        userId: u.id,
        score: 0,
        metrics: { flyers: 0, content: 0, scans: 0, signups: 0, coupons: 0 }
      };
    });

    subs.filter(s => s.status === 'approved').forEach(s => {
      const task = tasks.find(t => t.id === s.taskId);
      if (!task || !rollups[s.userId]) return;

      rollups[s.userId].score += task.points;
      if (task.type === 'offline_activation') rollups[s.userId].metrics.flyers += Number(s.payload.count || 0);
      if (task.type === 'social_media') rollups[s.userId].metrics.content += 1;
      if (task.type === 'referral') rollups[s.userId].metrics.scans += 1;
      if (task.type === 'student_rewards') rollups[s.userId].metrics.coupons += 1;
    });
    
    return Object.values(rollups).sort((a, b) => b.score - a.score);
  }

  async updateUser(userId: string, updates: Partial<User>) {
    const dbUpdates: any = {};
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
    if (updates.shareContactInfo !== undefined) dbUpdates.share_contact_info = updates.shareContactInfo;
    if (updates.taskTargets !== undefined) dbUpdates.task_targets = updates.taskTargets;
    if (updates.rewardsOnelink !== undefined) dbUpdates.rewards_onelink = updates.rewardsOnelink;
    if (updates.streaksOnelink !== undefined) dbUpdates.streaks_onelink = updates.streaksOnelink;
    
    const { data, error } = await supabase.from('users').update(dbUpdates).eq('id', userId).select().single();
    if (error) throw error;
    const mapped = this.mapUser(data);
    if (this.currentUser?.id === userId) {
      this.currentUser = mapped;
      localStorage.setItem('cg_currentUser', JSON.stringify(mapped));
    }
    return mapped;
  }

  async updateUserAvatar(userId: string, avatarUrl: string): Promise<User> {
    const { data, error } = await supabase.from('users').update({ avatar_url: avatarUrl }).eq('id', userId).select().single();
    if (error) throw error;
    const mapped = this.mapUser(data);
    if (this.currentUser?.id === userId) {
      this.currentUser = mapped;
      localStorage.setItem('cg_currentUser', JSON.stringify(mapped));
    }
    return mapped;
  }

  async approveSubmission(id: string, note?: string) {
    await supabase.from('submissions').update({ status: 'approved', reviewer_note: note }).eq('id', id);
  }

  async rejectSubmission(id: string, note?: string) {
    await supabase.from('submissions').update({ status: 'rejected', reviewer_note: note }).eq('id', id);
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase.from('notifications').select('*').or(`recipient_id.eq.all,recipient_id.eq.${userId}`).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((n: any) => ({ 
      id: n.id, 
      recipientId: n.recipient_id, 
      content: n.content, 
      createdAt: n.created_at, 
      isRead: n.is_read 
    }));
  }

  async markAllNotificationsRead(userId: string) {
    await supabase.from('notifications').update({ is_read: true }).or(`recipient_id.eq.all,recipient_id.eq.${userId}`);
  }

  async sendNotification(recipientId: string, content: string) {
    await supabase.from('notifications').insert({ recipient_id: recipientId, content, created_at: Date.now(), is_read: false });
  }

  async deleteNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id);
  }

  getCampusName(id: string) {
    return CAMPUSES.find(c => c.id === id)?.name || 'Unknown Campus';
  }

  async getUserById(id: string) {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return this.mapUser(data);
  }
}

export const db = new MockDatabase();
