import { createAppAuth } from "@octokit/auth-app"
import { Octokit } from "@octokit/rest"

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
  githubInstallationId: string
}) => {
  const installationAuth = await auth({
    type: "installation",
    installationId: githubInstallationId,
  })

  const octokit = new Octokit({
    auth: installationAuth.token,
  })

  const { data: repoData } = await octokit.rest.repos.get({
    owner,
    repo,
  })

  return repoData
}

export const getRepoContributors = async ({
  owner,
  repo,
  githubInstallationId,
}: {
  owner: string
  repo: string
  githubInstallationId: string
}) => {
  const installationAuth = await auth({
    type: "installation",
    installationId: githubInstallationId,
  })

  const octokit = new Octokit({
    auth: installationAuth.token,
  })

  const { data: contributors } = await octokit.rest.repos.listContributors({
    owner,
    repo,
  })
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
