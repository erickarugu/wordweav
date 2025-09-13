/*
  Warnings:

  - A unique constraint covering the columns `[document_id]` on the table `document_analytics` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "document_analytics_document_id_key" ON "document_analytics"("document_id");
