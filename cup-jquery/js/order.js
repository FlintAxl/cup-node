const url = 'http://localhost:4000/';
const userId = sessionStorage.getItem('userId');

$(document).ready(function () {
  if (!userId) {
    Swal.fire("Unauthorized", "User not logged in", "error");
    return;
  }

  $('#customerOrdersTable').DataTable({
    ajax: {
      url: `${url}api/v1/my-orders/${userId}`,
      dataSrc: 'data'
    },
    columns: [
      { data: 'order_id' },
      { data: 'items' },
      {
        data: 'total_price',
        render: function (data) {
          return '₱' + parseFloat(data).toFixed(2);
        }
      },
      { data: 'status' },
      {
        data: 'date_placed',
        render: function (data) {
          return new Date(data).toLocaleString();
        }
      },
      {
        data: null,
        render: function (data) {
          if (data.status === 'pending') {
            return `<button onclick="cancelOrder(${data.order_id})">Cancel</button>`;
          }
          return '';
        }
      }
    ]
  });
});

function cancelOrder(orderId) {
  Swal.fire({
    title: 'Cancel this order?',
    text: "This action cannot be undone.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, cancel it'
  }).then(result => {
    if (result.isConfirmed) {
      $.ajax({
        method: 'PATCH',
        url: `${url}api/v1/cancel-order`,
        contentType: 'application/json',
        data: JSON.stringify({ order_id: orderId }),
        success: function () {
          Swal.fire('Cancelled', 'Your order was cancelled', 'success');
          $('#customerOrdersTable').DataTable().ajax.reload();
        },
        error: function () {
          Swal.fire('Error', 'Failed to cancel order', 'error');
        }
      });
    }
  });
}
