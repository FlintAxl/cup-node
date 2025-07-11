function orderItem(itemId) {
  const userId = JSON.parse(sessionStorage.getItem('userId'));
  const payload = {
    customer_id: userId,
    items: [{ item_id: itemId, quantity: 1 }]
  };

  $.ajax({
    method: 'POST',
    url: '/api/v1/order',
    contentType: 'application/json',
    data: JSON.stringify(payload),
    success: function (data) {
      Swal.fire({
        icon: 'success',
        text: `Order placed! Order ID: ${data.orderId}`,
        position: 'bottom-right',
        timer: 1500,
        showConfirmButton: false
      });
    },
    error: function (err) {
      console.error(err);
      Swal.fire({ icon: 'error', text: 'Failed to order item.' });
    }
    
  });
}


