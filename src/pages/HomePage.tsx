import ProductGrid from '../components/ProductGrid'

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-50 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Welcome to Modern Shop
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Discover thoughtfully designed products for everyday life.
            Quality you can feel, prices you'll love.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Products</h2>
        <ProductGrid />
      </section>
    </div>
  )
}
