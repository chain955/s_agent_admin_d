import { createFileRoute } from "@tanstack/react-router";
import { SessionsLog } from "@/features/sessions/SessionsLog";
import { sessionsSearchSchema } from "@/features/sessions/filters";

export const Route = createFileRoute("/admin/sessions/")({
  validateSearch: sessionsSearchSchema,
  component: SessionsLog,
});
