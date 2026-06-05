import { persistentAtom } from '@nanostores/persistent';
import { computed } from 'nanostores';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

// We use persistentAtom so the cart survives page reloads
// Note: The value in persistentAtom is a string, so we need to encode/decode JSON
export const cartItems = persistentAtom<CartItem[]>(
  'cart',
  [],
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

export function addCartItem(item: Omit<CartItem, 'quantity'>) {
  const items: CartItem[] = cartItems.get();
  const existingItem = items.find((i: CartItem) => i.id === item.id);

  if (existingItem) {
    cartItems.set(
      items.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  } else {
    cartItems.set([...items, { ...item, quantity: 1 }]);
  }
}

export function removeCartItem(id: string) {
  const items: CartItem[] = cartItems.get();
  cartItems.set(items.filter((i: CartItem) => i.id !== id));
}

export function updateCartItemQuantity(id: string, quantity: number) {
  const items: CartItem[] = cartItems.get();
  if (quantity <= 0) {
    removeCartItem(id);
    return;
  }
  cartItems.set(
    items.map((i: CartItem) => (i.id === id ? { ...i, quantity } : i))
  );
}

export function clearCart() {
  cartItems.set([]);
}

export const isCartOpen = persistentAtom<boolean>('isCartOpen', false, {
  encode: (val) => (val ? 'true' : 'false'),
  decode: (val) => val === 'true',
});

// Computed values
export const cartTotal = computed(cartItems, (items) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0)
);

export const cartQuantity = computed(cartItems, (items) =>
  items.reduce((total, item) => total + item.quantity, 0)
);
