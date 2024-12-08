interface GenerateCodeOptions {
  length?: number
  letters?: boolean
  lowercase?: boolean
}

export function generateCode({
  length = 6,
  letters = false,
}: GenerateCodeOptions = {}): string {
  const numbers = "0123456789"
  const upperLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

  const characters = [numbers, ...(letters ? [upperLetters] : [])].join("")

  const generateRandomChar = () =>
    characters[Math.floor(Math.random() * characters.length)]

  return Array.from({ length }, generateRandomChar).join("")
}
