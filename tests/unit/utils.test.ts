import { createMockUser, createMockDocument, createMockAiResponse, resetMocks } from '../utils/testHelpers'

describe('Utility Functions', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('helpers', () => {
    test('should calculate word count correctly', () => {
      const text = 'This is a test with five words'
      const wordCount = text.trim().split(/\s+/).length
      expect(wordCount).toBe(7) // "This is a test with five words" = 7 words
    })

    test('should handle empty text', () => {
      const text = ''
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
      expect(wordCount).toBe(0)
    })

    test('should handle text with multiple spaces', () => {
      const text = 'This    has    multiple    spaces'
      const wordCount = text.trim().split(/\s+/).length
      expect(wordCount).toBe(4)
    })
  })

  describe('Email validation', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    test('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'firstname.lastname@company.com'
      ]

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true)
      })
    })

    test('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid.email',
        '@example.com',
        'user@',
        'user@domain',
        'user name@example.com',
        'user@@example.com'
      ]

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false)
      })
    })
  })

  describe('Date handling', () => {
    test('should handle trial date calculations', () => {
      const startDate = new Date('2024-01-01')
      const trialDays = 7
      const endDate = new Date(startDate.getTime() + trialDays * 24 * 60 * 60 * 1000)
      
      expect(endDate.getDate()).toBe(8)
      expect(endDate.getMonth()).toBe(0) // January
    })

    test('should check if trial is active', () => {
      const trialEndDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      const isTrialActive = trialEndDate > new Date()
      
      expect(isTrialActive).toBe(true)
    })

    test('should check if trial is expired', () => {
      const trialEndDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      const isTrialActive = trialEndDate > new Date()
      
      expect(isTrialActive).toBe(false)
    })
  })

  describe('Usage calculations', () => {
    test('should calculate monthly usage correctly', () => {
      const currentDate = new Date('2024-01-15')
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      
      expect(currentMonth).toBe(1)
      expect(currentYear).toBe(2024)
    })

    test('should calculate word limit compliance', () => {
      const currentWordsUsed = 12000
      const newWordCount = 2000
      const wordLimit = 15000
      
      const willExceedLimit = currentWordsUsed + newWordCount > wordLimit
      const remainingWords = Math.max(0, wordLimit - currentWordsUsed)
      
      expect(willExceedLimit).toBe(false)
      expect(remainingWords).toBe(3000)
    })

    test('should handle word limit exceeded scenario', () => {
      const currentWordsUsed = 14000
      const newWordCount = 2000
      const wordLimit = 15000
      
      const willExceedLimit = currentWordsUsed + newWordCount > wordLimit
      const remainingWords = Math.max(0, wordLimit - currentWordsUsed)
      
      expect(willExceedLimit).toBe(true)
      expect(remainingWords).toBe(1000)
    })
  })

  describe('Test data factories', () => {
    test('should create mock user with defaults', () => {
      const user = createMockUser()
      
      expect(user.id).toBe('user-test-id')
      expect(user.email).toBe('test@example.com')
      expect(user.isOnTrial).toBe(false)
    })

    test('should create mock user with overrides', () => {
      const user = createMockUser({
        email: 'custom@example.com',
        isOnTrial: true,
        planType: 'monthly'
      })
      
      expect(user.email).toBe('custom@example.com')
      expect(user.isOnTrial).toBe(true)
      expect(user.planType).toBe('monthly')
    })

    test('should create mock document', () => {
      const document = createMockDocument()
      
      expect(document.wordCount).toBe(9)
      expect(document.mechanisms).toBe('["grammar","clarity"]')
      expect(JSON.parse(document.mechanisms)).toEqual(['grammar', 'clarity'])
    })

    test('should create mock AI response', () => {
      const response = createMockAiResponse()
      
      expect(response.analytics.readabilityScore).toBe(85.5)
      expect(response.metadata.provider).toBe('Google Gemini')
      expect(response.processedText).toContain('AI-processed')
    })
  })
})
