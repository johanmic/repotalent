import { parse } from "yaml"

export interface PackageVersions {
  [key: string]: string
}

export const parsePubspecYaml = (file: string): PackageVersions => {
  try {
    const parsed = parse(file)
    const dependencies: PackageVersions = {}

    // Skip if no valid YAML content was parsed
    if (!parsed || typeof parsed !== "object") {
      return {}
    }

    // Helper function to process dependencies
    const processDependencies = (deps: any) => {
      if (!deps || typeof deps !== "object") return

      Object.entries(deps).forEach(([pkg, version]) => {
        // Handle string version format
        if (typeof version === "string") {
          dependencies[pkg] = version
        }
        // Handle SDK dependencies
        else if (pkg === "flutter" || pkg === "flutter_test") {
          dependencies[pkg] = "sdk"
        }
        // Handle git/hosted/complex dependencies
        else if (typeof version === "object" && version !== null) {
          if ("version" in version && typeof version.version === "string") {
            dependencies[pkg] = version.version
          } else if ("ref" in version || "path" in version) {
            // For git refs or path dependencies, store a placeholder
            dependencies[pkg] = "custom"
          }
        }
      })
    }

    // Process all possible dependency sections
    processDependencies(parsed.dependencies)
    processDependencies(parsed.dev_dependencies)
    processDependencies(parsed.dependency_overrides)

    return dependencies
  } catch (error) {
    console.error("Error parsing pubspec.yaml:", error)
    return {}
  }
}
