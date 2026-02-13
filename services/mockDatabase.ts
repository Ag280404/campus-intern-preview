
import { createClient } from '@supabase/supabase-js';
import { User, Submission, Campus, MetricRollup, Notification, Task, CampusEvent } from '../types';
import { CAMPUSES, TASKS } from '../constants';

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
    if (error) {
      console.warn("Could not fetch tasks from Supabase, using local constants.", error);
      return TASKS;
    }
    
    return (data || []).map((t: any) => {
      const localTask = TASKS.find(lt => lt.id === t.id);
      return {
        id: t.id,
        type: t.type,
        name: t.name,
        description: t.description,
        points: t.points,
        instructions: localTask ? localTask.instructions : t.instructions,
        deadlineDays: t.deadline_days
      };
    });
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (error) return null;
    return data ? this.mapUser(data) : null;
  }

  getCampusName(id: string): string {
    return CAMPUSES.find(c => c.id === id)?.name || 'Unknown Campus';
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
        id, 
        password: profile.p, 
        display_name: profile.n, 
        campus_id: profile.c,
        email: profile.e, 
        created_at: Date.now(), 
        last_login_at: Date.now(),
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

  async submitTask(submission: Omit<Submission, 'id' | 'status' | 'createdAt'>): Promise<Submission> {
    const newSub = {
      ...submission,
      status: 'submitted',
      createdAt: Date.now(),
      payload: submission.payload || {}
    };
    const { data, error } = await supabase.from('submissions').insert(newSub).select().single();
    if (error) throw error;
    return data;
  }

  async getSubmissions(userId?: string): Promise<Submission[]> {
    let query = supabase.from('submissions').select('*').order('createdAt', { ascending: false });
    if (userId) query = query.eq('userId', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async approveSubmission(id: string, note?: string): Promise<void> {
    const { error } = await supabase.from('submissions').update({ status: 'approved', reviewerNote: note }).eq('id', id);
    if (error) throw error;
  }

  async rejectSubmission(id: string, note?: string): Promise<void> {
    const { error } = await supabase.from('submissions').update({ status: 'rejected', reviewerNote: note }).eq('id', id);
    if (error) throw error;
  }

  async getLeaderboard(): Promise<MetricRollup[]> {
    const { data, error } = await supabase.from('leaderboard').select('*').order('score', { ascending: false });
    if (error) throw error;
    
    // If table is empty, return high-fidelity mock data for demonstration
    if (!data || data.length === 0) {
      return [
        { userId: 'catalyst_iitd', score: 1250, metrics: { flyers: 120, content: 15, scans: 450, signups: 85, coupons: 200 } },
        { userId: 'catalyst_bits', score: 980, metrics: { flyers: 80, content: 12, scans: 320, signups: 62, coupons: 150 } },
        { userId: 'catalyst_iitb', score: 850, metrics: { flyers: 75, content: 10, scans: 280, signups: 55, coupons: 120 } },
        { userId: 'catalyst_bits_p', score: 720, metrics: { flyers: 60, content: 8, scans: 210, signups: 45, coupons: 90 } },
        { userId: 'catalyst_iit_m', score: 640, metrics: { flyers: 55, content: 7, scans: 190, signups: 38, coupons: 85 } },
      ];
    }
    
    return data;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase.from('notifications').select('*').or(`recipientId.eq.${userId},recipientId.eq.all`).order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await supabase.from('notifications').update({ isRead: true }).eq('recipientId', userId);
  }

  async deleteNotification(id: string): Promise<void> {
    await supabase.from('notifications').delete().eq('id', id);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const dbUpdates: any = {};
    if (updates.displayName) dbUpdates.display_name = updates.displayName;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.phoneNumber) dbUpdates.phone_number = updates.phoneNumber;
    if (updates.shareContactInfo !== undefined) dbUpdates.share_contact_info = updates.shareContactInfo;
    if (updates.rewardsOnelink) dbUpdates.rewards_onelink = updates.rewardsOnelink;
    if (updates.streaksOnelink) dbUpdates.streaks_onelink = updates.streaksOnelink;
    if (updates.taskTargets) dbUpdates.task_targets = updates.taskTargets;

    const { data, error } = await supabase.from('users').update(dbUpdates).eq('id', userId).select().single();
    if (error) throw error;
    
    const mapped = this.mapUser(data);
    if (this.currentUser?.id === userId) {
      this.currentUser = mapped;
      localStorage.setItem('cg_currentUser', JSON.stringify(mapped));
    }
    return mapped;
  }

  async updateUserAvatar(userId: string, avatarUrl: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').update({ avatar_url: avatarUrl }).eq('id', userId).select().single();
    if (error) throw error;
    return this.mapUser(data);
  }

  async getEvents(campusId?: string): Promise<CampusEvent[]> {
    let query = supabase.from('campus_events').select('*').order('startDate', { ascending: true });
    if (campusId) query = query.eq('campusId', campusId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async submitEvent(event: Omit<CampusEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CampusEvent> {
    const now = Date.now();
    const { data, error } = await supabase.from('campus_events').insert({ ...event, createdAt: now, updatedAt: now }).select().single();
    if (error) throw error;
    return data;
  }

  async updateEvent(id: string, updates: Partial<CampusEvent>): Promise<void> {
    const { error } = await supabase.from('campus_events').update({ ...updates, updatedAt: Date.now() }).eq('id', id);
    if (error) throw error;
  }

  async deleteEvent(id: string): Promise<void> {
    await supabase.from('campus_events').delete().eq('id', id);
  }
}

export const db = new MockDatabase();
