/**
 * Integration Tests - Client ↔ Server Contract
 * 
 * Tests the interaction between client expectations and server responses.
 * Uses shared DTOs to validate both sides of the contract.
 */

import { describe, it, expect, vi } from 'vitest'
import { emailSchema, passwordSchema, usernameSchema } from 'shared/schemas/user/user.schema'

// Mock server response types
interface AuthResponse {
  success: boolean
  data?: {
    user: {
      id: string
      email: string
      username: string
    }
    token: string
    refreshToken: string
  }
  error?: string
}

// Mock API client that mirrors client implementation
const mockApiClient = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Validate inputs using shared schemas
    const emailResult = emailSchema.safeParse(email)
    const passwordResult = passwordSchema.safeParse(password)
    
    if (!emailResult.success || !passwordResult.success) {
      return { success: false, error: 'Invalid credentials format' }
    }
    
    // Mock successful response
    return {
      success: true,
      data: {
        user: {
          id: 'user-123',
          email,
          username: 'testuser',
        },
        token: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    }
  },
  
  register: async (email: string, username: string, password: string): Promise<AuthResponse> => {
    const emailResult = emailSchema.safeParse(email)
    const usernameResult = usernameSchema.safeParse(username)
    const passwordResult = passwordSchema.safeParse(password)
    
    if (!emailResult.success || !usernameResult.success || !passwordResult.success) {
      return { success: false, error: 'Invalid registration data' }
    }
    
    return {
      success: true,
      data: {
        user: {
          id: 'new-user-123',
          email,
          username,
        },
        token: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    }
  },
}

describe('Client-Server Integration', () => {
  describe('Authentication Flow', () => {
    it('validates login credentials using shared schema', async () => {
      const response = await mockApiClient.login('test@example.com', 'Password123!')
      
      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data?.user.email).toBe('test@example.com')
      expect(response.data?.token).toBeDefined()
    })
    
    it('rejects invalid email format', async () => {
      const response = await mockApiClient.login('invalid-email', 'Password123!')
      
      expect(response.success).toBe(false)
      expect(response.error).toBeDefined()
    })
    
    it('rejects weak password on registration', async () => {
      const response = await mockApiClient.register(
        'test@example.com',
        'testuser',
        'weak' // Too short, missing requirements
      )
      
      expect(response.success).toBe(false)
      expect(response.error).toBeDefined()
    })
    
    it('accepts valid registration data', async () => {
      const response = await mockApiClient.register(
        'newuser@example.com',
        'newuser',
        'StrongPass123!'
      )
      
      expect(response.success).toBe(true)
      expect(response.data?.user.username).toBe('newuser')
    })
  })
  
  describe('Data Contract Validation', () => {
    it('response shape matches expected client interface', async () => {
      const response = await mockApiClient.login('test@example.com', 'Password123!')
      
      if (response.success && response.data) {
        // Validate response shape
        expect(response.data).toHaveProperty('user')
        expect(response.data).toHaveProperty('token')
        expect(response.data).toHaveProperty('refreshToken')
        
        // Validate user shape
        expect(response.data.user).toHaveProperty('id')
        expect(response.data.user).toHaveProperty('email')
        expect(response.data.user).toHaveProperty('username')
      }
    })
  })
})
