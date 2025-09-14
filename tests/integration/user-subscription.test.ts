/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/user/subscription/route'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { createMockUser } from '../utils/testHelpers'

// Mock dependencies
jest.mock('next-auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    usageStats: {
      findFirst: jest.fn(),
    },
    document: {
      findMany: jest.fn(),
    },
  },
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/user/subscription', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    test('returns subscription data for authenticated user', async () => {
      const mockUser = createMockUser({
        subscriptionId: 'sub_123',
        subscriptionStatus: 'active',
        planType: 'monthly',
        isOnTrial: true,
        trialEndDate: new Date('2024-02-01'),
        subscriptionStartDate: new Date('2024-01-01'),
        subscriptionEndDate: new Date('2024-02-01'),
      })

      const mockSession = {
        user: { email: mockUser.email },
        expires: new Date().toISOString(),
      }

      const mockUsageStats = {
        wordsProcessed: 5000,
        documentsCount: 25,
        timeSaved: 120,
      }

      const mockDocuments = [
        { wordCount: 100, createdAt: new Date('2024-01-15') },
        { wordCount: 200, createdAt: new Date('2024-01-20') },
      ]

      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.usageStats.findFirst.mockResolvedValue(mockUsageStats as any)
      mockPrisma.document.findMany.mockResolvedValue(mockDocuments as any)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.subscription.id).toBe('sub_123')
      expect(data.subscription.status).toBe('active')
      expect(data.subscription.plan).toBe('monthly')
      expect(data.subscription.isOnTrial).toBe(true)
      expect(data.usage.wordsUsedThisMonth).toBe(5000)
      expect(data.usage.documentsProcessed).toBe(25)
      expect(data.usage.timeSaved).toBe(120)
    })

    test('returns 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    test('returns 404 for non-existent user', async () => {
      const mockSession = {
        user: { email: 'nonexistent@example.com' },
        expires: new Date().toISOString(),
      }

      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    test('calculates accurate monthly usage from documents', async () => {
      const mockUser = createMockUser()
      const mockSession = {
        user: { email: mockUser.email },
        expires: new Date().toISOString(),
      }

      // Mock no usage stats but some documents
      const currentDate = new Date()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999)

      const mockDocuments = [
        { wordCount: 500, createdAt: new Date() },
        { wordCount: 300, createdAt: new Date() },
        { wordCount: 200, createdAt: new Date() },
      ]

      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.usageStats.findFirst.mockResolvedValue(null)
      mockPrisma.document.findMany.mockResolvedValue(mockDocuments as any)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.usage.wordsUsedThisMonth).toBe(1000) // Sum of document word counts

      // Verify correct date range was used
      expect(mockPrisma.document.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          createdAt: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        select: {
          wordCount: true,
          createdAt: true,
        },
      })
    })

    test('handles user with no subscription', async () => {
      const mockUser = createMockUser({
        subscriptionId: null,
        subscriptionStatus: null,
        planType: null,
        isOnTrial: false,
      })

      const mockSession = {
        user: { email: mockUser.email },
        expires: new Date().toISOString(),
      }

      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.usageStats.findFirst.mockResolvedValue(null)
      mockPrisma.document.findMany.mockResolvedValue([])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.subscription.id).toBeNull()
      expect(data.subscription.status).toBe('inactive')
      expect(data.subscription.plan).toBe('individual')
      expect(data.subscription.isOnTrial).toBe(false)
    })

    test('handles database errors gracefully', async () => {
      const mockSession = {
        user: { email: 'test@example.com' },
        expires: new Date().toISOString(),
      }

      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    test('calculates usage with both stats and documents', async () => {
      const mockUser = createMockUser()
      const mockSession = {
        user: { email: mockUser.email },
        expires: new Date().toISOString(),
      }

      const mockUsageStats = {
        wordsProcessed: 3000,
        documentsCount: 15,
        timeSaved: 60,
      }

      const mockDocuments = [
        { wordCount: 400, createdAt: new Date() },
        { wordCount: 600, createdAt: new Date() },
      ]

      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.usageStats.findFirst.mockResolvedValue(mockUsageStats as any)
      mockPrisma.document.findMany.mockResolvedValue(mockDocuments as any)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      // Should use the higher of the two counts (actual documents vs stats)
      expect(data.usage.wordsUsedThisMonth).toBeGreaterThanOrEqual(1000)
    })

    test('returns correct trial information', async () => {
      const trialEndDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      const mockUser = createMockUser({
        isOnTrial: true,
        trialStartDate: new Date(),
        trialEndDate,
      })

      const mockSession = {
        user: { email: mockUser.email },
        expires: new Date().toISOString(),
      }

      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.usageStats.findFirst.mockResolvedValue(null)
      mockPrisma.document.findMany.mockResolvedValue([])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.subscription.isOnTrial).toBe(true)
      expect(data.subscription.trialEndDate).toBe(trialEndDate.toISOString())
    })
  })
})
