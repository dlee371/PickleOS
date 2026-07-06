import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as leaguesApi from "../../api/leagues";
import { AppLayout } from "../../components/layout/AppLayout";
import { Button } from "../../components/ui/Button";
import { Card, Input, Label, ErrorText, Badge } from "../../components/ui/primitives";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { data: leagues, isLoading } = useQuery({ queryKey: ["leagues"], queryFn: leaguesApi.listMyLeagues });

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  function refreshLeagues() {
    queryClient.invalidateQueries({ queryKey: ["leagues"] });
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Your leagues</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowJoin(true)}>
            Join a league
          </Button>
          <Button onClick={() => setShowCreate(true)}>Create league</Button>
        </div>
      </div>

      {isLoading && <p className="text-slate-500">Loading…</p>}

      {!isLoading && leagues && leagues.length === 0 && (
        <Card className="text-center py-10">
          <p className="text-slate-500 mb-4">You're not in any leagues yet.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="secondary" onClick={() => setShowJoin(true)}>
              Join a league
            </Button>
            <Button onClick={() => setShowCreate(true)}>Create your first league</Button>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {leagues?.map((league) => (
          <Link key={league.id} to={`/leagues/${league.id}`}>
            <Card className="hover:border-emerald-400 transition-colors h-full">
              <div className="flex items-start justify-between">
                <h2 className="font-semibold">{league.name}</h2>
                <Badge tone="neutral">{league.format === "round_robin" ? "Round robin" : "Single elim"}</Badge>
              </div>
              {league.description && <p className="text-sm text-slate-500 mt-1">{league.description}</p>}
              <p className="text-xs text-slate-400 mt-3">Join code: {league.joinCode}</p>
            </Card>
          </Link>
        ))}
      </div>

      {showCreate && (
        <CreateLeagueModal onClose={() => setShowCreate(false)} onCreated={refreshLeagues} />
      )}
      {showJoin && <JoinLeagueModal onClose={() => setShowJoin(false)} onJoined={refreshLeagues} />}
    </AppLayout>
  );
}

function CreateLeagueModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState<"round_robin" | "single_elim">("round_robin");
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await leaguesApi.createLeague({ name, description, format, requiresApproval });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create league");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell onClose={onClose} title="Create a league">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>League name</Label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tuesday Night League" />
        </div>
        <div>
          <Label>Description (optional)</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <Label>Format</Label>
          <select
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
            value={format}
            onChange={(e) => setFormat(e.target.value as "round_robin" | "single_elim")}
          >
            <option value="round_robin">Round robin</option>
            <option value="single_elim">Single-elimination tournament</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={requiresApproval} onChange={(e) => setRequiresApproval(e.target.checked)} />
          Require admin approval for new members
        </label>
        {error && <ErrorText>{error}</ErrorText>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create league"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

function JoinLeagueModal({ onClose, onJoined }: { onClose: () => void; onJoined: () => void }) {
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await leaguesApi.joinLeague(joinCode);
      onJoined();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join league");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell onClose={onClose} title="Join a league">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Join code</Label>
          <Input required value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="e.g. aB3xY9zQ" />
        </div>
        {error && <ErrorText>{error}</ErrorText>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Joining…" : "Join league"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

function ModalShell({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
        <Card>
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
          {children}
        </Card>
      </div>
    </div>
  );
}
