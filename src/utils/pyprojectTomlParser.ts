import { parse } from "@iarna/toml"

export interface PackageVersions {
  [key: string]: string
}

interface PyProjectPoetryDependencies {
  [key: string]: string | { version?: string }
}

interface PyProjectPoetry {
  dependencies?: PyProjectPoetryDependencies
}

interface PyProjectTool {
  poetry?: PyProjectPoetry
}

interface PyProject {
  project?: {
    dependencies?: string[]
  }
  tool?: PyProjectTool
}

export const parsePyprojectToml = (file: string): PackageVersions => {
  const requirements: PackageVersions = {}

  try {
    const parsed = parse(file) as PyProject

    // Handle project.dependencies
    const projectDeps = parsed.project?.dependencies || []
    for (const dep of projectDeps) {
      // Handle different formats: package-name = ">=1.0.0"
      const match = dep.match(/^([^<>=!~]+)\s*([<>=!~]{1,2}.*)?$/)
      if (match) {
        const [, packageName, version = "*"] = match
        requirements[packageName.trim()] = version.trim()
      }
    }

    // Handle tool.poetry.dependencies
    const poetryDeps = parsed.tool?.poetry?.dependencies || {}
    for (const [packageName, version] of Object.entries(poetryDeps)) {
      if (packageName === "python") continue
      requirements[packageName] = typeof version === "string" ? version : "*"
    }
  } catch (error) {
    console.error("Error parsing pyproject.toml:", error)
    return {}
  }

  return requirements
}

export default parsePyprojectToml
