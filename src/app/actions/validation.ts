"use server"

export const validateData = async (
  data: string,
  type: "package.json" | "requirements.txt"
) => {
  if (type === "package.json") {
    try {
      const jsonData = JSON.parse(data)

      // Validate essential package.json fields
      if (!jsonData.name || typeof jsonData.name !== "string") {
        throw new Error("Invalid package.json: missing or invalid 'name' field")
      }

      if (!jsonData.version || typeof jsonData.version !== "string") {
        throw new Error(
          "Invalid package.json: missing or invalid 'version' field"
        )
      }

      // Check if dependencies/devDependencies are objects if they exist
      if (jsonData.dependencies && typeof jsonData.dependencies !== "object") {
        throw new Error(
          "Invalid package.json: 'dependencies' must be an object"
        )
      }

      if (
        jsonData.devDependencies &&
        typeof jsonData.devDependencies !== "object"
      ) {
        throw new Error(
          "Invalid package.json: 'devDependencies' must be an object"
        )
      }

      return jsonData
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Invalid package.json: ${error.message}`)
      }
      throw new Error("Invalid package.json format")
    }
  }
}
