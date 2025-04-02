-- CreateTable
CREATE TABLE "Tournament" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "TournamentPlayers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "NbVictory" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "playerNumber" INTEGER NOT NULL,
    CONSTRAINT "TournamentPlayers_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
