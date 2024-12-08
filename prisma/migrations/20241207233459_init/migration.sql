-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis" WITH VERSION "3.1.4";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,
    "cityId" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "linkedin" TEXT,
    "twitter" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "image" TEXT,
    "website" TEXT,
    "description" TEXT,
    "contact" TEXT,
    "address" TEXT,
    "zip" TEXT,
    "location" geography,
    "cityId" TEXT,
    "state" TEXT,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobPost" (
    "id" TEXT NOT NULL,
    "published" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT,
    "description" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "minSalary" INTEGER,
    "maxSalary" INTEGER,
    "type" TEXT,
    "seniority" DOUBLE PRECISION,
    "remote" BOOLEAN,
    "location" geography,
    "organizationId" TEXT,
    "openSource" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "hybrid" BOOLEAN NOT NULL DEFAULT false,
    "consulting" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "jobPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobPostPackage" (
    "id" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gitUrl" TEXT,
    "website" TEXT,
    "description" TEXT,
    "logo" TEXT,

    CONSTRAINT "jobPostPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobPostPackageVersion" (
    "id" TEXT NOT NULL,
    "jobPostPackageId" TEXT NOT NULL,

    CONSTRAINT "jobPostPackageVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobPostPricingPackage" (
    "id" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stripeId" TEXT,

    CONSTRAINT "jobPostPricingPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobPostQuestion" (
    "id" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "answer" TEXT,

    CONSTRAINT "jobPostQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobPostTag" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "jobPostTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobPostToTag" (
    "jobPostId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobPostToTag_pkey" PRIMARY KEY ("jobPostId","tagId")
);

-- CreateTable
CREATE TABLE "postViews" (
    "id" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "postViews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "raw" TEXT NOT NULL,
    "population" INTEGER,
    "location" geography,

    CONSTRAINT "city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nativeName" TEXT NOT NULL,
    "continentCode" TEXT NOT NULL,
    "capital" TEXT NOT NULL,
    "a2" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countryPhoneCode" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "countryPhoneCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currency" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countryCurrency" (
    "countryId" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,

    CONSTRAINT "countryCurrency_pkey" PRIMARY KEY ("countryId","currencyCode")
);

-- CreateTable
CREATE TABLE "language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countryLanguage" (
    "countryId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,

    CONSTRAINT "countryLanguage_pkey" PRIMARY KEY ("countryId","languageCode")
);

-- CreateTable
CREATE TABLE "continent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "continent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_jobPostTojobPostPackage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_jobPostTojobPostPackage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "jobPostPricingPackage_jobPostId_idx" ON "jobPostPricingPackage"("jobPostId");

-- CreateIndex
CREATE INDEX "jobPostPricingPackage_packageId_idx" ON "jobPostPricingPackage"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "jobPostTag_tag_key" ON "jobPostTag"("tag");

-- CreateIndex
CREATE INDEX "jobPostToTag_jobPostId_idx" ON "jobPostToTag"("jobPostId");

-- CreateIndex
CREATE INDEX "jobPostToTag_tagId_idx" ON "jobPostToTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "city_name_countryId_key" ON "city"("name", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "country_a2_key" ON "country"("a2");

-- CreateIndex
CREATE UNIQUE INDEX "countryPhoneCode_code_countryId_key" ON "countryPhoneCode"("code", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "currency_code_key" ON "currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "language_code_key" ON "language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "continent_code_key" ON "continent"("code");

-- CreateIndex
CREATE INDEX "_jobPostTojobPostPackage_B_index" ON "_jobPostTojobPostPackage"("B");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPost" ADD CONSTRAINT "jobPost_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPostPackageVersion" ADD CONSTRAINT "jobPostPackageVersion_jobPostPackageId_fkey" FOREIGN KEY ("jobPostPackageId") REFERENCES "jobPostPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPostPricingPackage" ADD CONSTRAINT "jobPostPricingPackage_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "jobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPostPricingPackage" ADD CONSTRAINT "jobPostPricingPackage_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "pricing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPostQuestion" ADD CONSTRAINT "jobPostQuestion_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "jobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPostToTag" ADD CONSTRAINT "jobPostToTag_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "jobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPostToTag" ADD CONSTRAINT "jobPostToTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "jobPostTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city" ADD CONSTRAINT "city_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "country" ADD CONSTRAINT "country_continentCode_fkey" FOREIGN KEY ("continentCode") REFERENCES "continent"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "countryPhoneCode" ADD CONSTRAINT "countryPhoneCode_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "countryCurrency" ADD CONSTRAINT "countryCurrency_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "countryCurrency" ADD CONSTRAINT "countryCurrency_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "countryLanguage" ADD CONSTRAINT "countryLanguage_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "countryLanguage" ADD CONSTRAINT "countryLanguage_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_jobPostTojobPostPackage" ADD CONSTRAINT "_jobPostTojobPostPackage_A_fkey" FOREIGN KEY ("A") REFERENCES "jobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_jobPostTojobPostPackage" ADD CONSTRAINT "_jobPostTojobPostPackage_B_fkey" FOREIGN KEY ("B") REFERENCES "jobPostPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
