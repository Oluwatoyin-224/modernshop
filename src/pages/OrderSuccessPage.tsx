import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2, Package } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/cart-utils'
import type { Order } from '../types'

interface OrderItemRow {
  id: string
  quantity: number
  price: number
  product_id: string
  products: { name: string }[]
}

export default function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setError('No order ID provided.')
        setLoading(false)
        return
      }

      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle()

      if (orderErr || !orderData) {
        setError('Order not found.')
        setLoading(false)
        return
      }

      setOrder(orderData as Order)

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('id, quantity, price, product_id, products(name)')
        .eq('order_id', orderId)

      setOrderItems((itemsData as unknown as OrderItemRow[]) ?? [])
      setLoading(false)
    }
    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto" />
        <p className="mt-4 text-gray-600">Loading your order...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Shop
        </button>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mb-4">
          <CheckCircle2 className="w-8 h-8 text-success-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Confirmed!</h1>
        <p className="mt-2 text-gray-600">
          Thank you for your purchase. A confirmation email has been sent to{' '}
          <span className="font-medium text-gray-900">{order.email}</span>.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Package className="w-5 h-5 text-primary-600" />
          <span className="font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Customer</span>
            <span className="font-medium text-gray-900">{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-gray-900">{order.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone</span>
            <span className="font-medium text-gray-900">{order.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Address</span>
            <span className="font-medium text-gray-900 text-right max-w-xs">{order.address}</span>
          </div>
        </div>

        {orderItems.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Items Ordered</h3>
            <div className="space-y-2">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.products?.[0]?.name ?? 'Product'} x {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-4 flex justify-between text-lg font-bold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="text-center mt-6">
        <button onClick={() => navigate('/')} className="btn-primary">
          Continue Shopping
        </button>
      </div>
    </div>
  )
}
