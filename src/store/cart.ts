import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

// Maximum units of any single line item — prevents integer overflow in totals
const MAX_QUANTITY_PER_LINE = 10

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem:        (item: CartItem) => void
  removeItem:     (productId: string, size?: string) => void
  updateQuantity: (productId: string, size: string | undefined, quantity: number) => void
  clearCart:      () => void
  openCart:       () => void
  closeCart:      () => void
  getTotal:       () => number
  getItemCount:   () => number
}

const itemKey = (productId: string, size?: string) => `${productId}__${size ?? 'nosize'}`

// Clamp quantity to safe bounds
const clampQty = (n: number) => Math.min(Math.max(Math.floor(n), 1), MAX_QUANTITY_PER_LINE)

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items:  [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const key      = itemKey(item.productId, item.size)
          const existing = state.items.find(i => itemKey(i.productId, i.size) === key)

          if (existing) {
            return {
              items: state.items.map(i =>
                itemKey(i.productId, i.size) === key
                  ? { ...i, quantity: clampQty(i.quantity + item.quantity) }
                  : i
              ),
            }
          }

          return {
            items: [...state.items, { ...item, quantity: clampQty(item.quantity) }],
          }
        })
      },

      removeItem: (productId, size) => {
        const key = itemKey(productId, size)
        set(state => ({
          items: state.items.filter(i => itemKey(i.productId, i.size) !== key),
        }))
      },

      updateQuantity: (productId, size, quantity) => {
        const key = itemKey(productId, size)
        if (quantity <= 0) {
          set(state => ({
            items: state.items.filter(i => itemKey(i.productId, i.size) !== key),
          }))
        } else {
          set(state => ({
            items: state.items.map(i =>
              itemKey(i.productId, i.size) === key
                ? { ...i, quantity: clampQty(quantity) }
                : i
            ),
          }))
        }
      },

      clearCart:  () => set({ items: [] }),
      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),

      getTotal:     () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'sashwears-cart',
      // Only persist item identity + quantity — NOT price.
      // Prices are re-fetched from the product page on next visit, and
      // the server always re-verifies amounts against Paystack before creating an order.
      partialize: (s) => ({
        items: s.items.map(({ productId, title, size, quantity, imageUrl, slug }) => ({
          productId,
          title,
          size,
          quantity,
          imageUrl,
          slug,
          // price is intentionally omitted from localStorage; it will be 0
          // if restored from storage without a fresh product load.
          price: 0,
        })),
      }),
    }
  )
)
