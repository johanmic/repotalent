# Getting Started

## Prerequisites

- Node.js 20+
- Supabase Account
- OpenAI Account
- Trigger.dev Account
- Vercel
- pnpm
- posthog account
- Stripe account

## Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in the values
3. Optionally edit prisma/seed.ts to decide what you want in as default
4. Run `pnpm install`
5. Run `pnpm dev`

## Github App setup

Persisting access to repos can not be done with the Supabase Github Oauth, But still need to be created and then added.
Useer must first sign in with github THEN enable the github app.
callback should be domain

1. follow the setup here
   https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app

2. Create a client secret and add the keys to your env. Update the cert to be a single text string, set an env variable.
   3.Set the setup URL to [domain]/home/github/setup

## Supabse

1. Create a new project
2. Create a new database
3. Add Env
4. Create Email OTP template for supabase
5. Enable Github Auth
6. Add github keys to env

## DB

follow the instructions here: https://supabase.com/partners/integrations/prisma
install postgis extension
possibly run seed script as we're loading 126K cities with countries in to the database
ensure postgis has been correctly installed

## Trigger.dev

Add DB Environment Variables
ensure prisma installs the correct binaries for Trigger to run.
`binaryTargets   = ["native", "debian-openssl-3.0.x"]`
run `pnpm dlx trigger.dev@latest install`
run `pnpm dlx trigger.dev@latest dev`

when deploying run `pnpm dlx trigger.dev@latest deploy`

## Vercel

Add all environment variables
change deploy command to `pnpm build && pnpm start`
