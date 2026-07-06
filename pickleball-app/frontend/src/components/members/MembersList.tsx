import type { Member } from "../../api/types";
import { useAuth } from "../../hooks/useAuth";
import * as leaguesApi from "../../api/leagues";
import { Button } from "../ui/Button";
import { Badge } from "../ui/primitives";

export function MembersList({
  leagueId,
  members,
  isAdmin,
  onUpdated,
}: {
  leagueId: string;
  members: Member[];
  isAdmin: boolean;
  onUpdated: () => void;
}) {
  const { user } = useAuth();

  async function approve(userId: string) {
    await leaguesApi.updateMember(leagueId, userId, { status: "active" });
    onUpdated();
  }

  async function remove(userId: string) {
    await leaguesApi.updateMember(leagueId, userId, { status: "removed" });
    onUpdated();
  }

  return (
    <div className="divide-y divide-slate-100">
      {members.map((m) => (
        <div key={m.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-sm">
              {m.user.fullName} {m.userId === user?.id && <span className="text-slate-400">(you)</span>}
            </p>
            <p className="text-xs text-slate-400">{m.user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={m.role === "admin" ? "success" : "neutral"}>{m.role}</Badge>
            {m.status === "pending" && <Badge tone="warning">Pending</Badge>}
            {isAdmin && m.status === "pending" && (
              <Button variant="secondary" onClick={() => approve(m.userId)}>
                Approve
              </Button>
            )}
            {isAdmin && m.status === "active" && m.role !== "admin" && (
              <Button variant="ghost" onClick={() => remove(m.userId)}>
                Remove
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
