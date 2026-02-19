
import { createClient } from '@supabase/supabase-js';
import { User, Submission, Campus, MetricRollup, Notification, Task, CampusEvent } from '../types';
import { CAMPUSES, TASKS } from '../constants';

const SUPABASE_URL = 'https://vecxlslkdyqtuxhrvcuz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlY3hsc2xrZHlxdHV4aHJ2Y3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMDY2OTAsImV4cCI6MjA4NTY4MjY5MH0.ldSCs5ebGeki_3Ik_X7JRaVlb4sj0GH_u76izRMNKdA'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DEFAULT_PROFILES: Record<string, any> = {
  'admin': { p: 'swiggy_admin', n: 'Super Admin', c: 'c1', e: 'admin@campus.swiggy.com' },
  'catalyst_iitbbs_k7m9': { 
    p: 'Sg@7mK!pL2qR', 
    n: 'IITBBS Catalyst', 
    c: 'c1', 
    e: 'catalyst.iitbbs@campus.com',
    d: 'https://lookerstudio.google.com/embed/reporting/9ef96694-3531-4dbf-88a2-fece2cd65638/page/b6wkF',
    r: 'https://swiggy.onelink.me/888564224/mp03tj84',
    s: 'https://swiggy.onelink.me/888564224/x9he9ol6'
  },
  'catalyst_jnu_r3t7': { 
    p: 'Rq@3hM!sF8jD', 
    n: 'JNU Catalyst', 
    c: 'c2', 
    e: 'catalyst.jnu@campus.com',
    d: 'https://lookerstudio.google.com/embed/reporting/2b63d10c-ea17-4a54-866a-78713e9f884c/page/b6wkF',
    r: 'https://swiggy.onelink.me/888564224/pryikg17',
    s: 'https://swiggy.onelink.me/888564224/g63vk9ti'
  },
  'catalyst_iitbh_s9d3': { 
    p: 'Mw#5gT!qK9xP', 
    n: 'IITBH Catalyst', 
    c: 'c3', 
    e: 'catalyst.iitbh@campus.com',
    d: 'https://lookerstudio.google.com/embed/reporting/d36af50c-a8e4-4d3a-93fb-c19135b70d7d/page/b6wkF',
    r: 'https://swiggy.onelink.me/888564224/mn6doql6',
    s: 'https://swiggy.onelink.me/888564224/o16mj9r7'
  },
  'catalyst_iitj_x2m5': { 
    p: 'Fd#4bM!wQ7tG', 
    n: 'IITJ Catalyst', 
    c: 'c4', 
    e: 'catalyst.iitj@campus.com',
    d: 'https://lookerstudio.google.com/embed/reporting/c8c59335-cb18-40dc-897d-56cbd7bc1852/page/b6wkF',
    r: 'https://swiggy.onelink.me/888564224/fb64lh1j',
    s: 'https://swiggy.onelink.me/888564224/86e1ih0k'
  },
  'catalyst_imtg_w5t8': { 
    p: 'Nk%3xZ!rF8bC', 
    n: 'IMTG Catalyst', 
    c: 'c5', 
    e: 'catalyst.imtg@campus.com',
    d: 'https://lookerstudio.google.com/embed/reporting/caed7c6b-78d9-4d9b-92c7-bf75059cec89/page/b6wkF',
    r: 'https://swiggy.onelink.me/888564224/0xgtoe85',
    s: 'https://swiggy.onelink.me/888564224/yj69bbf6'
  },
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
    if (typeof val === 'string' && /^\d+$/.test(val)) return Number(val);
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
      dashboardUrl: dbUser.dashboard_url || dbUser.dashboardUrl,
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
      // Reconstruct payload from flattened columns
      payload: db.payload || {
        recipientName: db.recipient_name,
        recipientPhone: db.recipient_phone,
        recipientEmail: db.recipient_email,
        count: db.count,
        url: db.url
      },
      proofUrl: db.proof_url || db.proofUrl,
      location: db.location,
      createdAt: this.fromDbTime(db.created_at || db.createdAt),
      reviewerNote: db.reviewer_note || db.reviewerNote
    };
  }

  private mapToDbSubmission(sub: any): any {
    const dbPayload: any = {
      user_id: sub.userId,
      campus_id: sub.campusId,
      task_id: sub.taskId,
      status: sub.status,
      created_at: typeof sub.createdAt === 'number' ? sub.createdAt : new Date(sub.createdAt).getTime()
    };

    // Flatten the payload into the specific columns shown in your Supabase screenshots
    if (sub.payload) {
      if (sub.payload.recipientName) dbPayload.recipient_name = sub.payload.recipientName;
      if (sub.payload.recipientPhone) dbPayload.recipient_phone = sub.payload.recipientPhone;
      if (sub.payload.recipientEmail) dbPayload.recipient_email = sub.payload.recipientEmail;
      
      // These columns might also exist for other tasks
      if (sub.payload.count) dbPayload.count = Number(sub.payload.count);
      if (sub.payload.url) dbPayload.url = sub.payload.url;
    }

    if (sub.location) dbPayload.location = sub.location;
    if (sub.reviewerNote) dbPayload.reviewer_note = sub.reviewerNote;
    
    return dbPayload;
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
        dashboard_url: profile.d,
        rewards_onelink: profile.r,
        streaks_onelink: profile.s,
        created_at: Date.now(), 
        last_login_at: Date.now(),
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
    const { data: dbSubmissions, error: sErr } = await supabase.from('submissions').select('*').eq('status', 'approved');
    if (sErr) return [];

    const submissions = (dbSubmissions || []).map(s => this.mapSubmission(s));

    const rollups: Record<string, MetricRollup> = {};
    users?.forEach(u => {
      if (u.id === 'admin') return;
      rollups[u.id] = { userId: u.id, score: 0, metrics: { flyers: 0, content: 0, scans: 0, signups: 0, coupons: 0 } };
    });

    const tasks = await this.getTasks();
    submissions.forEach(s => {
      if (!rollups[s.userId]) return;
      const task = tasks.find(t => t.id === s.taskId);
      if (task) {
        rollups[s.userId].score += task.points;
        if (task.type === 'offline_activation') rollups[s.userId].metrics.flyers += Number(s.payload?.count || 1);
        if (task.type === 'social_media') rollups[s.userId].metrics.content += 1;
        if (task.type === 'referral') rollups[s.userId].metrics.signups += 1;
        if (task.type === 'student_rewards') rollups[s.userId].metrics.coupons += 1;
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
    dbPayload.created_at = Date.now();
    
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
