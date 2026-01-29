import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CartSidebar.css';

const CartSidebar = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = () => {
      const cart = localStorage.getItem('cart');
      if (cart) {
        try {
          const parsedCart = JSON.parse(cart);
          setCartItems(parsedCart.items || []);
          setSubtotal(parsedCart.total || 0);
        } catch (e) {
          console.error('Error parsing cart:', e);
          setCartItems([]);
          setSubtotal(0);
        }
      } else {
        setCartItems([]);
        setSubtotal(0);
      }
    };

    // Load cart when sidebar opens
    if (isOpen) {
      loadCart();
    }

    // Listen for cart updates
    const handleCartUpdate = (event) => {
      if (event.detail) {
        setCartItems(event.detail.items || []);
        setSubtotal(event.detail.total || 0);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [isOpen]);

  const removeItem = (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    localStorage.setItem('cart', JSON.stringify({
      items: updatedItems,
      total: newTotal
    }));
    
    setCartItems(updatedItems);
    setSubtotal(newTotal);
    
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { items: updatedItems, total: newTotal } 
    }));
  };

  return (
    <>
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-sidebar-header">
          <h3>Cart</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close cart">
            &times;
          </button>
        </div>
        
        <div className="cart-sidebar-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <img src="/logo.png" alt={item.name} />
                  </div>
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p>{item.quantity} × ${item.price.toFixed(2)}</p>
                  </div>
                  <button 
                    className="cart-item-remove"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <div className="cart-subtotal">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
        
        <div className="cart-sidebar-footer">
          <Link 
            to="/cart" 
            className="view-cart-btn"
            onClick={onClose}
          >
            View Cart
          </Link>
          <Link 
            to="/checkout" 
            className="checkout-btn"
            onClick={onClose}
          >
            Checkout
          </Link>
        </div>
      </div>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
    </>
  );
};

export default CartSidebar;
