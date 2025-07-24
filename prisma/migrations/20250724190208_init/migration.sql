-- CreateTable
CREATE TABLE "license_limit" (
    "orgdid" TEXT NOT NULL,
    "usage" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "threshold" INTEGER NOT NULL,
    "reset_datetime" TIMESTAMP(3) NOT NULL,
    "orgadmin" TEXT NOT NULL,
    "lastupdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "license_limit_pkey" PRIMARY KEY ("orgdid")
);

-- CreateTable
CREATE TABLE "license_log" (
    "id" SERIAL NOT NULL,
    "orgdid" TEXT NOT NULL,
    "liveliness_count" INTEGER NOT NULL,
    "match_count" INTEGER NOT NULL,
    "search_count" INTEGER NOT NULL,
    "transaction_datetime" TIMESTAMP(3) NOT NULL,
    "counted" BOOLEAN NOT NULL DEFAULT false,
    "lastupdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "license_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "license_log_orgdid_idx" ON "license_log"("orgdid");

-- CreateIndex
CREATE INDEX "license_log_transaction_datetime_idx" ON "license_log"("transaction_datetime");

-- AddForeignKey
ALTER TABLE "license_log" ADD CONSTRAINT "license_log_orgdid_fkey" FOREIGN KEY ("orgdid") REFERENCES "license_limit"("orgdid") ON DELETE RESTRICT ON UPDATE CASCADE;
