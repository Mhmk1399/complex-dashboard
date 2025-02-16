import { saveGitHubFile } from "./github";

export async function createStoreId(storeId: string, repoUrl: string) {
    // Create store ID content
    const storeIdContent = storeId;
    
    // Create config content
    const configContent = JSON.stringify({
        storeId: storeId,
        createdAt: new Date().toISOString(),
        repoUrl: repoUrl,
        version: "1.0.0"
    }, null, 2);

    // Save both files using saveGitHubFile
    await saveGitHubFile('storeId.txt', storeIdContent, repoUrl);
    await saveGitHubFile('store-config.json', configContent, repoUrl);

    return {
        storeIdFilePath: 'storeId.txt',
        repoConfigFilePath: 'store-config.json'
    };
}
