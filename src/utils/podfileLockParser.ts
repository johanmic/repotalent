interface PodVersions {
  [key: string]: string
}

export function parsePodfileLock(content: string): PodVersions {
  const pods: PodVersions = {}
  const lines = content.split("\n")

  // Find PODS: section
  const podsStartIndex = lines.findIndex((line) => line.trim() === "PODS:")

  if (podsStartIndex !== -1) {
    // Parse PODS section
    for (let i = podsStartIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim()

      // Stop when we hit an empty line or a new section
      if (line === "" || (line.endsWith(":") && !line.includes("("))) break

      // Match lines that start with - and might have nested dependencies
      const match = line.match(/^-\s*([^(:]+)\s*\(([\d.]+)\)/)
      if (match) {
        const [, name, version] = match
        pods[name.trim()] = version.trim()
      }
    }
  }
  console.log(pods)

  return summarizePodfileLock(pods)
}

export function summarizePodfileLock(pods: PodVersions): PodVersions {
  const consolidatedPods: PodVersions = {}

  Object.entries(pods).forEach(([name, version]) => {
    const baseName = name.split("/")[0]

    // Only store the base package if it hasn't been stored yet
    // or if we find a different version
    if (!consolidatedPods[baseName] || consolidatedPods[baseName] !== version) {
      consolidatedPods[baseName] = version
    }
  })

  return consolidatedPods
}
