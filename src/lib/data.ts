import { startOfDay, subDays, format, eachDayOfInterval } from "date-fns";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type {
  Activity,
  ActivityItem,
  Channel,
  ChannelListItem,
  ContactListItem,
  ContactStatus,
  DailyCost,
  LlmEvent,
  Message,
  MessageItem,
  OutreachContact,
  Project,
  ProjectListItem,
  Repo,
  SpendEvent,
  SpendSummary,
  Task,
  TaskItem,
  TaskStatus,
  Touch,
  TouchItem,
} from "@/lib/types";
import { FOUNDERS } from "@/lib/constants";

/* -------------------------------------------------- helpers */

function userName(userId: string | null | undefined): string | null {
  if (!userId) return null;
  return FOUNDERS.find((f) => f.id === userId)?.name ?? null;
}

interface ActivityInput {
  userId: string | null;
  verb: string;
  objectType: string;
  objectId: string | null;
  objectLabel: string;
}

async function logActivity(input: ActivityInput): Promise<void> {
  const { error } = await supabaseAdmin().from("activities").insert({
    user_id: input.userId,
    verb: input.verb,
    object_type: input.objectType,
    object_id: input.objectId,
    object_label: input.objectLabel,
  });
  if (error) throw new Error(`activities insert failed: ${error.message}`);
}

function must<T>(data: T | null, error: { message: string } | null, what: string): T {
  if (error) throw new Error(`${what}: ${error.message}`);
  if (data === null) throw new Error(`${what}: no data returned`);
  return data;
}

/* -------------------------------------------------- users */

export function getUsers() {
  return FOUNDERS.map((f) => ({ id: f.id, name: f.name, email: f.email }));
}

/* -------------------------------------------------- channels + messages */

export async function getChannelsWithMeta(
  userId: string
): Promise<ChannelListItem[]> {
  const db = supabaseAdmin();
  const [channelsRes, readsRes] = await Promise.all([
    db.from("channels").select("*").order("created_at", { ascending: true }),
    db.from("channel_reads").select("channel_id, last_read_at").eq("user_id", userId),
  ]);
  const channels = must(channelsRes.data, channelsRes.error, "channels select") as Channel[];
  const reads = must(readsRes.data, readsRes.error, "channel_reads select") as {
    channel_id: string;
    last_read_at: string;
  }[];

  const lastReadByChannel = new Map(reads.map((r) => [r.channel_id, r.last_read_at]));

  // Per-channel latest message + unread count. Two small queries per channel
  // stay correct at any history size (a global message window would not).
  return Promise.all(
    channels.map(async (channel) => {
      const lastRead = lastReadByChannel.get(channel.id);
      let unreadQuery = db
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("channel_id", channel.id);
      if (lastRead) unreadQuery = unreadQuery.gt("created_at", lastRead);
      const [latestRes, unreadRes] = await Promise.all([
        db
          .from("messages")
          .select("user_id, body, created_at")
          .eq("channel_id", channel.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        unreadQuery,
      ]);
      if (latestRes.error) {
        throw new Error(`latest message select: ${latestRes.error.message}`);
      }
      if (unreadRes.error) {
        throw new Error(`unread count select: ${unreadRes.error.message}`);
      }
      const latest = latestRes.data as Pick<
        Message,
        "user_id" | "body" | "created_at"
      > | null;
      return {
        id: channel.id,
        name: channel.name,
        project_id: channel.project_id,
        latestMessage: latest
          ? {
              body: latest.body,
              created_at: latest.created_at,
              authorName: userName(latest.user_id) ?? "Unknown",
            }
          : null,
        unreadCount: unreadRes.count ?? 0,
      };
    })
  );
}

export async function getChannel(channelId: string): Promise<Channel | null> {
  const { data, error } = await supabaseAdmin()
    .from("channels")
    .select("*")
    .eq("id", channelId)
    .maybeSingle();
  if (error) throw new Error(`channel select: ${error.message}`);
  return data as Channel | null;
}

export async function getMessages(channelId: string): Promise<MessageItem[]> {
  // Newest 500, then reversed to chronological order, so the window always
  // contains the latest messages once a channel outgrows the limit.
  const { data, error } = await supabaseAdmin()
    .from("messages")
    .select("*")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false })
    .limit(500);
  const rows = must(data, error, "messages select") as Message[];
  return rows
    .reverse()
    .map((m) => ({ ...m, authorName: userName(m.user_id) ?? "Unknown" }));
}

export async function sendMessage(input: {
  channelId: string;
  userId: string;
  body: string;
}): Promise<MessageItem> {
  const db = supabaseAdmin();
  const channel = await getChannel(input.channelId);
  if (!channel) throw new Error("channel not found");
  const { data, error } = await db
    .from("messages")
    .insert({ channel_id: input.channelId, user_id: input.userId, body: input.body })
    .select()
    .single();
  const message = must(data, error, "message insert") as Message;
  await logActivity({
    userId: input.userId,
    verb: "sent",
    objectType: "message",
    objectId: message.id,
    objectLabel: `#${channel.name}`,
  });
  // The author has seen the channel up to their own message.
  await markChannelRead(input.channelId, input.userId);
  return { ...message, authorName: userName(input.userId) ?? "Unknown" };
}

/**
 * Bookkeeping write; intentionally not logged to activities (a read-marker
 * every 3 seconds would flood the feed — see README).
 */
export async function markChannelRead(
  channelId: string,
  userId: string
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("channel_reads")
    .upsert(
      { channel_id: channelId, user_id: userId, last_read_at: new Date().toISOString() },
      { onConflict: "channel_id,user_id" }
    );
  if (error) throw new Error(`channel_reads upsert: ${error.message}`);
}

export async function createChannel(input: {
  name: string;
  userId: string;
  projectId?: string | null;
}): Promise<Channel> {
  const { data, error } = await supabaseAdmin()
    .from("channels")
    .insert({ name: input.name, project_id: input.projectId ?? null })
    .select()
    .single();
  const channel = must(data, error, "channel insert") as Channel;
  await logActivity({
    userId: input.userId,
    verb: "created",
    objectType: "channel",
    objectId: channel.id,
    objectLabel: `#${channel.name}`,
  });
  return channel;
}

/* -------------------------------------------------- activity feed */

export async function getActivities(limit = 50): Promise<ActivityItem[]> {
  const { data, error } = await supabaseAdmin()
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = must(data, error, "activities select") as Activity[];
  return rows.map((a) => ({ ...a, userName: userName(a.user_id) }));
}

/* -------------------------------------------------- projects + tasks */

export async function createProject(input: {
  name: string;
  description?: string | null;
  userId: string;
}): Promise<{ project: Project; channel: Channel }> {
  const { data, error } = await supabaseAdmin()
    .from("projects")
    .insert({ name: input.name, description: input.description ?? null })
    .select()
    .single();
  const project = must(data, error, "project insert") as Project;
  await logActivity({
    userId: input.userId,
    verb: "created",
    objectType: "project",
    objectId: project.id,
    objectLabel: project.name,
  });
  // Rule: a new project always gets a channel with the same name.
  const channel = await createChannel({
    name: project.name,
    userId: input.userId,
    projectId: project.id,
  });
  return { project, channel };
}

export async function getProjectsWithMeta(): Promise<ProjectListItem[]> {
  const db = supabaseAdmin();
  const [projectsRes, tasksRes] = await Promise.all([
    db.from("projects").select("*").order("created_at", { ascending: true }),
    db.from("tasks").select("*"),
  ]);
  const projects = must(projectsRes.data, projectsRes.error, "projects select") as Project[];
  const tasks = must(tasksRes.data, tasksRes.error, "tasks select") as Task[];

  return projects.map((project) => {
    const projectTasks = tasks.filter((t) => t.project_id === project.id);
    const openTaskCount = projectTasks.filter((t) => t.status !== "done").length;
    const timestamps = [
      project.created_at,
      ...projectTasks.map((t) => t.updated_at),
    ].sort();
    return {
      ...project,
      openTaskCount,
      lastChangeAt: timestamps[timestamps.length - 1],
    };
  });
}

export async function getProject(projectId: string): Promise<{
  project: Project;
  tasks: TaskItem[];
  channel: Channel | null;
} | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw new Error(`project select: ${error.message}`);
  if (!data) return null;
  const project = data as Project;
  const [tasksRes, channelRes] = await Promise.all([
    db
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true }),
    db
      .from("channels")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);
  const tasks = must(tasksRes.data, tasksRes.error, "tasks select") as Task[];
  if (channelRes.error) throw new Error(`channel select: ${channelRes.error.message}`);
  return {
    project,
    tasks: tasks.map((t) => ({ ...t, ownerName: userName(t.owner_id) })),
    channel: (channelRes.data as Channel | null) ?? null,
  };
}

export async function getTasks(): Promise<TaskItem[]> {
  const { data, error } = await supabaseAdmin()
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: true });
  const rows = must(data, error, "tasks select") as Task[];
  return rows.map((t) => ({ ...t, ownerName: userName(t.owner_id) }));
}

export async function createTask(input: {
  projectId: string | null;
  title: string;
  ownerId: string | null;
  dueDate: string | null;
  userId: string;
}): Promise<Task> {
  const { data, error } = await supabaseAdmin()
    .from("tasks")
    .insert({
      project_id: input.projectId,
      title: input.title,
      owner_id: input.ownerId,
      due_date: input.dueDate,
    })
    .select()
    .single();
  const task = must(data, error, "task insert") as Task;
  await logActivity({
    userId: input.userId,
    verb: "created",
    objectType: "task",
    objectId: task.id,
    objectLabel: task.title,
  });
  return task;
}

export async function updateTaskStatus(input: {
  taskId: string;
  status: TaskStatus;
  userId: string;
}): Promise<Task> {
  const { data, error } = await supabaseAdmin()
    .from("tasks")
    .update({ status: input.status, updated_at: new Date().toISOString() })
    .eq("id", input.taskId)
    .select()
    .single();
  const task = must(data, error, "task update") as Task;
  await logActivity({
    userId: input.userId,
    verb: "moved",
    objectType: "task",
    objectId: task.id,
    objectLabel: `${task.title} → ${task.status}`,
  });
  return task;
}

/* -------------------------------------------------- outreach */

export async function getContacts(): Promise<ContactListItem[]> {
  const db = supabaseAdmin();
  const [contactsRes, touchesRes] = await Promise.all([
    db
      .from("outreach_contacts")
      .select("*")
      .order("next_touch_date", { ascending: true, nullsFirst: false }),
    db.from("touches").select("contact_id, occurred_at").order("occurred_at", {
      ascending: false,
    }),
  ]);
  const contacts = must(contactsRes.data, contactsRes.error, "contacts select") as OutreachContact[];
  const touches = must(touchesRes.data, touchesRes.error, "touches select") as {
    contact_id: string;
    occurred_at: string;
  }[];
  const lastTouch = new Map<string, string>();
  for (const t of touches) {
    if (!lastTouch.has(t.contact_id)) lastTouch.set(t.contact_id, t.occurred_at);
  }
  return contacts.map((c) => ({ ...c, lastTouchAt: lastTouch.get(c.id) ?? null }));
}

export async function getContact(contactId: string): Promise<{
  contact: OutreachContact;
  touches: TouchItem[];
} | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("outreach_contacts")
    .select("*")
    .eq("id", contactId)
    .maybeSingle();
  if (error) throw new Error(`contact select: ${error.message}`);
  if (!data) return null;
  const { data: touchData, error: touchError } = await db
    .from("touches")
    .select("*")
    .eq("contact_id", contactId)
    .order("occurred_at", { ascending: false });
  const touches = must(touchData, touchError, "touches select") as Touch[];
  return {
    contact: data as OutreachContact,
    touches: touches.map((t) => ({ ...t, userName: userName(t.user_id) })),
  };
}

export async function createContact(input: {
  name: string;
  company: string | null;
  email: string | null;
  status: ContactStatus;
  nextTouchDate: string | null;
  notes: string | null;
  userId: string;
}): Promise<OutreachContact> {
  const { data, error } = await supabaseAdmin()
    .from("outreach_contacts")
    .insert({
      name: input.name,
      company: input.company,
      email: input.email,
      status: input.status,
      next_touch_date: input.nextTouchDate,
      notes: input.notes,
    })
    .select()
    .single();
  const contact = must(data, error, "contact insert") as OutreachContact;
  await logActivity({
    userId: input.userId,
    verb: "created",
    objectType: "contact",
    objectId: contact.id,
    objectLabel: contact.name,
  });
  return contact;
}

export async function updateContactStatus(input: {
  contactId: string;
  status: ContactStatus;
  userId: string;
}): Promise<OutreachContact> {
  const { data, error } = await supabaseAdmin()
    .from("outreach_contacts")
    .update({ status: input.status })
    .eq("id", input.contactId)
    .select()
    .single();
  const contact = must(data, error, "contact update") as OutreachContact;
  await logActivity({
    userId: input.userId,
    verb: "moved",
    objectType: "contact",
    objectId: contact.id,
    objectLabel: `${contact.name} → ${contact.status}`,
  });
  return contact;
}

export async function addTouch(input: {
  contactId: string;
  note: string;
  nextTouchDate: string | null;
  userId: string;
}): Promise<Touch> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("touches")
    .insert({ contact_id: input.contactId, user_id: input.userId, note: input.note })
    .select()
    .single();
  const touch = must(data, error, "touch insert") as Touch;
  const { data: contact } = await db
    .from("outreach_contacts")
    .select("name")
    .eq("id", input.contactId)
    .maybeSingle();
  if (input.nextTouchDate) {
    const { error: updateError } = await db
      .from("outreach_contacts")
      .update({ next_touch_date: input.nextTouchDate })
      .eq("id", input.contactId);
    if (updateError) throw new Error(`contact update: ${updateError.message}`);
  }
  await logActivity({
    userId: input.userId,
    verb: "logged",
    objectType: "touch",
    objectId: touch.id,
    objectLabel: (contact as { name: string } | null)?.name ?? "contact",
  });
  return touch;
}

/* -------------------------------------------------- repos */

export async function getRepos(): Promise<Repo[]> {
  const { data, error } = await supabaseAdmin()
    .from("repos")
    .select("*")
    .order("name", { ascending: true });
  return must(data, error, "repos select") as Repo[];
}

export async function createRepo(input: {
  name: string;
  url: string | null;
  notes: string | null;
  userId: string;
}): Promise<Repo> {
  const { data, error } = await supabaseAdmin()
    .from("repos")
    .insert({ name: input.name, url: input.url, notes: input.notes })
    .select()
    .single();
  const repo = must(data, error, "repo insert") as Repo;
  await logActivity({
    userId: input.userId,
    verb: "created",
    objectType: "repo",
    objectId: repo.id,
    objectLabel: repo.name,
  });
  return repo;
}

export async function updateRepo(input: {
  repoId: string;
  name: string;
  url: string | null;
  notes: string | null;
  userId: string;
}): Promise<Repo> {
  const { data, error } = await supabaseAdmin()
    .from("repos")
    .update({ name: input.name, url: input.url, notes: input.notes })
    .eq("id", input.repoId)
    .select()
    .single();
  const repo = must(data, error, "repo update") as Repo;
  await logActivity({
    userId: input.userId,
    verb: "updated",
    objectType: "repo",
    objectId: repo.id,
    objectLabel: repo.name,
  });
  return repo;
}

/* -------------------------------------------------- spend */

export async function getSpendData(): Promise<{
  summary: SpendSummary;
  daily: DailyCost[];
  events: SpendEvent[];
  sources: string[];
}> {
  const { data, error } = await supabaseAdmin()
    .from("llm_events")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(5000);
  const events = must(data, error, "llm_events select") as LlmEvent[];

  const now = new Date();
  const todayStart = startOfDay(now);
  const sevenDaysAgo = subDays(now, 7);
  const fourteenDaysAgo = startOfDay(subDays(now, 13));

  let costToday = 0;
  let cost7d = 0;
  let costTotal = 0;
  const byDay = new Map<string, number>();
  for (const e of events) {
    const occurred = new Date(e.occurred_at);
    const cost = Number(e.cost_usd) || 0;
    costTotal += cost;
    if (occurred >= todayStart) costToday += cost;
    if (occurred >= sevenDaysAgo) cost7d += cost;
    if (occurred >= fourteenDaysAgo) {
      const key = format(occurred, "yyyy-MM-dd");
      byDay.set(key, (byDay.get(key) ?? 0) + cost);
    }
  }

  const daily: DailyCost[] = eachDayOfInterval({
    start: fourteenDaysAgo,
    end: now,
  }).map((day) => {
    const key = format(day, "yyyy-MM-dd");
    return { date: key, cost: Math.round((byDay.get(key) ?? 0) * 10000) / 10000 };
  });

  const sources = [...new Set(events.map((e) => e.source))].sort();

  return {
    summary: { costToday, cost7d, costTotal },
    daily,
    events: events
      .slice(0, 200)
      .map((e) => ({ ...e, day: format(new Date(e.occurred_at), "yyyy-MM-dd") })),
    sources,
  };
}

export interface IngestEventInput {
  occurred_at?: string;
  source: string;
  model: string;
  tokens_in?: number;
  tokens_out?: number;
  cost_usd?: number;
  latency_ms?: number | null;
  status?: "ok" | "error";
  input_ref?: string | null;
  output_ref?: string | null;
}

export async function insertLlmEvent(input: IngestEventInput): Promise<LlmEvent> {
  const { data, error } = await supabaseAdmin()
    .from("llm_events")
    .insert({
      occurred_at: input.occurred_at ?? new Date().toISOString(),
      source: input.source,
      model: input.model,
      tokens_in: input.tokens_in ?? 0,
      tokens_out: input.tokens_out ?? 0,
      cost_usd: input.cost_usd ?? 0,
      latency_ms: input.latency_ms ?? null,
      status: input.status ?? "ok",
      input_ref: input.input_ref ?? null,
      output_ref: input.output_ref ?? null,
    })
    .select()
    .single();
  const event = must(data, error, "llm_event insert") as LlmEvent;
  await logActivity({
    userId: null,
    verb: "logged",
    objectType: "llm_event",
    objectId: event.id,
    objectLabel: `${event.source} · ${event.model}`,
  });
  return event;
}
