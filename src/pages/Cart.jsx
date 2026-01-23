import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = localStorage.getItem('cart');
    if (cart) {
      try {
        const parsedCart = JSON.parse(cart);
        setCartItems(parsedCart.items || []);
      } catch (e) {
        console.error('Error parsing cart:', e);
        setCartItems([]);
      }
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify({
      items: updatedItems,
      total: newTotal
    }));
    
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { items: updatedItems, total: newTotal } 
    }));
  };

  const removeItem = (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify({
      items: updatedItems,
      total: newTotal
    }));
    
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { items: updatedItems, total: newTotal } 
    }));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleUpdateCart = () => {
    // Cart is already updated in real-time, this is just for UI feedback
    alert('Cart updated!');
  };

  const handleProceedToCheckout = () => {
    const total = calculateSubtotal();
    localStorage.setItem('cart', JSON.stringify({
      items: cartItems,
      total: total
    }));
    navigate('/checkout', { 
      state: { items: cartItems, total: total } 
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-wrapper">
        <AnnouncementBar />
        
        <section className="hero-section">
          <div className="hero-background-wrapper">
            <video src="/background.mp4" alt="OC MENA Festival" className="hero-background-video" autoPlay muted loop playsInline />
            <div className="hero-gradient-overlay"></div>
          </div>

          <TornPaperWrapper>
            <div className="cart-page">
              <h1 className="cart-title">Cart</h1>
              <div className="empty-cart">
                <p>Your cart is currently empty.</p>
                <button className="return-to-shop-btn" onClick={() => navigate('/tickets')}>
                  Return to shop
                </button>
              </div>
            </div>
          </TornPaperWrapper>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <video src="/background.mp4" alt="OC MENA Festival" className="hero-background-video" autoPlay muted loop playsInline />
          <div className="hero-gradient-overlay"></div>
        </div>

        <TornPaperWrapper>
          <div className="cart-page">
            <h1 className="cart-title">Cart</h1>
            
            <div className="cart-table-wrapper">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th className="remove-col"></th>
                    <th className="image-col"></th>
                    <th className="product-col">Product</th>
                    <th className="price-col">Price</th>
                    <th className="quantity-col">Quantity</th>
                    <th className="subtotal-col">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td className="remove-col">
                        <button 
                          className="remove-item-btn"
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                        >
                          ×
                        </button>
                      </td>
                      <td className="image-col">
                        <img src="/logo.png" alt={item.name} className="cart-item-image" />
                      </td>
                      <td className="product-col">{item.name}</td>
                      <td className="price-col">${item.price.toFixed(2)}</td>
                      <td className="quantity-col">
                        <input 
                          type="number" 
                          min="1" 
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="quantity-input"
                        />
                      </td>
                      <td className="subtotal-col">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cart-actions">
              <div className="coupon-section">
                <input 
                  type="text" 
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="coupon-input"
                />
                <button className="apply-coupon-btn">Apply coupon</button>
              </div>
              <button className="update-cart-btn" onClick={handleUpdateCart}>Update cart</button>
            </div>

            <div className="cart-totals-section">
              <h2 className="cart-totals-title">Cart totals</h2>
              
              <div className="cart-totals-table">
                <div className="totals-row">
                  <span className="totals-label">Subtotal</span>
                  <span className="totals-value">${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                <div className="totals-row shipping-row">
                  <span className="totals-label">Shipping</span>
                  <div className="shipping-info">
                    <p>Free shipping</p>
                    <p className="shipping-location">Shipping to <strong>CA</strong>.</p>
                    <button className="change-address-btn">Change address</button>
                  </div>
                </div>
                
                <div className="totals-row total-row">
                  <span className="totals-label">Total</span>
                  <span className="totals-value total-amount">${calculateSubtotal().toFixed(2)}</span>
                </div>
              </div>

              <button className="proceed-checkout-btn" onClick={handleProceedToCheckout}>
                Proceed to checkout
              </button>

              <div className="payment-methods">
                <div className="payment-method-item">
                  <span className="gpay-badge">G Pay</span>
                  <span className="visa-badge">VISA</span>
                  <span className="card-number">•••• 9978</span>
                </div>
                <div className="payment-method-item link-pay">
                  <span className="link-badge">⊙ link</span>
                  <span className="visa-badge">VISA</span>
                  <span className="card-number">9978</span>
                </div>
              </div>
            </div>
          </div>
        </TornPaperWrapper>
      </section>

      <Footer />
    </div>
  );
};

export default Cart;
