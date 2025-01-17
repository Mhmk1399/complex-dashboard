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
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    // Extract template repository information
    const [, templateOwner, templateRepo] = emptyDirectoryRepoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/) || [];

    // Create new repository from template
    const { data: newRepo } = await octokit.rest.repos.createUsingTemplate({
      template_owner: templateOwner,
      template_repo: templateRepo,
      name: targetDirectory,
      private: true,
      include_all_branches: true
    });

    // Add store configuration
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: newRepo.owner.login,
      repo: targetDirectory,
      path: 'storeId.json',
      message: 'Add store configuration',
      content: Buffer.from(JSON.stringify({ storeId }, null, 2)).toString('base64')
    });

    logs.push("[SUCCESS] Repository cloned and configured");
    return { success: true, logs, repoUrl: newRepo.html_url };
  } catch (error) {
    logs.push(`[ERROR] ${(error as Error).message}`);
    return { success: false, logs, error: (error as Error).message };
  }
}
