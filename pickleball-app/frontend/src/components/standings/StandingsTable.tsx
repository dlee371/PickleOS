import type { StandingRow } from "../../api/types";

export function StandingsTable({ rows }: { rows: StandingRow[] }) {
  if (rows.length === 0) {
    return <p className="text-slate-500">No standings yet — matches need to be completed first.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-200">
            <th className="py-2 pr-4">#</th>
            <th className="py-2 pr-4">Player</th>
            <th className="py-2 pr-4 text-center">Played</th>
            <th className="py-2 pr-4 text-center">W</th>
            <th className="py-2 pr-4 text-center">L</th>
            <th className="py-2 pr-4 text-center">Diff</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.userId} className="border-b border-slate-100">
              <td className="py-2 pr-4 text-slate-400">{i + 1}</td>
              <td className="py-2 pr-4 font-medium">{row.fullName}</td>
              <td className="py-2 pr-4 text-center">{row.played}</td>
              <td className="py-2 pr-4 text-center text-emerald-600">{row.wins}</td>
              <td className="py-2 pr-4 text-center text-red-500">{row.losses}</td>
              <td className="py-2 pr-4 text-center">
                {row.pointsDiff > 0 ? `+${row.pointsDiff}` : row.pointsDiff}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
