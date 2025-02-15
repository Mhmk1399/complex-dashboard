import fetch from "node-fetch";

interface DeployWebsiteParams {
    githubRepoUrl: string;
    reponame: string;
}

interface DeploymentResult {
    success: boolean;
    logs: string[];
    deploymentUrl: string;
    projectId: string;  // Add projectId to the return type
}

const VERCEL_API_BASE = "https://api.vercel.com";

async function deployToVercel({ githubRepoUrl, reponame }: DeployWebsiteParams): Promise<DeploymentResult> {
    const logs: string[] = [];

    if (!process.env.VERCEL_TOKEN) {
        throw new Error("Vercel token is missing");
    }

    logs.push("[START] Initiating Vercel deployment process");

    try {
        // Fetch repository details from GitHub API to get the repository ID
        const githubRepoResponse = await fetch(`https://api.github.com/repos/${githubRepoUrl.replace('https://github.com/', '')}`, {
            headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!githubRepoResponse.ok) {
            throw new Error(`[ERROR] Failed to fetch GitHub repository details`);
        }

        const githubRepoData = await githubRepoResponse.json();
        const repoId = githubRepoData.id;

        // Create a new Vercel project
        logs.push(`[INFO] Creating a new Vercel project for ${reponame}`);

        const projectResponse = await fetch(`${VERCEL_API_BASE}/v9/projects`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: reponame,
                gitRepository: {
                    type: "github",
                    repo: githubRepoUrl.replace('https://github.com/', ''), // Use owner/repo format
                },
                framework: "nextjs",
            }),
        });

        if (!projectResponse.ok) {
            throw new Error(`[ERROR] Failed to create Vercel project: ${await projectResponse.text()}`);
        }

        const projectData = await projectResponse.json();
        logs.push(`[SUCCESS] Vercel project created: ${projectData.id}`);

        // Trigger the first deployment
        logs.push(`[INFO] Triggering deployment for ${reponame}`);

        const deploymentResponse = await fetch(`${VERCEL_API_BASE}/v13/deployments`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: reponame,
                project: projectData.id,
                gitSource: {
                    type: "github",
                    repoUrl: githubRepoUrl,
                    ref: "main", // Specify the branch name, typically 'main' or 'master'
                    owner: "Mhmk1399",
                    repo: githubRepoUrl,
                    repoId: repoId // Add the repository ID
                },
            }),
        });

        if (!deploymentResponse.ok) {
            throw new Error(`[ERROR] Deployment failed: ${await deploymentResponse.text()}`);
        }

        const deploymentData = await deploymentResponse.json();
        logs.push(`[INFO] Deployment started with ID: ${deploymentData.id}`);

        // Poll the deployment status until it's ready
        const deploymentId = deploymentData.id;
        let deploymentReady = false;
        let deploymentUrl = "";

        while (!deploymentReady) {
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

            const statusResponse = await fetch(`${VERCEL_API_BASE}/v13/deployments/${deploymentId}`, {
                headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
            });

            if (!statusResponse.ok) {
                throw new Error(`[ERROR] Could not fetch deployment status`);
            }

            const statusData = await statusResponse.json();

            if (statusData.readyState === "READY") {
                deploymentReady = true;
                deploymentUrl = statusData.url;
            } else {
                logs.push("[INFO] Deployment is still in progress...");
            }
        }

        logs.push(`[SUCCESS] Deployment completed: https://${deploymentUrl}`);

        return {
            success: true,
            logs,
            deploymentUrl: `https://${deploymentUrl}`,
            projectId: projectData.id  // Return the project ID
        };
    } catch (error: any) {
        logs.push(`[ERROR] ${error.message}`);
        console.error("Full error:", error);
        throw error;
    }
}

export default deployToVercel;
