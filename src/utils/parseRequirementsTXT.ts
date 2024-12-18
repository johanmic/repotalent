export interface PackageVersions {
  [key: string]: string
}

export const parseRequirementsTxt = (file: string): PackageVersions => {
  // Split by lines and filter out empty lines
  const lines = file.split("\n").filter((line) => line.trim())

  const requirements: PackageVersions = {}

  for (const line of lines) {
    // Skip comments
    if (line.trim().startsWith("#")) continue

    // Remove inline comments
    const lineWithoutComments = line.split("#")[0].trim()

    // Skip pip options that start with -
    if (lineWithoutComments.startsWith("-")) continue

    // Handle package specifications
    if (lineWithoutComments) {
      // Handle different requirement formats
      if (lineWithoutComments.includes("==")) {
        const [package_name, version] = lineWithoutComments.split("==")
        requirements[package_name.trim()] = version.trim()
      } else if (lineWithoutComments.includes(">=")) {
        const [package_name, version] = lineWithoutComments.split(">=")
        requirements[package_name.trim()] = `>=${version.trim()}`
      } else if (lineWithoutComments.includes("<=")) {
        const [package_name, version] = lineWithoutComments.split("<=")
        requirements[package_name.trim()] = `<=${version.trim()}`
      } else if (lineWithoutComments.includes("@")) {
        // Handle URL-based requirements
        const [package_name] = lineWithoutComments.split("@")
        requirements[package_name.trim()] = "*"
      } else {
        // Handle bare package names without version
        requirements[lineWithoutComments.trim()] = "*"
      }
    }
  }

  return requirements
}

export default parseRequirementsTxt
