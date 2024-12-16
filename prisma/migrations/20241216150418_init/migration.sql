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
    "credits" INTEGER NOT NULL DEFAULT 0,
    "stripeCustomerId" TEXT,
    "bio" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "facebook" TEXT,
    "github" TEXT,
    "instagram" TEXT,

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
    "github" TEXT,
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
    "experience" TEXT,
    "seniority" DOUBLE PRECISION,
    "remote" BOOLEAN,
    "organizationId" TEXT,
    "openSource" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "hybrid" BOOLEAN NOT NULL DEFAULT false,
    "consulting" BOOLEAN NOT NULL DEFAULT false,
    "tone" TEXT,
    "additionalInfo" TEXT,
    "applicationUrl" TEXT,
    "equity" BOOLEAN NOT NULL DEFAULT false,
    "currencyId" TEXT,
    "slug" TEXT NOT NULL,
    "showAuthor" BOOLEAN NOT NULL DEFAULT true,
    "showOrganization" BOOLEAN NOT NULL DEFAULT true,
    "showSalary" BOOLEAN NOT NULL DEFAULT true,
    "showLocation" BOOLEAN NOT NULL DEFAULT true,
    "showTags" BOOLEAN NOT NULL DEFAULT true,
    "showPackages" BOOLEAN NOT NULL DEFAULT true,
    "showQuestions" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "jobPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobPostTokenUsage" (
    "id" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "jobPostTokenUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobPostRatings" (
    "id" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rating" INTEGER,

    CONSTRAINT "jobPostRatings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobPostToPackageVersion" (
    "jobPostId" TEXT NOT NULL,
    "packageVersionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "includeInPost" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "jobPostToPackageVersion_pkey" PRIMARY KEY ("jobPostId","packageVersionId")
);

-- CreateTable
CREATE TABLE "openSourcePackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gitUrl" TEXT,
    "website" TEXT,
    "description" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "openSourcePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "openSourcePackageVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "openSourcePackageVersion_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripePurchaseId" TEXT NOT NULL,
    "creditsBought" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promoCodeId" TEXT,
    "productId" TEXT,
    "idType" TEXT,

    CONSTRAINT "purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creditUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "creditsUsed" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creditUsage_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "stripeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stripeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "purchaseId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "recurring" TEXT NOT NULL DEFAULT 'month',

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "jobPost_slug_key" ON "jobPost"("slug");

-- CreateIndex
CREATE INDEX "jobPostToPackageVersion_jobPostId_idx" ON "jobPostToPackageVersion"("jobPostId");

-- CreateIndex
CREATE INDEX "jobPostToPackageVersion_packageVersionId_idx" ON "jobPostToPackageVersion"("packageVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "openSourcePackage_name_key" ON "openSourcePackage"("name");

-- CreateIndex
CREATE UNIQUE INDEX "openSourcePackageVersion_packageId_version_key" ON "openSourcePackageVersion"("packageId", "version");

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
CREATE UNIQUE INDEX "purchase_stripePurchaseId_key" ON "purchase"("stripePurchaseId");

-- CreateIndex
CREATE UNIQUE INDEX "promoCode_code_key" ON "promoCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "product_stripeId_key" ON "product"("stripeId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_userId_key" ON "subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_stripeId_key" ON "subscription"("stripeId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPost" ADD CONSTRAINT "jobPost_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPost" ADD CONSTRAINT "jobPost_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPostTokenUsage" ADD CONSTRAINT "jobPostTokenUsage_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "jobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPostTokenUsage" ADD CONSTRAINT "jobPostTokenUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPostRatings" ADD CONSTRAINT "jobPostRatings_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "jobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPostToPackageVersion" ADD CONSTRAINT "jobPostToPackageVersion_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "jobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPostToPackageVersion" ADD CONSTRAINT "jobPostToPackageVersion_packageVersionId_fkey" FOREIGN KEY ("packageVersionId") REFERENCES "openSourcePackageVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "openSourcePackageVersion" ADD CONSTRAINT "openSourcePackageVersion_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "openSourcePackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "promoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditUsage" ADD CONSTRAINT "creditUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditUsage" ADD CONSTRAINT "creditUsage_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "jobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promoCodeUsage" ADD CONSTRAINT "promoCodeUsage_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "promoCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promoCodeUsage" ADD CONSTRAINT "promoCodeUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
