import { AppIcons } from "@/components/appIcon"
export const mapJS = async ({
  packages,
}: {
  packages: string[]
}): Promise<string[]> => {
  const appKeys = Object.keys(AppIcons)
  /* 
    1. flatMap split all packages by _ 
    2. remove duplicates
    3. check which are in appKeys
    return array

    */

  const names = packages.flatMap((pkg) => {
    const names = pkg.split(/-|\//).map((name) => name.replace("@", ""))
    return names
  })

  const unique = [...new Set(names)]

  const icons = unique
    .map((key) => {
      if (appKeys.includes(key)) {
        return key
      }
    })
    .filter(Boolean)

  return icons as string[]
}
