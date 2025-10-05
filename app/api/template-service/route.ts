import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Jsons from "@/models/jsons";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  await connect();

  try {
    const { storeId, templateName } = await request.json();

    if (!storeId || !templateName) {
      return NextResponse.json(
        { error: "Missing storeId or templateName" },
        { status: 400 }
      );
    }

    const templatePath = path.join(process.cwd(), "templates", templateName);
    
    // Check if template directory exists
    try {
      await fs.access(templatePath);
    } catch {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Remove all existing JSONs for this store
    await Jsons.deleteMany({ storeId });

    // Get all template files
    const files = await fs.readdir(templatePath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    const results = [];

    for (const file of jsonFiles) {
      const filePath = path.join(templatePath, file);
      const content = JSON.parse(await fs.readFile(filePath, 'utf-8'));
      
      // Extract route and mode from filename (e.g., "homelg.json" -> route: "home", mode: "lg")
      const fileName = file.replace('.json', '');
      const route = fileName.replace(/lg$|sm$/, '');
      const isLg = fileName.endsWith('lg');
      const isSm = fileName.endsWith('sm');

      if (!isLg && !isSm) continue;

      // Find existing record or create new one
      let existingRecord = await Jsons.findOne({ storeId, route });

      if (existingRecord) {
        // Update existing record
        if (isLg) {
          existingRecord.lgContent = content;
        } else {
          existingRecord.smContent = content;
        }
        await existingRecord.save();
      } else {
        // Create new record
        const newRecord = new Jsons({
          storeId,
          route,
          lgContent: isLg ? content : {},
          smContent: isSm ? content : {},
          version: "1"
        });
        await newRecord.save();
        existingRecord = newRecord;
      }

      results.push({
        route,
        mode: isLg ? 'lg' : 'sm',
        success: true
      });
    }

    return NextResponse.json({
      success: true,
      message: `Template ${templateName} applied successfully`,
      results
    });

  } catch (error) {
    console.error("Error applying template:", error);
    return NextResponse.json(
      { error: "Failed to apply template" },
      { status: 500 }
    );
  }
}