import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/cart-utils'

interface CheckoutForm {
  customer_name: string
  email: string
  phone: string
  address: string
}

interface FormErrors {
  customer_name?: string
  email?: string
  phone?: string
  address?: string
}

export function validateCheckoutForm(form: CheckoutForm): FormErrors {
  const errors: FormErrors = {}

  if (!form.customer_name.trim()) {
    errors.customer_name = 'Full name is required'
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required'
  } else if (form.phone.replace(/\D/g, '').length < 7) {
    errors.phone = 'Please enter a valid phone number'
  }

  if (!form.address.trim()) {
    errors.address = 'Delivery address is required'
  } else if (form.address.trim().length < 10) {
    errors.address = 'Please enter a complete delivery address'
  }

  return errors
}

export default function CheckoutPage() {
  const { items, subtotal, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<CheckoutForm>({
    customer_name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleChange = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const validationErrors = validateCheckoutForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (items.length === 0) {
      setSubmitError('Your cart is empty. Add products before checking out.')
      return
    }

    setSubmitting(true)

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: form.customer_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          total: total,
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Send confirmation email via edge function (best-effort, non-blocking)
      try {
        const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-confirmation-email`
        await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            orderId: orderData.id,
            email: form.email.trim(),
            customerName: form.customer_name.trim(),
            items: items.map((item) => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
            })),
            total: total,
          }),
        })
      } catch {
        // Email is best-effort; order was still saved successfully
      }

      clearCart()
      navigate(`/order-success/${orderData.id}`)
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? `Failed to place order: ${err.message}`
          : 'Failed to place order. Please try again.'
      )
      setSubmitting(false)
    }
  }

  if (items.length === 0 && !submitting) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Add some products before proceeding to checkout.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to shop
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {user && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 text-sm text-primary-800">
              Signed in as {user.email}. Your details will be used for this order.
            </div>
          )}

          <div>
            <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-error-500">*</span>
            </label>
            <input
              id="customer_name"
              type="text"
              className={`input-field ${errors.customer_name ? 'input-error' : ''}`}
              value={form.customer_name}
              onChange={(e) => handleChange('customer_name', e.target.value)}
              aria-invalid={!!errors.customer_name}
              aria-describedby={errors.customer_name ? 'customer_name-error' : undefined}
            />
            {errors.customer_name && (
              <p id="customer_name-error" className="mt-1 text-sm text-error-600">{errors.customer_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-error-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              className={`input-field ${errors.email ? 'input-error' : ''}`}
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-error-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-error-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              className={`input-field ${errors.phone ? 'input-error' : ''}`}
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <p id="phone-error" className="mt-1 text-sm text-error-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Address <span className="text-error-500">*</span>
            </label>
            <textarea
              id="address"
              rows={3}
              className={`input-field ${errors.address ? 'input-error' : ''}`}
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? 'address-error' : undefined}
            />
            {errors.address && (
              <p id="address-error" className="mt-1 text-sm text-error-600">{errors.address}</p>
            )}
          </div>

          {submitError && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-3 text-sm text-error-700">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full text-base py-3 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Placing Order...
              </>
            ) : (
              `Place Order (${formatPrice(total)})`
            )}
          </button>
        </form>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-3">
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} x {formatPrice(item.product.price)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
