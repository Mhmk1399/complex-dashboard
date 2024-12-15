import fs from "fs/promises";
import path from "path";

interface CreateWebsiteParams {
  emptyDirectory: string;
  targetDirectory: string;
}

export async function createWebsite({
  emptyDirectory,
  targetDirectory,
}: CreateWebsiteParams) {
  const logs: string[] = [];
  try {
    logs.push("[START] Website generation process initiated");

    try {
      await fs.access(emptyDirectory);
    } catch {
      logs.push("[ERROR] Empty directory template not found");
      throw new Error(`Template directory not found: ${emptyDirectory}`);
    }

    // Create the target project directory
  
    await fs.mkdir(targetDirectory, { recursive: true });
    logs.push(`[SUCCESS] Created project directory: ${targetDirectory}`);

    // Copy files from the template directory
    logs.push("[PROCESS] Copying template files...");
    await fs.cp(emptyDirectory, targetDirectory, {
      recursive: true,
      filter: (src) => {
        // Skip unwanted paths
        const skipPaths = [
          "node_modules",
          ".git",
          ".next",
          ".env",
          ".env.local",
        ];
        return !skipPaths.some((skip) => src.includes(skip));
      },
    });
    logs.push("[SUCCESS] Template files copied");

    return {
      success: true,
      logs,
      targetDirectory,
    };
  } catch (error) {
    logs.push(`[ERROR] Generation failed: ${(error as Error).message}`);
    return {
      success: false,
      logs,
      error: (error as Error).message,
    };
  }
}
