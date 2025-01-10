import { createAppAuth } from "@octokit/auth-app"
import { Octokit } from "@octokit/rest"
import prisma from "@/store/prisma"
import type { RestEndpointMethodTypes } from "@octokit/rest"
const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID!,
  privateKey: process.env.GITHUB_PRIVATE_KEY!,
})

export const getRepo = async ({
  owner,
  repo,
  githubInstallationId,
}: {
  owner: string
  repo: string
  githubInstallationId: number
}): Promise<RestEndpointMethodTypes["repos"]["get"]["response"] | null> => {
  const installationAuth = await auth({
    type: "installation",
    installationId: githubInstallationId,
  })

  const octokit = new Octokit({
    auth: installationAuth.token,
  })

  const response = await octokit.rest.repos.get({
    owner,
    repo,
  })

  return response
}

export const getRepoContributors = async ({
  owner,
  repo,
  githubInstallationId,
}: {
  owner: string
  repo: string
  githubInstallationId: number
}): Promise<
  RestEndpointMethodTypes["repos"]["listContributors"]["response"]
> => {
  const installationAuth = await auth({
    type: "installation",
    installationId: githubInstallationId,
  })

  const octokit = new Octokit({
    auth: installationAuth.token,
  })

  const response = await octokit.rest.repos.listContributors({
    owner,
    repo,
  })
  return response
}

export const getRepoContributor = async ({
  userId,
  githubInstallationId,
}: {
  userId: string
  githubInstallationId: string
}) => {
  const installationAuth = await auth({
    type: "installation",
    installationId: githubInstallationId,
  })

  const octokit = new Octokit({
    auth: installationAuth.token,
  })

  const { data: contributor } = await octokit.rest.users.getByUsername({
    username: userId,
  })

  return contributor
}

export const getGithubUser = async ({
  username,
  installationId,
}: {
  username: string
  installationId: number
}): Promise<RestEndpointMethodTypes["users"]["getByUsername"]["response"]> => {
  const installationAuth = await auth({
    type: "installation",
    installationId: installationId,
  })

  const octokit = new Octokit({
    auth: installationAuth.token,
  })

  const results = await octokit.rest.users.getByUsername({
    username,
  })

  return results
}

export const checkRateLimit = async ({
  installationId,
}: {
  installationId: number
}): Promise<{
  limit: number
  remaining: number
  reset: Date
}> => {
  const installationAuth = await auth({
    type: "installation",
    installationId: installationId,
  })

  const octokit = new Octokit({
    auth: installationAuth.token,
  })

  const response = await octokit.rest.rateLimit.get()
  const { limit, remaining, reset } = response.data.rate
  return { limit, remaining, reset: new Date(reset * 1000) }
}
