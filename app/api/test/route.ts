import deployToVercel from "@/utilities/vercelDeployment";
import { NextResponse } from "next/server";

export async function GET(response: NextResponse) {
    const result = await deployToVercel({
        repoName: "amani",
        githubRepoUrl: "https://github.com/Mhmk1399/mhmk",
        userId: "mhmk", // If applicable
      });
      
  return NextResponse.json({result});
}