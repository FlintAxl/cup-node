$(document).ready(function () {
    // const url = 'http://localhost:4000/';
    const token = sessionStorage.getItem('access_token');
    const userId = sessionStorage.getItem('userId');
 

    const table = $('#itable').DataTable({
        ajax: {
            url: `${url}api/v1/items`,
            dataSrc: "data",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        },
        dom: 'Bfrtip',
        buttons: [
            'pdf', 'excel',
            {
                text: 'Add item',
                className: 'btn btn-primary',
                action: function () {
                    resetItemForm();
                    $('#itemModal').modal('show');
                }
            }
        ],
        columns: [
            { data: 'item_id' },
            {
                data: 'images',
                render: function (images) {
                    if (!images || images.length === 0) return 'No image';
                    return images.map(img => `<img src="${url}${img}" width="50" height="50" style="margin-right:5px;">`).join('');
                }
            },
            { data: 'pname' },
            { data: 'category_name', defaultContent: 'No Category' },
            { data: 'description' },
            { data: 'sell_price' },
            { data: 'cost_price' },
            { data: 'stock' },
            {
                data: null,
                render: function (data) {
                    return `
                        <a href="#" class="editBtn" data-id="${data.item_id}">
                            <i class="fas fa-edit" style="font-size:24px"></i>
                        </a>
                        <a href="#" class="deletebtn" data-id="${data.item_id}">
                            <i class="fas fa-trash-alt" style="font-size:24px; color:red"></i>
                        </a>
                    `;
                }
            }
        ],
    });

    function resetItemForm() {
        $('#iform')[0].reset();
        $('#itemId').remove();
        $('.itemImagePreview').remove();
        $('#img').val('');
        $('#itemSubmit').show();
        $('#itemUpdate').hide();
        $('#imagePreview').empty();
        // loadCategories(); -- removed from here
    }

    $('#itemModal').on('show.bs.modal', function () {
        loadCategories();
    });

    $("#itemSubmit").on('click', function (e) {
    e.preventDefault();

    if (!validateItemForm(false)) return; // validation for new item

    let form = $('#iform')[0];
    let formData = new FormData(form);

    $.ajax({
        method: "POST",
        url: `${url}api/v1/items`,
        data: formData,
        contentType: false,
        processData: false,
        headers: {
            Authorization: `Bearer ${token}`
        },
        success: function () {
            Swal.fire({
                icon: "success",
                text: "Item created successfully!",
                timer: 1000,
                showConfirmButton: false
            });
            $("#itemModal").modal("hide");
            table.ajax.reload();
        },
        error: function (error) {
            console.log(error);
            Swal.fire({
                icon: "error",
                text: error.responseJSON?.error || "Failed to save item."
            });
        }
    });
});

    // Fix for Add Item button that directly opens the modal from HTML
$('#openItemModal').on('click', function () {
    resetItemForm();
    $('#itemModal').modal('show');
});


   // Make sure this is outside DataTable initialization but still in $(document).ready
$(document).on('click', '.editBtn', function (e) {
    e.preventDefault();
    e.stopPropagation(); // Prevent parent click handlers from firing

    resetItemForm();

    const id = $(this).data('id');
    $('#itemSubmit').hide();
    $('#itemUpdate').show();

    $.ajax({
        method: "GET",
        url: `${url}api/v1/items/${id}`,
        dataType: "json",
        success: function (data) {
            const { result } = data;
            if (!result || result.length === 0) return;

            const item = result[0];
            $('#pname').val(item.pname);
            $('#desc').val(item.description);
            $('#sell').val(item.sell_price);
            $('#cost').val(item.cost_price);
            $('#stock').val(item.stock);
            $('<input>').attr({ type: 'hidden', id: 'itemId', name: 'item_id', value: id }).appendTo('#iform');

            loadCategories(function () {
                $('#category_id').val(item.category_id);
            });

            if (item.images && item.images.length > 0) {
                item.images.forEach((img) => {
                    $("#iform").append(`<img src="${url}${img}" width='100px' height='100px' style="margin:5px;" class="itemImagePreview" />`);
                });
            }

            $('#itemModal').modal('show');
        },
        error: function (error) {
            console.log(error);
            Swal.fire({ icon: "error", text: "Failed to fetch item details." });
        }
    });
});


    $("#itemUpdate").on('click', function (e) {
    e.preventDefault();

    if (!validateItemForm(true)) return; // validation for update

    const id = $('#itemId').val();
    let form = $('#iform')[0];
    let formData = new FormData(form);

    $.ajax({
        method: "PUT",
        url: `${url}api/v1/items/${id}`,
        data: formData,
        contentType: false,
        processData: false,
        headers: {
            Authorization: `Bearer ${token}`
        },
        success: function () {
            Swal.fire({
                icon: "success",
                text: "Item updated successfully!",
                timer: 1000,
                showConfirmButton: false
            });
            $('#itemModal').modal("hide");
            table.ajax.reload();
        },
        error: function (error) {
            console.log(error);
            Swal.fire({
                icon: "error",
                text: error.responseJSON?.error || "Failed to update item."
            });
        }
    });
});
    $('#itable tbody').on('click', '.deletebtn', function (e) {
        e.preventDefault();
        const id = $(this).data('id');
        const row = $(this).closest('tr');

        bootbox.confirm({
            message: "Do you want to delete this item?",
            buttons: {
                confirm: { label: 'Yes', className: 'btn-success' },
                cancel: { label: 'No', className: 'btn-danger' }
            },
            callback: function (result) {
                if (result) {
                    $.ajax({
                        method: "DELETE",
                        url: `${url}api/v1/items/${id}`,
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        success: function (data) {
                            table.row(row).remove().draw();
                            Swal.fire({
                                icon: "success",
                                text: data.message || "Item deleted"
                            });
                        },
                        error: function (error) {
                            console.log(error);
                            Swal.fire({ icon: "error", text: "Failed to delete item." });
                        }
                    });
                }
            }
        });
    });

    function loadCategories(callback = null) {
        $.ajax({
            url: `${url}api/v1/categories`,
            method: 'GET',
            success: function (response) {
                const dropdown = $('#category_id');
                dropdown.empty();
                dropdown.append('<option value="">-- Select Category --</option>');

                response.categories.forEach(category => {
                    dropdown.append(`<option value="${category.id}">${category.description}</option>`);
                });

                if (typeof callback === 'function') callback();
            },
            error: function (xhr, status, error) {
                console.error("Failed to load categories:", error);
            }
        });
    }
});


function showItemDetails(itemId) {
  $.get(`/api/v1/items/${itemId}/details`, function(res) {
    if (!res.success) return;

    const item = res.data;

    // --- Build carousel items ---
    let carouselHtml = '';
    if (item.images && item.images.length > 0) {
      carouselHtml = item.images.map((img, i) => `
        <div class="carousel-item ${i === 0 ? 'active' : ''}">
          <img src="/${img}" class="d-block w-100" style="max-height:300px;object-fit:cover;">
        </div>
      `).join('');
    } else {
      carouselHtml = `
        <div class="carousel-item active">
          <img src="/images/default.jpg" class="d-block w-100" style="max-height:300px;object-fit:cover;">
        </div>
      `;
    }

    $('#modalCarouselInner').html(carouselHtml);
    $('#modalItemName').text(item.pname);
$('#modalItemDescription').text(item.description || 'No description');
$('#modalItemPrice').text(item.sell_price);
$('#modalItemCategory').text(item.category_name || 'No category');




    // --- Build reviews ---
    let reviewsHtml = '';
    if (item.reviews && item.reviews.length > 0) {
      reviewsHtml = item.reviews.map(r => `
        <div class="border-bottom mb-2 pb-2">
          <strong>${r.reviewer_name || 'Anonymous'}</strong> – ⭐${r.rating}
          <p>${r.comment}</p>
        </div>
      `).join('');
    } else {
      reviewsHtml = `<p class="text-muted">No reviews yet.</p>`;
    }

    $('#modalReviews').html(reviewsHtml);

    // Finally show the modal
    $('#itemModal').modal('show');



    // Add to cart button
    // Add to Cart button
    let buttonHtml = '';
    if (item.stock > 0) {
    buttonHtml = `
        <button class="btn btn-primary w-100"
        onclick="addToCart(${item.item_id}, '${item.pname.replace(/'/g, "\\'")}', ${item.sell_price})">
        <i class="bi bi-cart-plus"></i> Add to Cart
        </button>
    `;
    } else {
    buttonHtml = `
        <button class="btn btn-secondary w-100" disabled>Out of Stock</button>
    `;
    }

    // Put the button inside the placeholder
    $('#modalAddToCart').html(buttonHtml);

  });
}


//load ng  items sa index.html
function renderItems(items) {
  $('#item-container').empty(); // clear current items

  if (!items || items.length === 0) {
    $('#item-container').html('<p>No items available.</p>');
    return;
  }

  items.forEach((item, index) => {
    const images = item.images.length > 0 ? item.images : ['images/default.jpg'];
    const carouselId = `carousel-${index}`;

    const carouselItems = images.map((img, i) => `
      <div class="carousel-item ${i === 0 ? 'active' : ''}">
        <img src="/${img}" alt="Item Image ${i + 1}">
      </div>
    `).join('');

    const button = item.stock > 0
      ? `<button onclick="event.stopPropagation(); addToCart(${item.item_id}, '${item.pname}', ${item.sell_price})">Add to Cart</button>`
      : `<button class="btn btn-secondary" disabled>Out of Stock</button>`;

    $('#item-container').append(`
      <div class="item-card" onclick="showItemDetails(${item.item_id})">
        <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-inner">${carouselItems}</div>
        </div>
        <p><strong>${item.pname || 'No Name'}</strong></p>
        <p>${item.description}</p>
        <p><strong>₱${item.sell_price}</strong></p>
        <p>Stock: ${item.stock}</p>
        ${button}
      </div>
    `);
  });
}

function filterItems(category) {
  if (category === 'All') {
    renderItems(allItems);
  } else {
    const filtered = allItems.filter(item => 
      item.category_name && item.category_name.toLowerCase() === category.toLowerCase()
    );
    renderItems(filtered);
  }
}

function validateItemForm(isUpdate = false) {
    let errors = [];

    const pname = $('#pname').val().trim();
    const desc = $('#desc').val().trim();
    const sellPrice = $('#sell').val().trim();
    const costPrice = $('#cost').val().trim();
    const stock = $('#stock').val().trim();
    const category = $('#category_id').val();
    const image = $('#img').val().trim();

    if (!pname) errors.push("Product name is required.");
    if (!desc) errors.push("Description is required.");

    if (!sellPrice || isNaN(sellPrice) || parseFloat(sellPrice) <= 0) {
        errors.push("Enter a valid selling price.");
    }
    if (!costPrice || isNaN(costPrice) || parseFloat(costPrice) <= 0) {
        errors.push("Enter a valid cost price.");
    }
    if (!stock || isNaN(stock) || !Number.isInteger(parseFloat(stock)) || parseInt(stock) < 0) {
        errors.push("Enter a valid stock quantity.");
    }

    if (!category) errors.push("Please select a category.");

    // Image required only when adding new item
    if (!isUpdate && !image) errors.push("Please upload an image.");

    if (errors.length > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            html: errors.join('<br>')
        });
        return false;
    }

    return true;
}


// // 🔎 Live search/autocomplete
// $('#searchBox').on('keyup', function () {
//   const query = $(this).val().trim();

//   if (query.length < 2) {
//     $('#searchResults').empty();
//     return;
//   }

//   $.ajax({
//     url: `${url}api/v1/items/search?q=${encodeURIComponent(query)}`,
//     method: 'GET',
//     headers: {
//       "Authorization": `Bearer ${token}`
//     },
//     success: function (response) {
//       const results = response.data || [];
//       $('#searchResults').empty();

//       if (results.length === 0) {
//         $('#searchResults').append(`<li class="list-group-item">No matches</li>`);
//         return;
//       }

//       results.forEach(item => {
//         $('#searchResults').append(`
//           <li class="list-group-item list-group-item-action"
//               style="cursor:pointer"
//               onclick="showItemDetails(${item.item_id})">
//               ${item.pname}
//           </li>
//         `);
//       });
//     },
//     error: function (err) {
//       console.error('Search error:', err);
//     }
//   });
// });