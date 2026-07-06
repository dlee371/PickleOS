import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as leaguesApi from "../../api/leagues";
import * as matchesApi from "../../api/matches";
import * as standingsBracketApi from "../../api/standingsAndBracket";
import { useAuth } from "../../hooks/useAuth";
import { AppLayout } from "../../components/layout/AppLayout";
import { Button } from "../../components/ui/Button";
import { Card, Badge } from "../../components/ui/primitives";
import { MatchCard } from "../../components/matches/MatchCard";
import { StandingsTable } from "../../components/standings/StandingsTable";
import { BracketView } from "../../components/bracket/BracketView";
import { MembersList } from "../../components/members/MembersList";

type Tab = "schedule" | "standings" | "bracket" | "members";

export default function LeagueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const leagueId = id!;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("schedule");

  const { data: league } = useQuery({ queryKey: ["league", leagueId], queryFn: () => leaguesApi.getLeague(leagueId) });
  const { data: members } = useQuery({ queryKey: ["members", leagueId], queryFn: () => leaguesApi.listMembers(leagueId) });
  const { data: matches } = useQuery({ queryKey: ["matches", leagueId], queryFn: () => matchesApi.listMatches(leagueId) });
  const { data: standings } = useQuery({
    queryKey: ["standings", leagueId],
    queryFn: () => standingsBracketApi.getStandings(leagueId),
    enabled: tab === "standings",
  });
  const { data: bracket } = useQuery({
    queryKey: ["bracket", leagueId],
    queryFn: () => standingsBracketApi.getBracket(leagueId),
    enabled: tab === "bracket",
  });

  const isAdmin = members?.some((m) => m.userId === user?.id && m.role === "admin" && m.status === "active");

  function invalidateLeagueData() {
    queryClient.invalidateQueries({ queryKey: ["matches", leagueId] });
    queryClient.invalidateQueries({ queryKey: ["standings", leagueId] });
    queryClient.invalidateQueries({ queryKey: ["bracket", leagueId] });
    queryClient.invalidateQueries({ queryKey: ["members", leagueId] });
  }

  async function handleGenerateSchedule() {
    await matchesApi.generateSchedule(leagueId);
    invalidateLeagueData();
  }

  async function handleGenerateBracket() {
    await standingsBracketApi.generateBracket(leagueId);
    invalidateLeagueData();
  }

  if (!league) {
    return (
      <AppLayout>
        <p className="text-slate-500">Loading league…</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold">{league.name}</h1>
          {league.description && <p className="text-slate-500 text-sm mt-1">{league.description}</p>}
        </div>
        <Badge tone="neutral">Join code: {league.joinCode}</Badge>
      </div>

      <div className="flex gap-1 border-b border-slate-200 mt-6 mb-6">
        {(["schedule", "standings", "bracket", "members"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              tab === t ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "schedule" && (
        <div>
          {isAdmin && (
            <div className="mb-4 flex justify-end">
              <Button variant="secondary" onClick={handleGenerateSchedule}>
                Generate round-robin schedule
              </Button>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            {matches?.map((match) => (
              <MatchCard key={match.id} match={match} onUpdated={invalidateLeagueData} />
            ))}
            {matches?.length === 0 && (
              <Card className="sm:col-span-2 text-center py-8 text-slate-500">
                No matches yet. {isAdmin && "Generate a schedule to get started."}
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === "standings" && (
        <Card>
          <StandingsTable rows={standings ?? []} />
        </Card>
      )}

      {tab === "bracket" && (
        <div>
          {isAdmin && (
            <div className="mb-4 flex justify-end">
              <Button variant="secondary" onClick={handleGenerateBracket}>
                Generate bracket from standings
              </Button>
            </div>
          )}
          <Card>
            <BracketView slots={bracket ?? []} />
          </Card>
        </div>
      )}

      {tab === "members" && (
        <Card>
          <MembersList leagueId={leagueId} members={members ?? []} isAdmin={!!isAdmin} onUpdated={invalidateLeagueData} />
        </Card>
      )}
    </AppLayout>
  );
}
