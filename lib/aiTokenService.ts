interface TokenUsage {
  totalTokens: number;
  usedTokens: number;
  remainingTokens: number;
  lastUsed: Date;
  usageHistory: Array<{
    date: Date;
    tokensUsed: number;
    feature: string;
    prompt?: string;
  }>;
}

export class AITokenService {
  private static readonly TOKENS_PER_REQUEST = 5; // Estimated tokens per AI request

  static async getTokenUsage(storeId: string): Promise<TokenUsage | null> {
    try {
      const response = await fetch(`/api/ai-usage?storeId=${storeId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.log('Error fetching token usage:', error);
      return null;
    }
  }

  static async hasEnoughTokens(storeId: string, requiredTokens: number = this.TOKENS_PER_REQUEST): Promise<boolean> {
    const usage = await this.getTokenUsage(storeId);
    return usage ? usage.remainingTokens >= requiredTokens : false;
  }

  static async consumeTokens(storeId: string, tokensUsed: number, feature: string, prompt?: string): Promise<boolean> {
    try {
      const response = await fetch('/api/ai-usage/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, tokensUsed, feature, prompt })
      });
      return response.ok;
    } catch (error) {
      console.log('Error consuming tokens:', error);
      return false;
    }
  }

  static getEstimatedTokens(): number {
    return this.TOKENS_PER_REQUEST;
  }
}