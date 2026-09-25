-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerName" TEXT NOT NULL,
    "gameSlug" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Score_gameSlug_score_idx" ON "Score"("gameSlug", "score");

-- CreateIndex
CREATE INDEX "Score_playerName_idx" ON "Score"("playerName");
