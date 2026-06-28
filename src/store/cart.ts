import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (productId: string, size?: string) => void
  updateQuantity: (productId: string, size: string | undefined, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

const itemKey = (productId: string, size?: string) => `${productId}__${size ?? 'nosize'}`

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const key = itemKey(item.productId, item.size)
          const existing = state.items.find(
            (i) => itemKey(i.productId, i.size) === key
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.productId, i.size) === key
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        })
      },

      removeItem: (productId, size) => {
        const key = itemKey(productId, size)
        set((state) => ({
          items: state.items.filter((i) => itemKey(i.productId, i.size) !== key),
        }))
      },

      updateQuantity: (productId, size, quantity) => {
        const key = itemKey(productId, size)
        if (quantity <= 0) {
          set((state) => ({
            items: state.items.filter((i) => itemKey(i.productId, i.size) !== key),
          }))
        } else {
          set((state) => ({
            items: state.items.map((i) =>
              itemKey(i.productId, i.size) === key ? { ...i, quantity } : i
            ),
          }))
        }
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'sashwears-cart', partialize: (s) => ({ items: s.items }) }
  )
)
