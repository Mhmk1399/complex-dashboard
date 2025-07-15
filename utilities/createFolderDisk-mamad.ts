import path from "path";
import fs from "fs";

const DiskPath = process.env.DISK_PATH;
const templatePath = 'mnt/disk/template'

// New interface for direct parameters
interface CreateFolderDiskParams {
  phoneNumber: string;
  title: string;
  storeId: string;
}

// Modified function that accepts parameters directly
export async function createFolderDisk(params: CreateFolderDiskParams) {
  const { phoneNumber, title, storeId } = params;

  if (!DiskPath) {
    return {
      success: false,
      error: "DISK_PATH environment variable is not set",
      status: 500
    };
  }

  try {
    // Create the new directory path
    const newDirectoryPath = path.join(DiskPath, storeId);
    
    // Check if the directory already exists
    if (fs.existsSync(newDirectoryPath)) {
      return {
        success: false,
        error: `Directory ${storeId} already exists`,
        status: 400
      };
    }

    // Create the new directory
    fs.mkdirSync(newDirectoryPath, { recursive: true });
    console.log(`Created directory: ${newDirectoryPath}`);

    // Check if template directory exists
    if (!fs.existsSync(templatePath)) {
      return {
        success: false,
        error: "Template directory does not exist",
        status: 404
      };
    }

    // Copy templates from template path to new directory
    await copyDirectory(templatePath, newDirectoryPath);
    console.log(`Copied templates from ${templatePath} to ${newDirectoryPath}`);

    return {
      success: true,
      message: `Directory ${storeId} created and templates copied successfully`,
      directoryPath: newDirectoryPath,
      phoneNumber,
      title
    };

  } catch (error) {
    console.error("Error creating directory or copying templates:", error);
    return {
      success: false,
      error: "Failed to create directory or copy templates",
      status: 500
    };
  }
}




// Helper function to recursively copy directory contents
async function copyDirectory(src: string, dest: string): Promise<void> {
  try {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    // Read the source directory
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        // Recursively copy subdirectories
        await copyDirectory(srcPath, destPath);
      } else {
        // Copy files
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied file: ${srcPath} -> ${destPath}`);
      }
    }
  } catch (error) {
    console.error(`Error copying directory from ${src} to ${dest}:`, error);
    throw error;
  }
}
