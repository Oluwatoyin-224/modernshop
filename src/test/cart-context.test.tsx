import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from '../context/CartContext'
import type { Product } from '../types'

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
  description: 'Another product',
  price: 20.0,
  image_url: 'https://example.com/image2.jpg',
  created_at: '2024-01-01T00:00:00Z',
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.items).toHaveLength(0)
    expect(result.current.itemCount).toBe(0)
    expect(result.current.subtotal).toBe(0)
  })

  it('adds a product to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addToCart(mockProduct)
    })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].product.id).toBe('prod-1')
    expect(result.current.items[0].quantity).toBe(1)
    expect(result.current.itemCount).toBe(1)
  })

  it('increments quantity when adding same product', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addToCart(mockProduct)
      result.current.addToCart(mockProduct)
    })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
    expect(result.current.itemCount).toBe(2)
  })

  it('removes a product from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addToCart(mockProduct)
      result.current.addToCart(mockProduct2)
      result.current.removeFromCart('prod-1')
    })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].product.id).toBe('prod-2')
  })

  it('increases quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addToCart(mockProduct)
      result.current.increaseQuantity('prod-1')
    })
    expect(result.current.items[0].quantity).toBe(2)
  })

  it('decreases quantity and removes when reaching 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addToCart(mockProduct)
      result.current.addToCart(mockProduct)
      result.current.decreaseQuantity('prod-1')
    })
    expect(result.current.items[0].quantity).toBe(1)

    act(() => {
      result.current.decreaseQuantity('prod-1')
    })
    expect(result.current.items).toHaveLength(0)
  })

  it('calculates subtotal correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addToCart(mockProduct)
      result.current.addToCart(mockProduct)
      result.current.addToCart(mockProduct2)
    })
    expect(result.current.subtotal).toBe(40.0)
    expect(result.current.total).toBe(40.0)
  })

  it('clears the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addToCart(mockProduct)
      result.current.clearCart()
    })
    expect(result.current.items).toHaveLength(0)
    expect(result.current.itemCount).toBe(0)
  })
})
