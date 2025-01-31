export type AcceptedFileName =
  | "package.json"
  | "requirements.txt"
  | "Makefile"
  | "Podfile.lock"
  | "pyproject.toml"
  | "pubspec.yaml"

export const acceptedFileNames: AcceptedFileName[] = [
  "package.json",
  "requirements.txt",
  "Makefile",
  "Podfile.lock",
  "pyproject.toml",
  "pubspec.yaml",
] as const

export const acceptedFileNamesSet = new Set<AcceptedFileName>(acceptedFileNames)

export const isAcceptedFileName = (
  filename: string
): filename is AcceptedFileName =>
  acceptedFileNamesSet.has(filename as AcceptedFileName)

export const removePathFromFilename = (filename: string) => {
  return filename.split("/").pop()
}

export const getAcceptedFileNames = () => acceptedFileNames
