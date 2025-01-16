import simpleGit from "simple-git";
import { Octokit } from "octokit"; // For GitHub API
import axios from "axios";

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

    // Step 1: Clone the empty GitHub repository
    const git = simpleGit();
    const localRepoPath = `/tmp/${targetDirectory}`;
    await git.clone(emptyDirectoryRepoUrl, localRepoPath);
    logs.push("[SUCCESS] Cloned the empty directory repository");

    // Step 2: Add user-specific data
    const fs = require("fs/promises");
    await fs.writeFile(
      `${localRepoPath}/storeId.json`,
      JSON.stringify({ storeId }, null, 2)
    );
    logs.push("[SUCCESS] Added user-specific files");

    // Step 3: Create a new GitHub repository for the user
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
      name: targetDirectory,
      private: true,
    });
    const userRepoUrl = repo.clone_url;

    // Step 4: Push the cloned repository to the new GitHub repository
    await git.cwd(localRepoPath).addRemote("user-origin", userRepoUrl);
    await git.cwd(localRepoPath).push("user-origin", "main");
    logs.push("[SUCCESS] Pushed to user's new GitHub repository");

    
    return {
      success: true,
      logs,
      
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
