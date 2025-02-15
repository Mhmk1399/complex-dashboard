import { saveGitHubStoreId } from "./github";

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

        // Create store ID file with force flag
        await saveGitHubStoreId(
            storeIdFilePath, 
            storeId, 
            repoUrl, 
            true // Add force flag to create new file
        );

        // Create config file with force flag
        const configContent = JSON.stringify({
            storeId: storeId,
            createdAt: new Date().toISOString(),
            repoUrl: repoUrl
        }, null, 2);
        
        await saveGitHubStoreId(
            repoConfigFilePath, 
            configContent, 
            repoUrl,
            true // Add force flag to create new file
        );

        return {
            storeIdFilePath,
            repoConfigFilePath
        };
    } catch (error) {
        console.error("Error creating store ID files:", error);
        throw error;
    }
}
