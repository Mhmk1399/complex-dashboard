import React, { useState, useEffect } from "react";
import { DeepSeekClient } from "@/lib/DeepSeekClient";
import { AITokenService } from "@/lib/aiTokenService";
import { TokenDisplay } from "./TokenDisplay";
import toast from "react-hot-toast";

interface BlogData {
  title?: string;
  seoTitle?: string;
  description?: string;
  tone?: string;
}

interface AIBlogGeneratorProps {
  blogData: BlogData;
  onBlogGenerated: (content: string) => void;
}

export const AIBlogGenerator = ({
  blogData,
  onBlogGenerated,
}: AIBlogGeneratorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasTokens, setHasTokens] = useState(true);
  const [remainingTokens, setRemainingTokens] = useState(0);

  useEffect(() => {
    checkTokens();
  }, []);

  const checkTokens = async () => {
    const storeId = localStorage.getItem("storeId");
    if (!storeId) return;
    
    const usage = await AITokenService.getTokenUsage(storeId);
    if (usage) {
      setRemainingTokens(usage.remainingTokens);
      setHasTokens(usage.remainingTokens >= AITokenService.getEstimatedTokens());
    }
  };

  const generateBlog = async () => {
    if (
      !blogData.title?.trim() ||
      !blogData.seoTitle?.trim() ||
      !blogData.description?.trim()
    ) {
      toast.error("لطفاً ابتدا عنوان، عنوان سئو و توضیحات را وارد کنید");
      return;
    }

    const storeId = localStorage.getItem("storeId");
    if (!storeId) {
      toast.error("خطا در احراز هویت");
      return;
    }

    if (!hasTokens) {
      toast.error(`توکن کافی ندارید. باقیمانده: ${remainingTokens}`);
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `Generate a complete Persian blog article in HTML format for TipTap editor.

Topic: ${blogData.title}
SEO Title: ${blogData.seoTitle}
Meta Description: ${blogData.description}

Requirements:
- Generate clean HTML with proper tags: <h1>, <h2>, <h3>, <p>, <ul>, <li>
- Article must be at least 1100 words in Persian
- Use SEO-friendly headings and structure
- Natural, engaging Persian writing style
- Include introduction, main sections with H2/H3 headings, and conclusion

Return ONLY the HTML content without any explanations or markdown.`;

      const content = await DeepSeekClient.sendPrompt(prompt, storeId, "blog-generation");
      onBlogGenerated(content.trim());
      toast.success("مقاله با موفقیت تولید شد!");
      await checkTokens(); // Refresh token count
    } catch (error: any) {
      if (error.message.includes("Insufficient tokens")) {
        toast.error("توکن کافی ندارید");
        await checkTokens();
      } else {
        toast.error("خطا در تولید مقاله");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <TokenDisplay />
      <button
        onClick={generateBlog}
        disabled={isLoading || !hasTokens}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
          !hasTokens ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
        } text-white disabled:opacity-50`}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {isLoading ? "در حال تولید..." : !hasTokens ? "توکن کافی نیست" : "تولید مقاله با هوش مصنوعی"}
      </button>
    </div>
  );
};
