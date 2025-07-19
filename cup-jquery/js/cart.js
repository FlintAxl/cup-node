function getCartKey() {
  const userId = JSON.parse(sessionStorage.getItem('userId'));
  return userId ? `cart_${userId}` : 'cart_guest';
}

function getCart() {
  const cart = localStorage.getItem(getCartKey());
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem(getCartKey(), JSON.stringify(cart));
}

function addToCart(item_id, pname, price) {

   const token = sessionStorage.getItem('access_token');
    const userId = sessionStorage.getItem('userId');
 if (!token || !userId) {
        Swal.fire({
            icon: 'warning',
            text: 'You must be logged in to access this page.',
            showConfirmButton: true
        }).then(() => {
            window.location.href = 'login.html';
        });
        return;
    }
  let cart = getCart();

  const existing = cart.find(item => item.item_id === item_id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ item_id, pname, price, quantity: 1 });
  }

  saveCart(cart);

Swal.fire({
  icon: 'success',
  title: 'Added to Cart!',
  text: `${pname} has been successfully added to your cart.`,
  position: 'center',
  timer: 1500,
  showConfirmButton: false,
  customClass: {
    popup: 'swal2-rounded swal2-cart-toast'
  }
});

}

function removeFromCart(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function changeQuantity(index, change) {
  let cart = getCart();
  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart(cart);
  renderCart();
}

function checkout() {
  const userId = JSON.parse(sessionStorage.getItem('userId'));
  const cart = getCart();

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
       Swal.fire({
      icon: 'success',
      title: 'Thank You for Ordering!',
      text: 'Your order has been placed successfully.',
      confirmButtonText: 'Continue Shopping',
      confirmButtonColor: '#8B5E3C', // optional: vintage brown
      background: '#fff8f0',         // optional: soft background
      color: '#5c4433'               // optional: deep brown text
    });
      localStorage.removeItem(getCartKey());
      renderCart();
    },
    error: function () {
      Swal.fire('Order failed');
    }
  });
}


function renderCart() {
  const cart = getCart();
  const tbody = $('#cart-table tbody');
  tbody.empty();

  if (cart.length === 0) {
    tbody.append('<tr><td colspan="5" class="text-center">Cart is empty.</td></tr>');
    return;
  }
  cart.forEach((item, index) => {
    tbody.append(`
      <tr>
        <td>${item.pname}</td>
        <td>₱${item.price.toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="changeQuantity(${index}, -1)">−</button>
          <span class="mx-2">${item.quantity}</span>
          <button class="btn btn-sm btn-secondary" onclick="changeQuantity(${index}, 1)">+</button>
        </td>
        <td>₱${(item.price * item.quantity).toFixed(2)}</td>
        <td><button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">Remove</button></td>
      </tr>
    `);
  });
}

$(document).ready(renderCart);
