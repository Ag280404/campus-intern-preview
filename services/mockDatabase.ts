
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

  private fromDbTime(val: any): number {
    if (!val) return Date.now();
    if (typeof val === 'number') return val;
    const parsed = new Date(val).getTime();
    return isNaN(parsed) ? Date.now() : parsed;
  }

  private mapUser(dbUser: any): User {
    if (!dbUser) return {} as User;
    return {
      id: dbUser.id,
      displayName: dbUser.display_name || dbUser.displayName,
      campusId: dbUser.campus_id || dbUser.campusId,
      email: dbUser.email,
      phoneNumber: dbUser.phone_number || dbUser.phoneNumber,
      createdAt: this.fromDbTime(dbUser.created_at || dbUser.createdAt),
      lastLoginAt: this.fromDbTime(dbUser.last_login_at || dbUser.lastLoginAt),
      qrCodeId: dbUser.qr_code_id || dbUser.qrCodeId,
      rewardsQrCode: dbUser.rewards_qr_code || dbUser.rewardsQrCode,
      streaksQrCode: dbUser.streaks_qr_code || dbUser.streaksQrCode,
      rewardsOnelink: dbUser.rewards_onelink || dbUser.rewardsOnelink,
      streaksOnelink: dbUser.streaks_onelink || dbUser.streaksOnelink,
      avatarUrl: dbUser.avatar_url || dbUser.avatarUrl,
      shareContactInfo: dbUser.share_contact_info !== undefined ? dbUser.share_contact_info : dbUser.shareContactInfo,
      taskTargets: dbUser.task_targets || dbUser.taskTargets
    };
  }

  private mapSubmission(db: any): Submission {
    if (!db) return {} as Submission;
    return {
      id: db.id,
      userId: db.user_id || db.userId,
      campusId: db.campus_id || db.campusId,
      taskId: db.task_id || db.taskId,
      status: db.status,
      payload: db.payload,
      proofUrl: db.proof_url || db.proofUrl,
      location: db.location,
      createdAt: this.fromDbTime(db.created_at || db.createdAt),
      reviewerNote: db.reviewer_note || db.reviewerNote
    };
  }

  private mapToDbSubmission(sub: any): any {
    return {
      user_id: sub.userId,
      campus_id: sub.campusId,
      task_id: sub.taskId,
      status: sub.status,
      payload: sub.payload,
      proof_url: sub.proofUrl,
      location: sub.location,
      created_at: new Date(sub.createdAt).toISOString()
    };
  }

  private mapDbEvent(dbEvent: any): CampusEvent {
    if (!dbEvent) return {} as CampusEvent;
    return {
      id: dbEvent.id,
      campusId: dbEvent.campus_id || dbEvent.campusId,
      createdBy: dbEvent.created_by || dbEvent.createdBy,
      createdByName: dbEvent.created_by_name || dbEvent.createdByName,
      eventType: dbEvent.event_type || dbEvent.eventType,
      eventName: dbEvent.event_name || dbEvent.eventName,
      startDate: dbEvent.start_date || dbEvent.startDate,
      endDate: dbEvent.end_date || dbEvent.endDate,
      notes: dbEvent.notes,
      createdAt: this.fromDbTime(dbEvent.created_at || dbEvent.createdAt),
      updatedAt: this.fromDbTime(dbEvent.updated_at || dbEvent.updatedAt)
    };
  }

  private mapToDbEvent(event: any): any {
    const dbPayload: any = {};
    if (event.campusId !== undefined) dbPayload.campus_id = event.campusId;
    if (event.createdBy !== undefined) dbPayload.created_by = event.createdBy;
    if (event.createdByName !== undefined) dbPayload.created_by_name = event.createdByName;
    if (event.eventType !== undefined) dbPayload.event_type = event.eventType;
    if (event.eventName !== undefined) dbPayload.event_name = event.eventName;
    if (event.startDate !== undefined) dbPayload.start_date = event.startDate;
    if (event.endDate !== undefined) dbPayload.end_date = event.endDate;
    if (event.notes !== undefined) dbPayload.notes = event.notes;
    dbPayload.updated_at = new Date().toISOString();
    return dbPayload;
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return (data || []).map((u: any) => this.mapUser(u));
  }

  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) {
      console.warn("Using local tasks constants.", error);
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
      if (!profile || profile.p !== password) throw new Error("Invalid credentials.");
      const newUser = {
        id, 
        password: profile.p, 
        display_name: profile.n, 
        campus_id: profile.c,
        email: profile.e, 
        created_at: new Date().toISOString(), 
        last_login_at: new Date().toISOString(),
        task_targets: { 't1': 50, 't2': 1, 't3': 5, 't4': 10, 't5': 10 }
      };
      const { data: seeded, error: iErr } = await supabase.from('users').insert(newUser).select();
      if (iErr) throw iErr;
      userToMap = seeded?.[0];
    } else {
      if (dbUser.password !== password) throw new Error("Invalid password.");
      await supabase.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', id);
    }

    const mapped = this.mapUser(userToMap);
    this.currentUser = mapped;
    localStorage.setItem('cg_currentUser', JSON.stringify(mapped));
    return mapped;
  }

  async submitTask(submission: Omit<Submission, 'id' | 'status' | 'createdAt'>): Promise<Submission> {
    const dbPayload = this.mapToDbSubmission({ ...submission, status: 'submitted', createdAt: Date.now() });
    const { data, error } = await supabase.from('submissions').insert(dbPayload).select();
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Submission failed to return data.");
    return this.mapSubmission(data[0]);
  }

  async getSubmissions(userId?: string): Promise<Submission[]> {
    let query = supabase.from('submissions').select('*');
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((s: any) => this.mapSubmission(s));
  }

  async getLeaderboard(): Promise<MetricRollup[]> {
    const { data: users, error: uErr } = await supabase.from('users').select('id, campus_id');
    if (uErr) return [];
    const { data: submissions, error: sErr } = await supabase.from('submissions').select('*').eq('status', 'approved');
    if (sErr) return [];

    const rollups: Record<string, MetricRollup> = {};
    users?.forEach(u => {
      if (u.id === 'admin') return;
      rollups[u.id] = { userId: u.id, score: 0, metrics: { flyers: 0, content: 0, scans: 0, signups: 0, coupons: 0 } };
    });

    const tasks = await this.getTasks();
    submissions?.forEach(s => {
      if (!rollups[s.user_id]) return;
      const task = tasks.find(t => t.id === s.task_id);
      if (task) {
        rollups[s.user_id].score += task.points;
        if (task.type === 'offline_activation') rollups[s.user_id].metrics.flyers += Number(s.payload.count || 1);
        if (task.type === 'social_media') rollups[s.user_id].metrics.content += 1;
        if (task.type === 'referral') rollups[s.user_id].metrics.signups += 1;
        if (task.type === 'student_rewards') rollups[s.user_id].metrics.coupons += 1;
      }
    });
    return Object.values(rollups).sort((a, b) => b.score - a.score);
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase.from('notifications').select('*').or(`recipient_id.eq.${userId},recipient_id.eq.all`).order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map((n: any) => ({
      id: n.id, recipientId: n.recipient_id, content: n.content, createdAt: this.fromDbTime(n.created_at), isRead: n.is_read
    }));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', userId);
  }

  async deleteNotification(id: string): Promise<void> {
    await supabase.from('notifications').delete().eq('id', id);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const dbUpdates: any = {};
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
    if (updates.shareContactInfo !== undefined) dbUpdates.share_contact_info = updates.shareContactInfo;
    if (updates.taskTargets !== undefined) dbUpdates.task_targets = updates.taskTargets;
    const { data, error } = await supabase.from('users').update(dbUpdates).eq('id', id).select();
    if (error) return null;
    return data?.[0] ? this.mapUser(data[0]) : null;
  }

  async updateUserAvatar(id: string, avatarUrl: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').update({ avatar_url: avatarUrl }).eq('id', id).select();
    if (error) return null;
    return data?.[0] ? this.mapUser(data[0]) : null;
  }

  async approveSubmission(id: string, note?: string): Promise<void> {
    await supabase.from('submissions').update({ status: 'approved', reviewer_note: note }).eq('id', id);
  }

  async rejectSubmission(id: string, note?: string): Promise<void> {
    await supabase.from('submissions').update({ status: 'rejected', reviewer_note: note }).eq('id', id);
  }

  async getEvents(campusId?: string): Promise<CampusEvent[]> {
    let query = supabase.from('events').select('*');
    if (campusId) query = query.eq('campus_id', campusId);
    const { data, error } = await query.order('start_date', { ascending: true });
    if (error) {
      console.error("Supabase error fetching events:", error);
      return [];
    }
    return (data || []).map((e: any) => this.mapDbEvent(e));
  }

  async submitEvent(event: Omit<CampusEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CampusEvent> {
    const dbPayload = this.mapToDbEvent(event);
    dbPayload.created_at = new Date().toISOString();
    
    const { data, error } = await supabase.from('events').insert(dbPayload).select();
    
    if (error) {
        console.error("Supabase Insert Error:", error);
        throw error;
    }

    if (!data || data.length === 0) {
        return {
            id: 'gen-' + Date.now(),
            ...event,
            createdAt: Date.now(),
            updatedAt: Date.now()
        } as CampusEvent;
    }
    return this.mapDbEvent(data[0]);
  }

  async updateEvent(id: string, event: Partial<CampusEvent>): Promise<CampusEvent> {
    const dbPayload = this.mapToDbEvent(event);
    const { data, error } = await supabase.from('events').update(dbPayload).eq('id', id).select();
    
    if (error) {
        console.error("Supabase Update Error:", error);
        throw error;
    }

    if (!data || data.length === 0) {
        return {
            id,
            ...event as any,
            createdAt: Date.now(),
            updatedAt: Date.now()
        } as CampusEvent;
    }
    return this.mapDbEvent(data[0]);
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
  }
}

export const db = new MockDatabase();
