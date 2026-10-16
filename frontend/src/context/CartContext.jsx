import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultCart = {
  cartItems: [],
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  cartCount: 0,
  cartSubtotal: 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
  toast: null,
  showToast: () => {},
};

const CartContext = createContext(defaultCart);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('fouz_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('fouz_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const addToCart = (product, variant = null, quantity = 1, openDrawer = true) => {
    setCartItems((prevItems) => {
      const productId = product.id;
      const variantId = variant ? variant.id : null;
      const variantTitle = variant ? variant.title : (product.size_variant || '100ml');
      const unitPrice = variant ? parseFloat(variant.price) : parseFloat(product.price);
      const stock = variant ? variant.stock : product.stock;
      const image = product.image || product.main_image_url || '/fouz_logo.jpg';

      const existingIndex = prevItems.findIndex(
        (item) => item.product_id === productId && item.variant_id === variantId
      );

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        const newQty = currentQty + quantity;
        if (newQty > stock) {
          showToast(`Only ${stock} bottles available in stock.`, 'error');
          return prevItems;
        }
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        showToast(`Updated quantity for "${product.name}"`);
        return updated;
      } else {
        if (quantity > stock) {
          showToast(`Only ${stock} bottles available in stock.`, 'error');
          return prevItems;
        }
        showToast(`Added "${product.name}" to cart`);
        return [
          ...prevItems,
          {
            product_id: productId,
            variant_id: variantId,
            name: product.name,
            brand: product.brand_name || (product.brand ? product.brand.name : ''),
            variant_title: variantTitle,
            price: unitPrice,
            image: image,
            quantity: quantity,
            stock: stock,
            slug: product.slug,
          },
        ];
      }
    });

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const updateQuantity = (productId, variantId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product_id === productId && item.variant_id === variantId) {
          if (newQty > item.stock) {
            showToast(`Maximum ${item.stock} in stock`, 'error');
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId, variantId) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product_id === productId && item.variant_id === variantId)
      )
    );
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('fouz_cart');
    } catch {}
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        toast,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  return ctx && ctx.addToCart ? ctx : defaultCart;
};
