function addToCart(item_id, pname, price) {
  let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

  const existing = cart.find(item => item.item_id === item_id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ item_id, pname, price, quantity: 1 });
  }

  sessionStorage.setItem('cart', JSON.stringify(cart));

  Swal.fire({
    icon: 'success',
    text: `${pname} added to cart.`,
    position: 'bottom-end',
    timer: 1200,
    showConfirmButton: false
  });
}


function removeFromCart(index) {
      let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
      cart.splice(index, 1);
      sessionStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    }
    function changeQuantity(index, change) {
  let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1); // remove if quantity is zero
  }

  sessionStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

    function checkout() {
      const userId = JSON.parse(sessionStorage.getItem('userId'));
      const cart = JSON.parse(sessionStorage.getItem('cart')) || [];

      if (!userId) return Swal.fire('Login required');
      if (!cart.length) return Swal.fire('Cart is empty');

      const payload = {
        customer_id: userId,
        items: cart.map(c => ({ item_id: c.item_id, quantity: c.quantity }))
      };

      $.ajax({
        method: 'POST',
        url: '/api/v1/order',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function (data) {
          Swal.fire('Order placed! Order ID: ' + data.orderId);
          sessionStorage.removeItem('cart');
          renderCart();
        },
        error: function () {
          Swal.fire('Order failed');
        }
      });
    }

