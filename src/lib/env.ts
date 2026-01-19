import { z } from 'zod'

const isProduction = import.meta.env.PROD

const schema = z.object({
  VITE_API_BASE_URL: z
    .string()
    // In development, allow relative URLs for proxy, in production require full URL
    .refine(
      (val) => {
        if (isProduction) {
          // In production, must be a full HTTPS URL
          try {
            const url = new URL(val)
            return url.protocol === 'https:' && !val.includes('localhost') && !val.includes('127.0.0.1')
          } catch {
            return false
          }
        }
        // In development, allow relative URLs (for proxy) or full URLs
        return true
      },
      {
        message: 'VITE_API_BASE_URL must be set to an HTTPS production URL in production environment',
      }
    )
    .default(import.meta.env.DEV ? '/api' : 'https://app.reeltoksocial.com/api'),
  VITE_SOLANA_NETWORK: z
    .enum(['mainnet-beta', 'devnet', 'testnet'])
    .default('mainnet-beta'),
  VITE_SOLANA_RPC_URL: z.string().url().optional(),
  VITE_AWS_SECRET_KEY: z.string().min(1, 'VITE_AWS_SECRET_KEY is required'),
  VITE_AWS_ACCESS_KEY_ID: z.string().min(1, 'VITE_AWS_ACCESS_KEY_ID is required'),
  VITE_AWS_REGION: z.string().min(1, 'VITE_AWS_REGION is required'),
  VITE_AWS_BUCKET_NAME: z.string().min(1, 'VITE_AWS_BUCKET_NAME is required'),
})

// Parse environment variables
const envVars = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_SOLANA_NETWORK: import.meta.env.VITE_SOLANA_NETWORK,
  VITE_SOLANA_RPC_URL: import.meta.env.VITE_SOLANA_RPC_URL,
  VITE_AWS_SECRET_KEY: import.meta.env.VITE_AWS_SECRET_KEY,
  VITE_AWS_ACCESS_KEY_ID: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
  VITE_AWS_REGION: import.meta.env.VITE_AWS_REGION,
  VITE_AWS_BUCKET_NAME: import.meta.env.VITE_AWS_BUCKET_NAME,
}

export const env = schema.parse(envVars)

// Export individual values for convenience
export const API_BASE_URL = env.VITE_API_BASE_URL
export const SOLANA_NETWORK = env.VITE_SOLANA_NETWORK
export const SOLANA_RPC_URL = env.VITE_SOLANA_RPC_URL
export const AWS_SECRET_KEY = env.VITE_AWS_SECRET_KEY 
export const AWS_ACCESS_KEY_ID = env.VITE_AWS_ACCESS_KEY_ID
export const AWS_REGION = env.VITE_AWS_REGION
export const AWS_BUCKET_NAME = env.VITE_AWS_BUCKET_NAME
