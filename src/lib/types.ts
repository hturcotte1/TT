import type {
  TASK_STATUSES,
  CONTACT_STATUSES,
  EVENT_STATUSES,
} from "@/lib/constants";

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type ContactStatus = (typeof CONTACT_STATUSES)[number];
export type EventStatus = (typeof EVENT_STATUSES)[number];

export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
}

export interface Channel {
  id: string;
  name: string;
  project_id: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string | null;
  title: string;
  status: TaskStatus;
  owner_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutreachContact {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  status: ContactStatus;
  next_touch_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Touch {
  id: string;
  contact_id: string;
  user_id: string;
  note: string;
  occurred_at: string;
}

export interface Repo {
  id: string;
  name: string;
  url: string | null;
  notes: string | null;
}

export interface LlmEvent {
  id: string;
  occurred_at: string;
  source: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  latency_ms: number | null;
  status: EventStatus;
  input_ref: string | null;
  output_ref: string | null;
}

export interface Activity {
  id: string;
  user_id: string | null;
  verb: string;
  object_type: string;
  object_id: string | null;
  object_label: string;
  created_at: string;
}

export interface Goal {
  id: string;
  title: string;
  quarter: string;
  status: string;
}

/* Composite shapes returned by the data layer. */

export interface ChannelListItem {
  id: string;
  name: string;
  project_id: string | null;
  latestMessage: {
    body: string;
    created_at: string;
    authorName: string;
  } | null;
  unreadCount: number;
}

export interface ActivityItem extends Activity {
  userName: string | null;
}

export interface MessageItem extends Message {
  authorName: string;
}

export interface ProjectListItem extends Project {
  openTaskCount: number;
  lastChangeAt: string;
}

export interface TaskItem extends Task {
  ownerName: string | null;
}

export interface ContactListItem extends OutreachContact {
  lastTouchAt: string | null;
}

export interface TouchItem extends Touch {
  userName: string | null;
}

/** LlmEvent plus its server-computed day bucket ("yyyy-MM-dd"), so client
 *  filters agree with the server-aggregated daily chart in any timezone. */
export interface SpendEvent extends LlmEvent {
  day: string;
}

export interface SpendSummary {
  costToday: number;
  cost7d: number;
  costTotal: number;
}

export interface DailyCost {
  /** yyyy-MM-dd in server time */
  date: string;
  cost: number;
}
