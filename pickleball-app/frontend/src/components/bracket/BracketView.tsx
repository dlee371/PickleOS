import type { BracketSlot } from "../../api/types";

export function BracketView({ slots }: { slots: BracketSlot[] }) {
  if (slots.length === 0) {
    return <p className="text-slate-500">No bracket generated yet.</p>;
  }

  const rounds = Array.from(new Set(slots.map((s) => s.round))).sort((a, b) => a - b);

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {rounds.map((round) => (
        <div key={round} className="min-w-[220px] flex flex-col gap-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {round === rounds[rounds.length - 1] ? "Final" : `Round ${round}`}
          </h3>
          {slots
            .filter((s) => s.round === round)
            .sort((a, b) => a.position - b.position)
            .map((slot) => (
              <div key={slot.id} className="border border-slate-200 rounded-lg p-3 bg-white text-sm">
                <PlayerRow
                  name={slot.match?.player1?.fullName}
                  score={slot.match?.score?.player1Score}
                  winner={isWinner(slot, "player1")}
                />
                <div className="h-px bg-slate-100 my-1" />
                <PlayerRow
                  name={slot.match?.player2?.fullName}
                  score={slot.match?.score?.player2Score}
                  winner={isWinner(slot, "player2")}
                />
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

function isWinner(slot: BracketSlot, side: "player1" | "player2"): boolean {
  const score = slot.match?.score;
  if (!score || slot.match?.status !== "completed") return false;
  return side === "player1" ? score.player1Score > score.player2Score : score.player2Score > score.player1Score;
}

function PlayerRow({ name, score, winner }: { name?: string; score?: number; winner: boolean }) {
  return (
    <div className={`flex items-center justify-between ${winner ? "font-semibold text-emerald-700" : "text-slate-600"}`}>
      <span>{name ?? "TBD"}</span>
      {score !== undefined && <span className="font-mono">{score}</span>}
    </div>
  );
}
