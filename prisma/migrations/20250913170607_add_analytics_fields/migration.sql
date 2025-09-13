-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_document_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "document_id" TEXT NOT NULL,
    "readability_score" REAL,
    "sentiment_score" REAL,
    "complexity_score" REAL,
    "improvement_score" REAL,
    "keyword_density" JSONB,
    "grammar_issues" INTEGER NOT NULL DEFAULT 0,
    "style_improvements" INTEGER NOT NULL DEFAULT 0,
    "words_processed" INTEGER NOT NULL DEFAULT 0,
    "time_saved" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "document_analytics_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_document_analytics" ("complexity_score", "document_id", "grammar_issues", "id", "improvement_score", "keyword_density", "readability_score", "sentiment_score", "style_improvements") SELECT "complexity_score", "document_id", "grammar_issues", "id", "improvement_score", "keyword_density", "readability_score", "sentiment_score", "style_improvements" FROM "document_analytics";
DROP TABLE "document_analytics";
ALTER TABLE "new_document_analytics" RENAME TO "document_analytics";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
