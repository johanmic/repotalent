export interface PackageJson {
  name?: string
  version?: string
  private?: boolean
  type?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export const shortenPackageJson = (packageJson: PackageJson): string => {
  const processDependencies = (deps: Record<string, string>) => {
    const seen = new Set<string>()
    const filtered: Record<string, string> = {}

    Object.entries(deps).forEach(([key, _]) => {
      const basePackage = key.split("/")[0]
      if (!seen.has(basePackage)) {
        filtered[key] = ""
        seen.add(basePackage)
      }
    })

    return Object.keys(filtered).length > 0 ? filtered : undefined
  }

  const processedJson = Object.fromEntries(
    Object.entries({
      name: packageJson.name,
      version: packageJson.version,
      private: packageJson.private,
      type: packageJson.type,
      dependencies: processDependencies(packageJson.dependencies || {}),
      devDependencies: processDependencies(packageJson.devDependencies || {}),
    }).filter(([_, value]) => {
      if (value === undefined) return false
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === "object") return Object.keys(value).length > 0
      return true
    })
  )

  return JSON.stringify(processedJson, null, 2)
}
