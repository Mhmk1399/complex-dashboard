import React, { useState } from "react";
import { DeepSeekClient } from "@/lib/DeepSeekClient";
import { toast } from "react-toastify";

interface ProductData {
  name?: string;
  category?: string;
  features?: string[];
  colors?: string[];
  properties?: Record<string, unknown>;
  targetAudience?: string;
  tone?: string;
}

interface AIDescriptionGeneratorProps {
  productData: ProductData;
  onDescriptionGenerated: (description: string) => void;
}

export const AIDescriptionGenerator = ({
  productData,
  onDescriptionGenerated,
}: AIDescriptionGeneratorProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const generateDescription = async () => {
    setIsLoading(true);
    try {
      const features = [
        ...(productData.features || []),
        ...Object.entries(productData.properties || {}).map(([key, value]) => `${key}: ${value}`)
      ];

      const prompt = `Act as a professional e-commerce copywriter. Generate a compelling, SEO-friendly product description for the following product.

Product Name: ${productData.name || 'Product'}
Category: ${productData.category || 'General'}
Key Features/Benefits:
${features.map((feature, index) => `${index + 1}. ${feature}`).join('\n')}

Target Audience: ${productData.targetAudience || 'General consumers'}
Tone of Voice: ${productData.tone || 'Professional and trustworthy'}

Output a single paragraph (3-5 sentences) that highlights the key benefits, speaks directly to the target audience, and inspires a purchase. Use persuasive language and focus on how the product improves the user's life. Return ONLY the description text without any additional formatting or explanations.`;

      const description = await DeepSeekClient.sendPrompt(prompt);
      onDescriptionGenerated(description.trim());
      toast.success("Description generated successfully!");
    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Failed to generate description");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={generateDescription}
      disabled={isLoading}
      className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      )}
      {isLoading ? "Generating..." : "Generate AI Description"}
    </button>
  );
};