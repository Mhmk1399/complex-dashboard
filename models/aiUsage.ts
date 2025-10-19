import mongoose from "mongoose";

const aiUsageSchema = new mongoose.Schema({
  storeId: {
    type: String,
    required: true,
    index: true
  },
  totalTokens: {
    type: Number,
    default: 500, // Default 1000 tokens for new users
    min: 0
  },
  usedTokens: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingTokens: {
    type: Number,
    default: 500,
    min: 0
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  usageHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    tokensUsed: {
      type: Number,
      required: true
    },
    feature: {
      type: String,
      enum: ['blog-generation', 'product-description', 'ai-modal-generation'],
      required: true
    },
    prompt: {
      type: String,
      maxlength: 500
    }
  }]
}, {
  timestamps: true
});

// Calculate remaining tokens before saving
aiUsageSchema.pre('save', function(next) {
  this.remainingTokens = this.totalTokens - this.usedTokens;
  next();
});

// Static method to check if user has enough tokens
aiUsageSchema.statics.hasEnoughTokens = async function(storeId: string, requiredTokens: number) {
  const usage = await this.findOne({ storeId });
  if (!usage) return false;
  return usage.remainingTokens >= requiredTokens;
};

// Static method to consume tokens
aiUsageSchema.statics.consumeTokens = async function(storeId: string, tokensUsed: number, feature: string, prompt?: string) {
  const usage = await this.findOne({ storeId });
  if (!usage || usage.remainingTokens < tokensUsed) {
    throw new Error('Insufficient tokens');
  }
  
  usage.usedTokens += tokensUsed;
  usage.remainingTokens = usage.totalTokens - usage.usedTokens;
  usage.lastUsed = new Date();
  usage.usageHistory.push({
    tokensUsed,
    feature,
    prompt: prompt?.substring(0, 500)
  });
  
  await usage.save();
  return usage;
};

export const AIUsage = mongoose.models.AIUsage || mongoose.model("AIUsage", aiUsageSchema);