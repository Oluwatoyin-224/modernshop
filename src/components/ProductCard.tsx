import { Plus } from 'lucide-react'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/cart-utils'

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow group">
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-base">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-1 flex-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-primary-700">{formatPrice(product.price)}</span>
          <button
            onClick={() => addToCart(product)}
            className="btn-primary text-sm px-3 py-2 flex items-center gap-1"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
