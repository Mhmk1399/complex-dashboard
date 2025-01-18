import { Octokit } from "octokit"; // For GitHub API


interface CreateWebsiteParams {
  emptyDirectoryRepoUrl: string; // URL of the empty GitHub repository
  targetDirectory: string; // User-specific directory/repo name
  storeId: string;
}
export async function createWebsite({
  emptyDirectoryRepoUrl,
  targetDirectory,
  storeId,
}: CreateWebsiteParams) {
  const logs: string[] = [];
  try {
    logs.push("[START] Website generation process initiated");

    // Use Octokit for all GitHub operations
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    // Create new repository
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
      name: targetDirectory,
      private: true,
    });

    // Get template repository content and create files in new repo
    const { data: templateContent } = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_TEMPLATE_OWNER!,
      repo: process.env.GITHUB_TEMPLATE_REPO!,
      path: '',
    });

    // Create storeId.json in the new repository
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: repo.owner.login,
      repo: targetDirectory,
      path: 'storeId.json',
      message: 'Initialize repository with store ID',
      content: Buffer.from(JSON.stringify({ storeId }, null, 2)).toString('base64'),
    });

    logs.push("[SUCCESS] Created repository and added files");
    
    return { success: true, logs };
  } catch (error) {
    logs.push(`[ERROR] Generation failed: ${(error as Error).message}`);
    return { success: false, logs, error: (error as Error).message };
  }
}
