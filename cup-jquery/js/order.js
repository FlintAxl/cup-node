// const url = 'http://localhost:4000/';
const userId = sessionStorage.getItem('userId');

$(document).ready(function () {
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
      return `<button class="btn btn-sm btn-danger" onclick="cancelOrder(${data.order_id})">Cancel</button>`;
    } else if (data.status === 'shipped') {
      return `<button class="btn btn-sm btn-success" onclick="markAsReceived(${data.order_id})">Mark as Received</button>`;
    } else if (data.status === 'received') {
      return `<button class="btn btn-sm btn-primary" onclick="openReviewModal(${data.order_id})">Leave a Review</button>`;
    }

    return '<span class="text-muted">No actions</span>';
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

function markAsReceived(orderId) {
  Swal.fire({
    title: 'Confirm Receipt?',
    text: "Mark this order as received?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, I received it'
  }).then(result => {
    if (result.isConfirmed) {
      $.ajax({
        method: 'PATCH',
        url: `${url}api/v1/orders/update-status`,
        contentType: 'application/json',
        data: JSON.stringify({ order_id: orderId, status: 'received' }),
        success: function () {
          Swal.fire('Thank you!', 'Order marked as received', 'success');
          $('#customerOrdersTable').DataTable().ajax.reload();
        },
        error: function () {
          Swal.fire('Error', 'Failed to update order status', 'error');
        }
      });
    }
  });
}

function openReviewModal(orderId) {
  $.ajax({
    url: `${url}api/v1/order-items/${orderId}?user_id=${userId}`,
    method: 'GET',
    success: function (res) {
      const items = res.data;
      let html = '';

      items.forEach(item => {
        const hasReview = item.rating !== null && item.comment !== null;

        html += `
          <div class="form-group border rounded p-3 mb-3">
            <h5>${item.pname}</h5>
            <input type="hidden" class="item-id" value="${item.item_id}" />
            <input type="hidden" class="order-id" value="${orderId}" />
            <input type="hidden" class="user-id" value="${userId}" />
            
            ${hasReview ? `
              <p><strong>Your Rating:</strong> ${item.rating}</p>
              <p><strong>Your Comment:</strong> ${item.comment}</p>
              <div class="alert alert-info">You have already reviewed this item.</div>
            ` : `
              <label for="rating-${item.item_id}">Rating (1-5)</label>
              <input type="number" id="rating-${item.item_id}" class="form-control rating-input" min="1" max="5" required>

              <label for="comment-${item.item_id}">Comment</label>
              <textarea id="comment-${item.item_id}" class="form-control comment-input" required></textarea>
            `}
          </div>
        `;
      });

      $('#reviewModalBody').html(html);

      $('#submitReviewBtn').off('click').on('click', function () {
        const reviews = [];

        $('#reviewModalBody .form-group').each(function () {
          // Skip items with existing reviews
          if ($(this).find('.rating-input').length === 0) return;

          const item_id = $(this).find('.item-id').val();
          const order_id = $(this).find('.order-id').val();
          const user_id = $(this).find('.user-id').val();
          const rating = $(this).find('.rating-input').val();
          const comment = $(this).find('.comment-input').val();

          if (!rating || !comment) return;

          reviews.push({
            item_id,
            order_id,
            user_id,
            rating,
            comment
          });
        });

        if (reviews.length === 0) {
          return Swal.fire('Notice', 'No new reviews to submit.', 'info');
        }

        $.ajax({
          url: `${url}api/v1/reviews`,
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ reviews }),
          success: function () {
            Swal.fire('Thank you!', 'Your reviews have been submitted.', 'success');
            $('#reviewModal').modal('hide');
            $('#customerOrdersTable').DataTable().ajax.reload();
          },
          error: function () {
            Swal.fire('Error', 'Failed to submit reviews.', 'error');
          }
        });
      });

      $('#reviewModal').modal('show');
    },
    error: function () {
      Swal.fire('Error', 'Failed to fetch order items.', 'error');
    }
  });
}
