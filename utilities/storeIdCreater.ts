import { saveGitHubFile } from "./github";

export async function createStoreId(
    storeId: string,
    repoUrl: string
): Promise<{ storeIdFilePath: string, repoConfigFilePath: string }> {
    if (!storeId || !repoUrl) {
        throw new Error("StoreId and repoUrl are required");
    }

    try {
        const storeIdFilePath = `storeId.txt`;
        const repoConfigFilePath = `store-config.json`;

        // Create new storeId.txt file directly
        await saveGitHubFile(storeIdFilePath, storeId, repoUrl);

        // Create new config file with store details
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
