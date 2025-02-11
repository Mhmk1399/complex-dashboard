import axios from "axios";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Add this to your .env file
const GITHUB_OWNER = "Mhmk1399";
const GITHUB_REPO = "storadge"; // Replace with your new repository name


/**
 * Fetches the raw content of a file from the GitHub repository.
 * @param filePath - Path of the file in the repository (e.g., "public/template/homesm.json").
 * @returns The raw content of the file as a string.
 */
export async function saveGitHubMedia(
  filePath: string,
  content: string,
  commitMessage: string = "Upload file"
): Promise<string> {
  const GITHUB_REPO = "storadge"; // Hardcoded repository name
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

  try {
    // Step 1: Check if file already exists
    let existingSha = null;
    try {
      const existingFileResponse = await axios.get(url, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        }
      });

      // If file exists, capture its current SHA
      existingSha = existingFileResponse.data.sha;
      console.log('Existing file found. Current SHA:', existingSha);
    } catch (error) {
      // File doesn't exist, which is fine - we'll create a new one
      console.log('File does not exist. Will create new file.');
    }

    // Step 2: Prepare payload for file upload/update
    const payload = {
      message: commitMessage, // Commit message for the GitHub action
      content: content, // Base64 encoded file content
      branch: 'main', // Specify the branch

      // Include SHA only if file already exists
      ...(existingSha && { sha: existingSha })
    };

    // Step 3: Upload or update the file
    const response = await axios.put(url, payload, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        'Content-Type': 'application/json'
      }
    });

    // Step 4: Return the download URL of the uploaded file
    return response.data.content.download_url;

  } catch (error: any) {
    // Comprehensive error logging
    console.error('Detailed GitHub Upload Error:', {
      errorType: error.name,
      status: error.response?.status,
      message: error.message,
      responseData: error.response?.data
    });

    // Throw a more informative error
    throw new Error(`GitHub Media Upload Failed: ${error.response?.data?.message || error.message}`);
  }
}

export async function fetchGitHubMedia(filePath: string): Promise<string> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    // Decode base64 content
    return Buffer.from(response.data.content, 'base64').toString('utf-8');
  } catch (error: any) {
    console.error("GitHub fetch error:", error.response?.data || error.message);
    throw new Error("Failed to fetch file from GitHub");
  }
}

export async function deleteGitHubMedia(filePath: string): Promise<void> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

  try {
    // First, get the file's SHA
    const fileDetails = await axios.get(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    // Delete the file
    await axios.delete(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      },
      data: {
        message: `Delete ${filePath}`,
        sha: fileDetails.data.sha
      }
    });
  } catch (error: any) {
    console.error("GitHub delete error:", error.response?.data || error.message);
    throw new Error("Failed to delete file from GitHub");
  }
}

function getRepoFromUrl(url: string | null): string {
  if (!url) return "userwebsite"; // default fallback

  try {
    const decodedUrl = decodeURIComponent(url);
    return decodedUrl.split("/").pop() || "userwebsite";
  } catch {
    return "userwebsite";
  }
}

export async function fetchGitHubFile(
  filePath: string,
  repoUrl?: string
): Promise<string> {
  const GITHUB_REPO = getRepoFromUrl(repoUrl || null);
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
  console.log("Fetching URL:", url);

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    // Extract Base64-encoded content and decode it
    const fileContent = response.data.content;
    const decodedContent = Buffer.from(fileContent, "base64").toString("utf-8");
    return decodedContent; // Return the decoded raw content of the file
  } catch (error: any) {
    console.error(
      "Error fetching file from GitHub:",
      error.response?.data || error.message
    );

    if (error.response?.status === 404) {
      throw new Error(`File not found: ${filePath}`);
    }
    throw new Error("Failed to fetch file from GitHub");
  }
}

export async function saveGitHubFile(
  filePath: string,
  content: string,
  repoUrl?: string
): Promise<void> {
  const GITHUB_REPO = getRepoFromUrl(repoUrl || null);
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

  try {
    // First get the current file to get its SHA (needed for updating)
    const currentFile = await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      })
      .catch(() => null); // File might not exist yet

    const encodedContent = Buffer.from(content).toString("base64");

    const payload = {
      message: `Update ${filePath}`,
      content: encodedContent,
      ...(currentFile?.data?.sha && { sha: currentFile.data.sha }), // Include SHA if file exists
    };

    await axios.put(url, payload, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
  } catch (error: any) {
    console.error(
      "Error saving file to GitHub:",
      error.response?.data || error.message
    );
    throw new Error("Failed to save file to GitHub");
  }
}

export async function deleteGitHubFile(
  filePath: string,
  repoUrl?: string
): Promise<void> {
  const GITHUB_REPO = getRepoFromUrl(repoUrl || null);
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

  try {
    // Get the current file to get its SHA (required for deletion)
    const currentFile = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const payload = {
      message: `Delete ${filePath}`,
      sha: currentFile.data.sha,
    };

    await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      data: payload,
    });
  } catch (error: any) {
    console.error(
      "Error deleting file from GitHub:",
      error.response?.data || error.message
    );
    throw new Error("Failed to delete file from GitHub");
  }
}
///asdasda

export async function listGitHubTemplates(repoUrl?: string): Promise<string[]> {
  const GITHUB_REPO = getRepoFromUrl(repoUrl || null);
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/public/template`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (Array.isArray(response.data)) {
      return response.data
        .filter((item) => item.type === "file")
        .map((file) => file.name.replace(/\.json$/, ""))
        .map((name) => name.replace(/(lg|sm|Sm|Lg)$/, ""))
        .filter((name, index, array) => array.indexOf(name) === index);
    }

    return [];
  } catch (error: any) {
    console.error(
      "Error listing templates from GitHub:",
      error.response?.data || error.message
    );
    throw new Error("Failed to list templates from GitHub");
  }
}

export async function createRoutePage(
  routeName: string,
  repoUrl?: string
): Promise<void> {
  const pageContent = `"use client";
import { useEffect, useState } from "react";
import ImageText from "@/components/imageText";
import ContactForm from "@/components/contactForm";
import NewsLetter from "@/components/newsLetter";
import { usePathname } from "next/navigation";
import Banner from "@/components/banner";
import CollapseFaq from "@/components/collapseFaq";
import MultiColumn from "@/components/multiColumn";
import MultiRow from "@/components/multiRow";
import SlideShow from "@/components/slideShow";
import Video from "@/components/video";
import { Collection } from "@/components/collection";
import RichText from "@/components/richText";
import ProductList from "@/components/productList";

export default function Page() {
  const [data, setData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<string[]>([]);
  const pathname = usePathname();

  const componentMap = {
    RichText,
    Banner,
    ImageText,
    Video,
    ContactForm,
    NewsLetter,
    CollapseFaq,
    MultiColumn,
    SlideShow,
    MultiRow,
    ProductList,
    Collection,
  };

  useEffect(() => {
    const getData = async () => {
      console.log(setIsMobile);
      console.log(setError);
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL is not set");
      }
      const routePath = pathname.split("/").pop() || "home";

      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/sections?" + routePath,
        {
          cache: "no-store",
        }
      );
      const data = await response.json();

      setData(data.Children.sections);
      setOrders(data.Children.order);

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
    };
    getData();
  }, [pathname]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 ">
        {orders.map((componentName, index) => {
          const baseComponentName = componentName.split("-")[0];
          const Component =
            componentMap[baseComponentName as keyof typeof componentMap];

          return Component ? (
            <div
              key={componentName} // Using the full componentName which includes the UUID
              style={{ order: index }}
              className="w-full"
            >
              <Component
                sections={data}
                isMobile={isMobile}
                componentName={componentName}
              />
            </div>
          ) : null;
        })}
      </div>
    </>
  );
}
`;

  const filePath = `app/${routeName}/page.tsx`;
  await saveGitHubFile(filePath, pageContent, repoUrl);
}

export async function deleteRoutePage(
  routeName: string,
  repoUrl?: string
): Promise<void> {
  const filePath = `app/${routeName}/page.tsx`;
  await deleteGitHubFile(filePath, repoUrl);
}
