import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { getProject, getUsers } from "@/lib/data";
import { NewTaskDialog } from "../new-task-dialog";
import { parseStatusFilter, StatusFilterChips } from "../status-filter-chips";
import { TaskRow } from "../task-row";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  await requireUser();
  const [{ id }, { status }] = await Promise.all([params, searchParams]);
  const activeStatus = parseStatusFilter(status);

  const data = await getProject(id);
  if (!data) notFound();
  const { project, tasks, channel } = data;
  const users = getUsers();

  const visibleTasks = tasks.filter(
    (t) => activeStatus === null || t.status === activeStatus
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={project.name}
        description={project.description ?? undefined}
      >
        {channel ? (
          <Link
            href={`/channels/${channel.id}`}
            className="text-sm font-medium text-foreground hover:underline"
          >
            #{channel.name}
          </Link>
        ) : null}
        <NewTaskDialog
          users={users}
          fixedProjectId={project.id}
          triggerLabel="Add task"
          triggerVariant="default"
        />
      </PageHeader>

      <StatusFilterChips
        basePath={`/projects/${project.id}`}
        active={activeStatus}
      />

      <section className="rounded-lg border border-border bg-card">
        {visibleTasks.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No tasks
            {activeStatus ? ` with status ${activeStatus.replace(/_/g, " ")}` : " yet"}
            .
          </p>
        ) : (
          <div className="divide-y divide-border">
            {visibleTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
