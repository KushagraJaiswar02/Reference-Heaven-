import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createImageReference } from './createReference'

// Mock Supabase
const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockEq = vi.fn()
const mockFrom = vi.fn().mockReturnValue({
    insert: mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
            single: mockSingle
        })
    })
})

const mockGetUser = vi.fn()

vi.mock('@/utils/supabase/server', () => ({
    createClient: () => ({
        auth: {
            getUser: mockGetUser
        },
        from: mockFrom
    })
}))

// Mock Cache (revalidatePath)
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

// Mock Tagging helpers to avoid complex chains
vi.mock('../tagging/canonical', () => ({
    addCanonicalTagToImage: vi.fn().mockResolvedValue(true)
}))
vi.mock('../tagging/author', () => ({
    addAuthorTags: vi.fn().mockResolvedValue(true)
}))

describe('createImageReference', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should successfully create an image reference', async () => {
        // Arrange
        const mockUser = { id: 'test-user-id' }
        mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })

        const mockImage = { id: 'new-image-id', url: 'https://cdn.example.com/img.jpg' }
        mockSingle.mockResolvedValue({ data: mockImage, error: null })

        const inputData: any = {
            title: 'Test Image',
            topic: 'Testing',
            imageUrl: 'https://cdn.example.com/img.jpg',
            sourceType: 'uploaded_cdn',
            sourceMetadata: { public_id: '123' },
            colorPalette: ['#ffffff'],
            taggingData: { canonicalTagIds: [], authorTags: [] }
        }

        // Act
        const result = await createImageReference(inputData)

        // Assert
        expect(result).toEqual({ success: true, imageId: 'new-image-id' })
        expect(mockFrom).toHaveBeenCalledWith('images')
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Test Image',
            url: 'https://cdn.example.com/img.jpg',
            artist_id: 'test-user-id',
            source_type: 'uploaded_cdn'
        }))
    })

    it('should throw error if user is not authenticated', async () => {
        // Arrange
        mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

        const inputData: any = {
            title: 'Test',
            imageUrl: 'https://example.com/img.jpg'
        }

        // Act & Assert
        await expect(createImageReference(inputData)).rejects.toThrow('Unauthorized')
    })
})
