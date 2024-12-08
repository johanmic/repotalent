export const deburr = (str: string): string =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

export const raw = (str: string): string =>
  deburr(str)
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]/g, "")
