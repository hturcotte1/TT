import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { RelativeTime } from "@/components/relative-time";
import { requireUser } from "@/lib/auth";
import { getProjectsWithMeta, getTasks, getUsers } from "@/lib/data";
import { NewProjectDialog } from "./new-project-dialog";
import { NewTaskDialog } from "./new-task-dialog";
import { parseStatusFilter, StatusFilterChips } from "./status-filter-chips";
import { TaskRow } from "./task-row";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireUser();
  const { status } = await searchParams;
  const activeStatus = parseStatusFilter(status);

  const [projects, tasks] = await Promise.all([
    getProjectsWithMeta(),
    getTasks(),
  ]);
  const users = getUsers();

  const nextSteps = tasks.filter(
    (t) =>
      t.project_id === null && (activeStatus === null || t.status === activeStatus)
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Projects" description="Workstreams and their tasks">
        <NewTaskDialog
          projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          users={users}
        />
        <NewProjectDialog />
      </PageHeader>

      <StatusFilterChips basePath="/projects" active={activeStatus} />

      <section className="rounded-lg border border-border bg-card">
        {projects.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No projects yet.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{project.name}</div>
                  {project.description ? (
                    <div className="truncate text-xs text-muted-foreground">
                      {project.description}
                    </div>
                  ) : null}
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {project.openTaskCount} open task
                  {project.openTaskCount === 1 ? "" : "s"}
                </span>
                <RelativeTime iso={project.lastChangeAt} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Next steps</h2>
        <div className="rounded-lg border border-border bg-card">
          {nextSteps.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No tasks outside a project
              {activeStatus ? ` with status ${activeStatus.replace(/_/g, " ")}` : ""}
              .
            </p>
          ) : (
            <div className="divide-y divide-border">
              {nextSteps.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
