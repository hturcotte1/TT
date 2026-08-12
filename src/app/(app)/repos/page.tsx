import { FolderGit2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getRepos } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { AddRepoDialog } from "./add-repo-dialog";
import { EditRepoDialog } from "./edit-repo-dialog";

export const dynamic = "force-dynamic";

/** Display form of a repo URL: protocol stripped. */
function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

export default async function ReposPage() {
  await requireUser();
  const repos = await getRepos();

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Repos" description="Repositories the team works in.">
        <AddRepoDialog />
      </PageHeader>
      <div className="rounded-lg border border-border bg-card">
        {repos.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">
            No repos yet. Add the first one.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {repos.map((repo) => (
              <li key={repo.id} className="flex items-center gap-3 px-4 py-3">
                <FolderGit2 className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span className="text-sm font-medium">{repo.name}</span>
                    {repo.url ? (
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        {stripProtocol(repo.url)}
                      </a>
                    ) : null}
                  </div>
                  {repo.notes ? (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {repo.notes}
                    </p>
                  ) : null}
                </div>
                <EditRepoDialog repo={repo} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
