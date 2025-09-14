/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/newsletter/subscribe/route'
import { prisma } from '@/lib/prisma'
import { createMockNewsletterSubscriber } from '../utils/testHelpers'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    newsletterSubscriber: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/newsletter/subscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    test('successfully subscribes new email', async () => {
      const email = 'test@example.com'
      const mockSubscriber = createMockNewsletterSubscriber({ email })

      mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null)
      mockPrisma.newsletterSubscriber.create.mockResolvedValue(mockSubscriber)

      const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('Successfully subscribed to newsletter')
      expect(data.subscriberId).toBe(mockSubscriber.id)

      expect(mockPrisma.newsletterSubscriber.findUnique).toHaveBeenCalledWith({
        where: { email: email.toLowerCase() },
      })
      expect(mockPrisma.newsletterSubscriber.create).toHaveBeenCalledWith({
        data: {
          email: email.toLowerCase(),
          subscribedAt: expect.any(Date),
          isActive: true,
        },
      })
    })

    test('rejects invalid email format', async () => {
      const invalidEmail = 'invalid-email'

      const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: invalidEmail }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Please enter a valid email address')
      expect(mockPrisma.newsletterSubscriber.findUnique).not.toHaveBeenCalled()
    })

    test('rejects missing email', async () => {
      const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email is required')
      expect(mockPrisma.newsletterSubscriber.findUnique).not.toHaveBeenCalled()
    })

    test('rejects already subscribed email', async () => {
      const email = 'existing@example.com'
      const existingSubscriber = createMockNewsletterSubscriber({ email })

      mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(existingSubscriber)

      const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('This email is already subscribed to our newsletter')
      expect(mockPrisma.newsletterSubscriber.create).not.toHaveBeenCalled()
    })

    test('handles database errors gracefully', async () => {
      const email = 'test@example.com'

      mockPrisma.newsletterSubscriber.findUnique.mockRejectedValue(
        new Error('Database connection failed')
      )

      const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error. Please try again later.')
    })

    test('converts email to lowercase', async () => {
      const email = 'Test@EXAMPLE.COM'
      const mockSubscriber = createMockNewsletterSubscriber({ 
        email: email.toLowerCase() 
      })

      mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null)
      mockPrisma.newsletterSubscriber.create.mockResolvedValue(mockSubscriber)

      const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
      })

      await POST(request)

      expect(mockPrisma.newsletterSubscriber.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
      expect(mockPrisma.newsletterSubscriber.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          subscribedAt: expect.any(Date),
          isActive: true,
        },
      })
    })

    test('validates email with complex but valid formats', async () => {
      const validEmails = [
        'user.name@example.com',
        'user+tag@example.org',
        'firstname.lastname@company.co.uk',
      ]

      for (const email of validEmails) {
        const mockSubscriber = createMockNewsletterSubscriber({ email })

        mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null)
        mockPrisma.newsletterSubscriber.create.mockResolvedValue(mockSubscriber)

        const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
          method: 'POST',
          body: JSON.stringify({ email }),
          headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(request)
        expect(response.status).toBe(201)

        jest.clearAllMocks()
      }
    })
  })
})
