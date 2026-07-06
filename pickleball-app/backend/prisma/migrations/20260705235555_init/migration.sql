-- CreateEnum
CREATE TYPE "LeagueFormat" AS ENUM ('round_robin', 'single_elim');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('admin', 'player');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('pending', 'active', 'removed');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('scheduled', 'awaiting_confirmation', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leagues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "format" "LeagueFormat" NOT NULL,
    "join_code" TEXT NOT NULL,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "start_date" DATE,
    "end_date" DATE,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leagues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "league_memberships" (
    "id" TEXT NOT NULL,
    "league_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'active',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "league_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "league_id" TEXT NOT NULL,
    "round" INTEGER,
    "player1_id" TEXT,
    "player2_id" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "court_label" TEXT,
    "status" "MatchStatus" NOT NULL DEFAULT 'scheduled',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "player1_score" INTEGER NOT NULL,
    "player2_score" INTEGER NOT NULL,
    "submitted_by" TEXT NOT NULL,
    "confirmed_by" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "admin_override" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bracket_slots" (
    "id" TEXT NOT NULL,
    "league_id" TEXT NOT NULL,
    "match_id" TEXT,
    "round" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "bracket_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "leagues_join_code_key" ON "leagues"("join_code");

-- CreateIndex
CREATE UNIQUE INDEX "league_memberships_league_id_user_id_key" ON "league_memberships"("league_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "scores_match_id_key" ON "scores"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "bracket_slots_match_id_key" ON "bracket_slots"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "bracket_slots_league_id_round_position_key" ON "bracket_slots"("league_id", "round", "position");

-- AddForeignKey
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_memberships" ADD CONSTRAINT "league_memberships_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_memberships" ADD CONSTRAINT "league_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_slots" ADD CONSTRAINT "bracket_slots_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_slots" ADD CONSTRAINT "bracket_slots_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
