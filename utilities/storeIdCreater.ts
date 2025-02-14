import { saveGitHubFile } from "./github";

export async function createStoreId(
    storeId: string,
    repoUrl: string
): Promise<{ storeIdFilePath: string, repoConfigFilePath: string }> {
    if (!storeId || !repoUrl) {
        throw new Error("StoreId and repoUrl are required");
    }

    try {
        // Create storeId.txt file
        const storeIdFilePath = `storeId.txt`;
        await saveGitHubFile(storeIdFilePath, storeId, repoUrl);

        // Create a config file with store details
        const repoConfigFilePath = `store-config.json`;
        const configContent = JSON.stringify({
            storeId: storeId,
            createdAt: new Date().toISOString(),
            repoUrl: repoUrl
        }, null, 2);
        await saveGitHubFile(repoConfigFilePath, configContent, repoUrl);

        return {
            storeIdFilePath,
            repoConfigFilePath
        };
    } catch (error) {
        console.error("Error creating store ID files:", error);
        throw error;
    }
}
