import React from 'react';
import './CartModal.css';

const CartModal = ({ isOpen, onClose, cartItems }) => {
  if (!isOpen) return null;

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-modal-header">
          <h3>Shopping Cart</h3>
          <button className="cart-modal-close" onClick={onClose} aria-label="Close cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="cart-modal-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <h4>Your cart is empty</h4>
              <p>Add some tickets to get started!</p>
              <button className="btn-primary" onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map((item, index) => (
                  <div key={index} className="cart-item">
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p>{item.description}</p>
                      <div className="cart-item-price">${item.price}</div>
                    </div>
                    <div className="cart-item-quantity">
                      <div className="quantity-controls">
                        <button className="quantity-btn">-</button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button className="quantity-btn">+</button>
                      </div>
                      <div className="cart-item-total">${item.price * item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${totalPrice}</span>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <span>${(totalPrice * 0.08).toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${(totalPrice * 1.08).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="cart-actions">
                <button className="btn-secondary" onClick={onClose}>
                  Continue Shopping
                </button>
                <button className="btn-primary">
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
