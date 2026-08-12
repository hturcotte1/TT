import {
  CheckSquare,
  Cpu,
  FolderGit2,
  FolderKanban,
  Hash,
  MessageSquare,
  Send,
  Target,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  project: FolderKanban,
  channel: Hash,
  message: MessageSquare,
  task: CheckSquare,
  contact: UserRound,
  touch: Send,
  repo: FolderGit2,
  llm_event: Cpu,
  goal: Target,
};

export function ObjectIcon({
  objectType,
  className,
}: {
  objectType: string;
  className?: string;
}) {
  const Icon = ICONS[objectType] ?? Hash;
  return <Icon className={cn("size-4 text-muted-foreground", className)} />;
}
