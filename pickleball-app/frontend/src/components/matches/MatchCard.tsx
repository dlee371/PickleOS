import { useState } from "react";
import type { Match } from "../../api/types";
import { useAuth } from "../../hooks/useAuth";
import * as scoresApi from "../../api/scores";
import { Button } from "../ui/Button";
import { Input, Badge } from "../ui/primitives";

const STATUS_TONE: Record<Match["status"], "neutral" | "warning" | "success"> = {
  scheduled: "neutral",
  awaiting_confirmation: "warning",
  completed: "success",
  cancelled: "neutral",
};

const STATUS_LABEL: Record<Match["status"], string> = {
  scheduled: "Scheduled",
  awaiting_confirmation: "Awaiting confirmation",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function MatchCard({ match, onUpdated }: { match: Match; onUpdated: () => void }) {
  const { user } = useAuth();
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [p1Score, setP1Score] = useState("");
  const [p2Score, setP2Score] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isParticipant = user && (user.id === match.player1Id || user.id === match.player2Id);
  const canSubmitScore = isParticipant && match.status === "scheduled";
  const canConfirmScore =
    isParticipant && match.status === "awaiting_confirmation" && match.score?.submittedBy !== user?.id;

  async function handleSubmitScore() {
    setError(null);
    setSubmitting(true);
    try {
      await scoresApi.submitScore(match.id, Number(p1Score), Number(p2Score));
      setShowScoreForm(false);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit score");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirm() {
    if (!match.score) return;
    setSubmitting(true);
    try {
      await scoresApi.confirmScore(match.score.id);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm score");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">{match.round ? `Round ${match.round}` : "Match"}</span>
        <Badge tone={STATUS_TONE[match.status]}>{STATUS_LABEL[match.status]}</Badge>
      </div>

      <div className="flex items-center justify-between text-sm font-medium">
        <span>{match.player1?.fullName ?? "TBD"}</span>
        {match.score ? (
          <span className="font-mono text-slate-700">
            {match.score.player1Score} – {match.score.player2Score}
          </span>
        ) : (
          <span className="text-slate-300">vs</span>
        )}
        <span>{match.player2?.fullName ?? "TBD"}</span>
      </div>

      {match.scheduledAt && (
        <p className="text-xs text-slate-400 mt-2">
          {new Date(match.scheduledAt).toLocaleString()} {match.courtLabel && `· Court ${match.courtLabel}`}
        </p>
      )}

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      {canSubmitScore && !showScoreForm && (
        <Button variant="secondary" className="mt-3 w-full" onClick={() => setShowScoreForm(true)}>
          Submit score
        </Button>
      )}

      {showScoreForm && (
        <div className="mt-3 flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder={match.player1?.fullName ?? "P1"}
            value={p1Score}
            onChange={(e) => setP1Score(e.target.value)}
          />
          <Input
            type="number"
            min={0}
            placeholder={match.player2?.fullName ?? "P2"}
            value={p2Score}
            onChange={(e) => setP2Score(e.target.value)}
          />
          <Button disabled={submitting} onClick={handleSubmitScore}>
            Save
          </Button>
        </div>
      )}

      {canConfirmScore && (
        <Button className="mt-3 w-full" disabled={submitting} onClick={handleConfirm}>
          Confirm score
        </Button>
      )}
    </div>
  );
}
