// components/ai/AIModal.tsx
import React, { useState } from "react";
import { DeepSeekClient } from "@/lib/DeepSeekClient";
import { FaRobot } from "react-icons/fa";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyles: string; // Current component styles
  onApplyChanges: (updatedStyles: unknown) => void; // Callback to apply changes
  mode?: 'general' | 'description'; // Mode for different AI operations
}

export const AIModal = ({
  isOpen,
  onClose,
  currentStyles,
  onApplyChanges,
  mode = 'general',
}: AIModalProps) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("لطفا درخواست خود را وارد کنید");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare the full prompt with context
      const fullPrompt = mode === 'description' 
        ? `Act as a professional e-commerce copywriter. Generate a compelling, SEO-friendly product description based on the product data: ${currentStyles}
           User additional requirements: ${prompt}
           Return ONLY the description text without any formatting.`
        : `You are a JSON generator for a website builder.
           get the provided json and update its variables according to the user request 
           Current component JSON: ${JSON.stringify(currentStyles)}
           User request: ${prompt}
           Return ONLY the updated JSON without any explanations or markdown.`;

      const response = await DeepSeekClient.sendPrompt(fullPrompt);

      if (mode === 'description') {
        onApplyChanges(response.trim());
      } else {
        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No valid JSON found in response");
        }
        const updatedStyles = JSON.parse(jsonMatch[0]);
        onApplyChanges(updatedStyles);
      }
      toast.success("Component updated with AI!");
      onClose();
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process request";
      toast.error(`AI Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/20  flex items-center justify-center z-[100]"
      dir="rtl"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/70 p-6 border border-gray-300 backdrop-blur-lg rounded-xl shadow-lg w-full max-w-md"
      >
        <div className="flex items-center mb-4">
          <FaRobot className="text-purple-500 ml-2" size={24} />
          <h3 className="text-xl font-bold text-black">دستیار هوشمند</h3>
        </div>

        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={mode === 'description' ? "توضیحات اضافی برای محصول (اختیاری)" : "درخواست خود را اینجا وارد کنید"}
            className="w-full p-3 bg-white/10 text-black border border-gray-500 placeholder:text-gray-500 rounded-lg min-h-[150px] focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />

          <div className="flex justify-start gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              لغو
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  در خال پردازش...
                </>
              ) : (
                "اعمال تغییرات"
              )}
            </button>
          </div>
        </div>
      </motion.div>
      <ToastContainer position="top-center" rtl />
    </div>
  );
};
