export function diacritics(input: string): string {
  // Implementation to remove diacritics
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export const raw = (name: string) =>
  diacritics(name)
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
