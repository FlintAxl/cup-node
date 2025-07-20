// const url = 'http://localhost:4000/';

$(document).ready(function () {
  initUsersTable();
  initOrdersTable();
  initReviewsTable(); 
});


function initUsersTable() {
  $('#usersTable').DataTable({
    ajax: {
      url: `${url}api/v1/users`,
      dataSrc: 'data',
      headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('access_token') // 👈 ADD THIS
    },
    },
    columns: [
      { data: 'id' },
      { data: 'name' },
      { data: 'address' },
      { data: 'phone' },
      { data: 'email' },
      { data: 'role' },
      {
        data: 'is_active',
        render: data => (data == 1 ? 'Yes' : 'No')
      },
      { data: 'created_at' },
      {
        data: null,
        render: function (data) {
          const roleSelect = `
            <select onchange="updateRole(${data.id}, this.value)">
              <option value="admin" ${data.role === 'admin' ? 'selected' : ''}>admin</option>
              <option value="customer" ${data.role === 'customer' ? 'selected' : ''}>customer</option>
            </select>`;

          const actionButton = data.is_active == 1
            ? `<button onclick="deactivateUser(${data.id})">Deactivate</button>`
            : `<button onclick="activateUser(${data.id})">Activate</button>`;

          return `${roleSelect}<br>${actionButton}`;
        }
      }
    ]
  });
}

function updateRole(userId, role) {
  $.ajax({
    method: 'POST',
    url: `${url}api/v1/update-role`,
    headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('access_token') // 👈 ADD THIS
    },
    contentType: 'application/json',
    data: JSON.stringify({ userId, role }),
    success: function () {
      Swal.fire('Success', 'Role updated successfully', 'success');
      $('#usersTable').DataTable().ajax.reload();
    },
    error: function () {
      Swal.fire('Error', 'Failed to update role', 'error');
    }
  });
}

function deactivateUser(userId) {
  Swal.fire({
    title: 'Deactivate user?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, deactivate'
  }).then(result => {
    if (result.isConfirmed) {
      $.ajax({
        method: 'POST',
        url: `${url}api/v1/soft-delete`,
        headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('access_token') // 👈 ADD THIS
    },
        contentType: 'application/json',
        data: JSON.stringify({ userId }),
        success: function () {
          Swal.fire('Deactivated', 'User is now inactive', 'success');
          $('#usersTable').DataTable().ajax.reload();
        },
        error: function () {
          Swal.fire('Error', 'Failed to deactivate user', 'error');
        }
      });
    }
  });
}

function activateUser(userId) {
  Swal.fire({
    title: 'Reactivate user?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, reactivate'
  }).then(result => {
    if (result.isConfirmed) {
      $.ajax({
        method: 'POST',
        url: `${url}api/v1/activate`,
        headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('access_token') // 👈 ADD THIS
    },
        contentType: 'application/json',
        data: JSON.stringify({ userId }),
        success: function () {
          Swal.fire('Reactivated', 'User is now active', 'success');
          $('#usersTable').DataTable().ajax.reload();
        },
        error: function () {
          Swal.fire('Error', 'Failed to reactivate user', 'error');
        }
      });
    }
  });
}

function initOrdersTable() {
  $('#ordersTable').DataTable({
  ajax: {
    url: `${url}api/v1/orders/all`,
    dataSrc: 'data',
    headers: {
  Authorization: 'Bearer ' + sessionStorage.getItem('access_token')
}

  },

    columns: [
      { data: 'order_id' },
      { data: 'customer_name' },
      { data: 'items' },
      { data: 'total_amount', render: amount => `₱${parseFloat(amount).toFixed(2)}` },
      { data: 'date_placed', render: date => new Date(date).toLocaleString() },
      { data: 'status' },
      {
        data: null,
        render: function (data) {
          const isFinal = ['cancelled', 'received'].includes(data.status);
          const isShipped = data.status === 'shipped';

          let buttons = '';
          if (!isFinal && !isShipped) {
            buttons += `<button class="btn btn-sm btn-danger me-1" onclick="updateOrderStatus(${data.order_id}, 'cancelled')">Cancel</button>`;
          }
          if (data.status === 'pending') {
            buttons += `<button class="btn btn-sm btn-primary" onclick="updateOrderStatus(${data.order_id}, 'shipped')">Mark as Shipped</button>`;
          }
          return buttons || '-';
        }
      }
    ]
  });
}


function updateOrderStatus(orderId, newStatus) {
  $.ajax({
    url: `${url}api/v1/orders/update-status`,
    
    method: 'PATCH',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('access_token') // 👈 ADD THIS
    },
    data: JSON.stringify({ order_id: orderId, status: newStatus }),
    success: () => {
      Swal.fire('Updated', 'Order status updated', 'success');
      $('#ordersTable').DataTable().ajax.reload();
    },
    error: () => {
      
      Swal.fire('Error', 'Failed to update order status', 'error');
      $('#ordersTable').DataTable().ajax.reload();
    }
  });
}


// Initialize Reviews DataTable
function initReviewsTable() {
  $('#reviewsTable').DataTable({
    ajax: {
      url: `${url}api/v1/reviews/all`,
      dataSrc: 'data',
      headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('access_token') // 👈 ADD THIS
    },
    },
    columns: [
      { data: 'review_id' },
      { data: 'user_name' },
      { data: 'item_name' },
      { data: 'order_id' },
      { data: 'rating' },
      { data: 'comment' },
      { data: 'created_at', render: date => new Date(date).toLocaleString() },
      {
        data: null,
        render: function (data) {
          return `<button class="btn btn-sm btn-danger" onclick="deleteReview(${data.review_id})">
                    <i class="fas fa-trash"></i> Delete
                  </button>`;
        }
      }
    ]
  });
}

// Delete review function
function deleteReview(id) {
  Swal.fire({
    title: 'Delete this review?',
    text: 'This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it'
  }).then(result => {
    if (result.isConfirmed) {
      $.ajax({
        url: `${url}api/v1/reviews/${id}`,
        headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('access_token') // 👈 ADD THIS
    },
        method: 'DELETE',
        success: function () {
          Swal.fire('Deleted!', 'Review has been deleted.', 'success');
          $('#reviewsTable').DataTable().ajax.reload();
        },
        error: function () {
          Swal.fire('Error', 'Failed to delete review.', 'error');
        }
      });
    }
  });
}