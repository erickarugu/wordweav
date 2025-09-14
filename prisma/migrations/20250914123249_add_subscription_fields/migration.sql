-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "subscription_id" TEXT,
    "subscription_status" TEXT,
    "plan_type" TEXT,
    "subscription_start_date" DATETIME,
    "subscription_end_date" DATETIME,
    "trial_start_date" DATETIME,
    "trial_end_date" DATETIME,
    "is_on_trial" BOOLEAN NOT NULL DEFAULT false,
    "customer_id" TEXT
);
INSERT INTO "new_users" ("created_at", "email", "email_verified", "id", "image", "name", "password", "updated_at") SELECT "created_at", "email", "email_verified", "id", "image", "name", "password", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
