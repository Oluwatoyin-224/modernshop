import { describe, it, expect } from 'vitest'
import { validateCheckoutForm } from '../pages/CheckoutPage'

describe('validateCheckoutForm', () => {
  it('returns no errors for valid form', () => {
    const errors = validateCheckoutForm({
      customer_name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1 555 123 4567',
      address: '123 Main Street, Apartment 4B, New York, NY 10001',
    })
    expect(Object.keys(errors)).toHaveLength(0)
  })

  it('requires customer name', () => {
    const errors = validateCheckoutForm({
      customer_name: '',
      email: 'jane@example.com',
      phone: '555-1234',
      address: '123 Main Street, New York',
    })
    expect(errors.customer_name).toBe('Full name is required')
  })

  it('requires email', () => {
    const errors = validateCheckoutForm({
      customer_name: 'Jane',
      email: '',
      phone: '555-1234',
      address: '123 Main Street, New York',
    })
    expect(errors.email).toBe('Email is required')
  })

  it('validates email format', () => {
    const errors = validateCheckoutForm({
      customer_name: 'Jane',
      email: 'not-an-email',
      phone: '555-1234',
      address: '123 Main Street, New York',
    })
    expect(errors.email).toBe('Please enter a valid email address')
  })

  it('requires phone number', () => {
    const errors = validateCheckoutForm({
      customer_name: 'Jane',
      email: 'jane@example.com',
      phone: '',
      address: '123 Main Street, New York',
    })
    expect(errors.phone).toBe('Phone number is required')
  })

  it('validates phone has enough digits', () => {
    const errors = validateCheckoutForm({
      customer_name: 'Jane',
      email: 'jane@example.com',
      phone: '123',
      address: '123 Main Street, New York',
    })
    expect(errors.phone).toBe('Please enter a valid phone number')
  })

  it('requires address', () => {
    const errors = validateCheckoutForm({
      customer_name: 'Jane',
      email: 'jane@example.com',
      phone: '555-1234',
      address: '',
    })
    expect(errors.address).toBe('Delivery address is required')
  })

  it('requires a complete address', () => {
    const errors = validateCheckoutForm({
      customer_name: 'Jane',
      email: 'jane@example.com',
      phone: '555-1234',
      address: 'Short',
    })
    expect(errors.address).toBe('Please enter a complete delivery address')
  })

  it('returns multiple errors for empty form', () => {
    const errors = validateCheckoutForm({
      customer_name: '',
      email: '',
      phone: '',
      address: '',
    })
    expect(Object.keys(errors)).toHaveLength(4)
  })
})
