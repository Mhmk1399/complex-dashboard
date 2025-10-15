import axios from "axios";
import { AITokenService } from "./aiTokenService";

interface DeepSeekResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export class DeepSeekClient {
  private static readonly BASE_URL = "https://api.deepseek.com/v1";
  private static readonly TOKENS_PER_REQUEST = 5;
  
  static async sendPrompt(prompt: string, storeId: string, feature: string): Promise<string> {
    const apiKey = "sk-087c65add4844cabbf5fa98e2ef02519";
    
    if (!apiKey) {
      throw new Error("AI_DEEPSEEK_KEY environment variable is not set");
    }

    // Check if user has enough tokens
    const hasTokens = await AITokenService.hasEnoughTokens(storeId, this.TOKENS_PER_REQUEST);
    if (!hasTokens) {
      const usage = await AITokenService.getTokenUsage(storeId);
      throw new Error(`Insufficient tokens. Remaining: ${usage?.remainingTokens || 0}, Required: ${this.TOKENS_PER_REQUEST}`);
    }

    try {
      const response = await axios.post<DeepSeekResponse>(
        `${this.BASE_URL}/chat/completions`,
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 240000,
        }
      );

      if (!response.data.choices?.[0]?.message?.content) {
        throw new Error("Invalid response format from DeepSeek API");
      }
      
      // Consume tokens after successful API call
      await AITokenService.consumeTokens(storeId, this.TOKENS_PER_REQUEST, feature, prompt);
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.log(error);
      let errorMessage = "Failed to call DeepSeek API";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage += `: ${error.response.status} - ${
            error.response.data?.error?.message || "Unknown error"
          }`;
        } else if (error.request) {
          errorMessage += ": No response received";
        } else {
          errorMessage += `: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }

      throw new Error(errorMessage);
    }
  }
}
