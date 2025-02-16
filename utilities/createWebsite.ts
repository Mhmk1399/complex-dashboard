import { Octokit } from "octokit";

interface CreateWebsiteParams {
  emptyDirectoryRepoUrl: string;
  title: string;
  storeId: string;
}

export async function createWebsite({
  emptyDirectoryRepoUrl,
  title,
  storeId,
}: CreateWebsiteParams) {
  const logs: string[] = [];
  
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GitHub token is not configured");
  }

  const octokit = new Octokit({ 
    auth: process.env.GITHUB_TOKEN
  });

  logs.push("[START] Website generation process initiated");

  try {
    // Extract template repository information
    const [, templateOwner, templateRepo] = emptyDirectoryRepoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/) || [];
    
    logs.push(`[INFO] Creating repository from template: ${templateOwner}/${templateRepo}`);

    const { data: newRepo } = await octokit.rest.repos.createUsingTemplate({
      template_owner: templateOwner,
      template_repo: templateRepo,
      owner: templateOwner,
      name: storeId,
      private: false,
      include_all_branches: true
    });

    logs.push("[INFO] Repository created successfully");

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: templateOwner,
      repo: storeId,
      path: 'store-config.json',
      message: 'Initialize store configuration',
      content: Buffer.from(JSON.stringify({ "storeId": storeId }, null, 2)).toString('base64'),
      branch: 'main' // Explicitly specify the branch
    });
    

    logs.push("[SUCCESS] Store configuration added");

    return {
      success: true,
      logs,
      repoUrl: newRepo.html_url,
      repoName: newRepo.name
    };
  } catch (error: any) {
    logs.push(`[ERROR] ${error.message}`);
    console.error("Full error:", error);
    throw error;
  }
}
