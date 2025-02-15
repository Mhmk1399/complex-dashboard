import { saveGitHubStoreId, getFileSha } from "./github";

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

        const configContent = JSON.stringify({
            storeId: storeId,
            createdAt: new Date().toISOString(),
            repoUrl: repoUrl
        }, null, 2);

        const storeIdSha = await getFileSha(storeIdFilePath, repoUrl);
        const configSha = await getFileSha(repoConfigFilePath, repoUrl);

        await saveGitHubStoreId(storeIdFilePath, storeId, repoUrl, true, storeIdSha);
        await saveGitHubStoreId(repoConfigFilePath, configContent, repoUrl, true, configSha);

        return {
            storeIdFilePath,
            repoConfigFilePath
        };
    } catch (error) {
        console.error("Error creating store ID files:", error);
        throw error;
    }
}
