export type AcceptedFileName =
  | "package.json"
  | "requirements.txt"
  | "Makefile"
  | "Podfile.lock"
  | "pyproject.toml"

export const acceptedFileNames: AcceptedFileName[] = [
  "package.json",
  "requirements.txt",
  "Makefile",
  "Podfile.lock",
  "pyproject.toml",
] as const

export const acceptedFileNamesSet = new Set<AcceptedFileName>(acceptedFileNames)

export const isAcceptedFileName = (
  filename: string
): filename is AcceptedFileName =>
  acceptedFileNamesSet.has(filename as AcceptedFileName)

export const getAcceptedFileNames = () => acceptedFileNames
