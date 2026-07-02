/**
 * Contract Tests - API Shape Validation
 * 
 * Tests that ensure the API contracts (schemas, DTOs, types)
 * remain consistent and don't break unexpectedly.
 * 
 * Shared package is the source of truth.
 */

import { describe, it, expect } from 'vitest'
import { 
  emailSchema, 
  usernameSchema, 
  passwordSchema,
  updateUserSchema 
} from 'shared/schemas/user/user.schema'

describe('API Contracts', () => {
  describe('User Schema Contracts', () => {
    describe('emailSchema', () => {
      it('has correct validation rules', () => {
        // Valid cases
        expect(emailSchema.safeParse('user@example.com').success).toBe(true)
        expect(emailSchema.safeParse('user.name@domain.co.uk').success).toBe(true)
        
        // Invalid cases
        expect(emailSchema.safeParse('').success).toBe(false)
        expect(emailSchema.safeParse('invalid').success).toBe(false)
        expect(emailSchema.safeParse('user@').success).toBe(false)
      })
      
      it('returns expected error message for invalid email', () => {
        const result = emailSchema.safeParse('invalid')
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid email address')
        }
      })
    })
    
    describe('usernameSchema', () => {
      it('enforces minimum length of 3 characters', () => {
        expect(usernameSchema.safeParse('abc').success).toBe(true)
        expect(usernameSchema.safeParse('ab').success).toBe(false)
        expect(usernameSchema.safeParse('a').success).toBe(false)
        expect(usernameSchema.safeParse('').success).toBe(false)
      })
      
      it('returns expected error message for short username', () => {
        const result = usernameSchema.safeParse('ab')
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Username must be at least 3 characters long')
        }
      })
    })
    
    describe('passwordSchema', () => {
      it('enforces all password requirements', () => {
        // Valid: has length, uppercase, lowercase, number, special char
        expect(passwordSchema.safeParse('Password123!').success).toBe(true)
        
        // Too short
        expect(passwordSchema.safeParse('Ab1!').success).toBe(false)
        
        // Missing uppercase
        expect(passwordSchema.safeParse('password123!').success).toBe(false)
        
        // Missing lowercase
        expect(passwordSchema.safeParse('PASSWORD123!').success).toBe(false)
        
        // Missing number
        expect(passwordSchema.safeParse('Password!').success).toBe(false)
        
        // Missing special character
        expect(passwordSchema.safeParse('Password123').success).toBe(false)
      })
    })
    
    describe('updateUserSchema', () => {
      it('requires at least one field', () => {
        expect(updateUserSchema.safeParse({}).success).toBe(false)
      })
      
      it('allows partial updates', () => {
        expect(updateUserSchema.safeParse({ email: 'new@example.com' }).success).toBe(true)
        expect(updateUserSchema.safeParse({ username: 'newuser' }).success).toBe(true)
        expect(updateUserSchema.safeParse({ password: 'NewPass123!' }).success).toBe(true)
      })
      
      it('validates each field when provided', () => {
        expect(updateUserSchema.safeParse({ email: 'invalid' }).success).toBe(false)
        expect(updateUserSchema.safeParse({ username: 'ab' }).success).toBe(false)
        expect(updateUserSchema.safeParse({ password: 'weak' }).success).toBe(false)
      })
    })
  })
  
  describe('Breaking Change Detection', () => {
    it('email schema structure has not changed', () => {
      // Verify the schema produces expected output structure
      const valid = emailSchema.safeParse('test@example.com')
      expect(valid).toHaveProperty('success', true)
      expect(valid).toHaveProperty('data', 'test@example.com')
      
      const invalid = emailSchema.safeParse('invalid')
      expect(invalid).toHaveProperty('success', false)
      expect(invalid).toHaveProperty('error')
    })
    
    it('updateUserSchema allows expected fields', () => {
      const schema = updateUserSchema
      
      // These should be the only allowed fields
      const validUpdate = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'NewPass123!',
      }
      
      expect(schema.safeParse(validUpdate).success).toBe(true)
    })
  })
})
