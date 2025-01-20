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

interface PyProjectDependency {
  name?: string
  version?: string
  [key: string]: any
}

interface PyProject {
  project?: {
    dependencies?: string[]
    optional_dependencies?: { [key: string]: string[] }
    requires?: string[]
  }
  tool?: {
    poetry?: {
      dependencies?: PyProjectPoetryDependencies
    }
  }
}

export const parsePyprojectToml = (file: string): PackageVersions => {
  const requirements: PackageVersions = {}

  try {
    const parsed = parse(file) as PyProject

    // Handle project.dependencies
    const projectDeps = parsed.project?.dependencies || []
    for (const dep of projectDeps) {
      if (typeof dep === "string") {
        const match = dep.match(/^([^<>=!~]+)\s*([<>=!~]{1,2}.*)?$/)
        if (match) {
          const [, packageName, version = "*"] = match
          requirements[packageName.trim()] = version.trim()
        }
      }
    }

    // Handle project.optional_dependencies
    const optionalDeps = parsed.project?.optional_dependencies || {}
    for (const [, deps] of Object.entries(optionalDeps)) {
      if (Array.isArray(deps)) {
        for (const dep of deps) {
          const match = dep.match(
            /^([^<>=!~]+)(?:\s*([<>=!~][^;]+))?(?:\s*;.*)?$/
          )
          if (match) {
            const [, packageName, version = "*"] = match
            requirements[packageName.trim()] = version.trim()
          }
        }
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
