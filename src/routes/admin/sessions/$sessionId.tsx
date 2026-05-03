import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n";

// Stub: the full session detail with the waterfall lands in stage F5.
// Stage F4 only delivers the list view + navigation handshake; this route
// exists so the row click in the list resolves to a real URL.
export const Route = createFileRoute("/admin/sessions/$sessionId")({
  component: SessionDetailStub,
});

function SessionDetailStub() {
  const { sessionId } = Route.useParams();
  return (
    <div className="space-y-4" data-testid="admin-session-detail-stub">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("admin.sessionDetail.title")}</h1>
        <p className="text-muted-foreground">{t("admin.sessionDetail.subtitle")}</p>
      </header>
      <div className="rounded-md border bg-card p-6">
        <p className="text-sm">
          <span className="text-muted-foreground">{t("admin.sessionDetail.id")}: </span>
          <span className="font-mono">{sessionId}</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{t("admin.sessionDetail.stub")}</p>
        <div className="mt-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/sessions">{t("admin.sessionDetail.back")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
