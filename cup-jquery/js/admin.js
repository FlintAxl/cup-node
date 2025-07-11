const url = 'http://localhost:4000/';

$(document).ready(function () {
  initUsersTable();
  initOrdersTable();
});


function initUsersTable() {
  $('#usersTable').DataTable({
    ajax: {
      url: `${url}api/v1/users`,
      dataSrc: 'data'
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


