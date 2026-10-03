import { describe, it, expect } from 'vitest'
import {
  calculateSubtotal,
  calculateTotal,
  getItemCount,
  formatPrice,
} from '../lib/cart-utils'
import type { CartItem, Product } from '../types'

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Test Product',
  description: 'A test product',
  price: 10.0,
  image_url: 'https://example.com/image.jpg',
  created_at: '2024-01-01T00:00:00Z',
}

const mockProduct2: Product = {
  id: 'prod-2',
  name: 'Test Product 2',
  description: 'Another test product',
  price: 25.5,
  image_url: 'https://example.com/image2.jpg',
  created_at: '2024-01-01T00:00:00Z',
}

describe('cart-utils', () => {
  describe('calculateSubtotal', () => {
    it('returns 0 for empty cart', () => {
      expect(calculateSubtotal([])).toBe(0)
    })

    it('calculates subtotal for single item', () => {
      const items: CartItem[] = [{ product: mockProduct, quantity: 3 }]
      expect(calculateSubtotal(items)).toBe(30.0)
    })

    it('calculates subtotal for multiple items', () => {
      const items: CartItem[] = [
        { product: mockProduct, quantity: 2 },
        { product: mockProduct2, quantity: 3 },
      ]
      expect(calculateSubtotal(items)).toBe(96.5)
    })
  })

  describe('calculateTotal', () => {
    it('returns same as subtotal (no extra fees)', () => {
      const items: CartItem[] = [{ product: mockProduct, quantity: 2 }]
      expect(calculateTotal(items)).toBe(calculateSubtotal(items))
    })
  })

  describe('getItemCount', () => {
    it('returns 0 for empty cart', () => {
      expect(getItemCount([])).toBe(0)
    })

    it('sums quantities across items', () => {
      const items: CartItem[] = [
        { product: mockProduct, quantity: 2 },
        { product: mockProduct2, quantity: 3 },
      ]
      expect(getItemCount(items)).toBe(5)
    })
  })

  describe('formatPrice', () => {
    it('formats price as USD currency', () => {
      expect(formatPrice(10.0)).toBe('$10.00')
    })

    it('formats decimal prices', () => {
      expect(formatPrice(25.5)).toBe('$25.50')
    })

    it('formats large prices', () => {
      expect(formatPrice(1499.99)).toBe('$1,499.99')
    })
  })
})
