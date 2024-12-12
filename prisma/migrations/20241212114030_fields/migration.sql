-- CreateTable
CREATE TABLE "promoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) DEFAULT (NOW() + '30 days'::interval),
    "oneTime" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "promoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promoCodeUsage" (
    "id" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "promoCodeUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promoCode_code_key" ON "promoCode"("code");

-- AddForeignKey
ALTER TABLE "promoCodeUsage" ADD CONSTRAINT "promoCodeUsage_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "promoCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promoCodeUsage" ADD CONSTRAINT "promoCodeUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
