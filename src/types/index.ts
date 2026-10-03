export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface OrderItemInput {
  product_id: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  customer_name: string
  email: string
  phone: string
  address: string
  total: number
  status: string
  created_at: string
}
