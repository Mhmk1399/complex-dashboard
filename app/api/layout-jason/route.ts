import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import { fetchFromMongoDB, saveToMongoDB } from "@/services/mongodb";
import homelg from "@/public/template/homelg.json";
import homesm from "@/public/template/homesm.json";
import fs from "fs/promises";
import path from "path";
import { getStoreIdFromRequest } from "@/utilities/getStoreId";

// export async function GET(request: NextRequest) {
//   await connect();

//   try {
//     const routeName = request.headers.get("selectedRoute");
//     const activeMode = request.headers.get("activeMode") || "lg";
//     const storeId = getStoreIdFromRequest(request);

//     if (!routeName || !activeMode) {
//       return NextResponse.json(
//         { error: "Missing required parameters" },
//         { status: 400 }
//       );
//     }

//     const getFilename = (routeName: string) => `${routeName}${activeMode}`;

//     console.log(routeName, "routename");
//     console.log(activeMode, "activeMode");
//     console.log(getFilename(routeName), "filename");

//     // Resolve the path to the JSON files in the public/template directory
//     const basePath = path.join(process.cwd(), "public", "template");
//     console.log(basePath , "//////////////")
//     console.log(getFilename("home"), " filename");

//     if (routeName === "home") {
//       const filePath = path.join(basePath, `store${activeMode}.json`);
//       try {
//         const homeContent = JSON.parse(await fs.readFile(filePath, "utf-8"));
//         return NextResponse.json(homeContent, { status: 200 });
//       } catch (error) {
//         console.error(`Error reading ${filePath}:`, error);
//         return NextResponse.json(
//           { error: `Failed to fetch home${activeMode} content` },
//           { status: 404 }
//         );
//       }
//     }

//     try {
//       const routeFilePath = path.join(
//         basePath,
//         `${routeName}${activeMode}.json`
//       );
//       const homeFilePath = path.join(basePath, `home${activeMode}.json`);

//       const routeContent = JSON.parse(
//         await fs.readFile(routeFilePath, "utf-8")
//       );
//       const homeContent = JSON.parse(await fs.readFile(homeFilePath, "utf-8"));

//       const layout = {
//         sections: {
//           sectionHeader: homeContent.sections.sectionHeader,
//           children: routeContent.children,
//           sectionFooter: homeContent.sections.sectionFooter,
//         },
//       };

//       return NextResponse.json(layout, { status: 200 });
//     } catch (error) {
//       console.error("Error fetching content:", error);
//       return NextResponse.json(
//         { error: "Failed to fetch route content" },
//         { status: 404 }
//       );
//     }
//   } catch (error) {
//     console.error("Error processing request:", error);
//     return NextResponse.json(
//       { error: "Failed to process request" },
//       { status: 500 }
//     );
//   }
// }

export async function POST(request: NextRequest) {
  await connect();

  try {
    const routeName = request.headers.get("selectedRoute");
    const activeMode = request.headers.get("activeMode") || "lg";
    const storeId = getStoreIdFromRequest(request);
    console.log(storeId, "..........................");

    if (!routeName || !activeMode) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const newLayout = await request.json();

    console.log(newLayout, "json body");
    const filename = `${routeName}${activeMode}`;
    console.log(filename);

    if (routeName === "home") {
      await saveToMongoDB(routeName, activeMode, storeId, newLayout);
      return NextResponse.json(
        { message: "Layout saved successfully" },
        { status: 200 }
      );
    }

    const children = newLayout.sections?.children || {};
    await saveToMongoDB(routeName, activeMode, storeId, { children });
    return NextResponse.json(
      { message: "Children section saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "Failed to save layout: " + error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  await connect();

  try {
    const routeName = request.headers.get("selectedRoute");
    const activeMode = request.headers.get("activeMode") || "lg";
    const storeId = getStoreIdFromRequest(request);

    if (!routeName || !activeMode) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const getFilename = (routeName: string) => `${routeName}${activeMode}`;

    console.log(routeName, "routename");
    console.log(activeMode, "activeMode");

    console.log(getFilename("home"), " filename");

    if (routeName === "home") {
      const homeContent = JSON.parse(
        await fetchFromMongoDB("home", activeMode, storeId)
      );
      return NextResponse.json(homeContent, { status: 200 });
    }

    try {
      const routeContent = JSON.parse(
        await fetchFromMongoDB(routeName, activeMode, storeId)
      );
      const homeContent = JSON.parse(
        await fetchFromMongoDB("home", activeMode, storeId)
      );

      const layout = {
        sections: {
          sectionHeader: homeContent.sections.sectionHeader,
          children: routeContent.children,
          sectionFooter: homeContent.sections.sectionFooter,
        },
      };

      return NextResponse.json(layout, { status: 200 });
    } catch (error) {
      console.error("Error fetching content:", error);
      return NextResponse.json(
        { error: "Failed to fetch route content" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
