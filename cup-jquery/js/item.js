$(document).ready(function () {
    const url = 'http://localhost:4000/';
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
                    $("#iform").trigger("reset");
                    $('#itemModal').modal('show');
                    $('#itemUpdate').hide();
                    $('#itemImage').remove();
                }
            }
        ],
        columns: [
            { data: 'item_id' },
            {
            data: 'images',
            render: function (images) {
                if (!images || images.length === 0) {
                return 'No image';
                }

                return images.map(img => `<img src="${url}${img}" width="50" height="50" style="margin-right:5px;">`).join('');
            }
            }
,           { data: 'pname' },
            { data: 'description' },
            { data: 'cost_price' },
            { data: 'sell_price' },
            { data: 'quantity' },
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

    $("#itemSubmit").on('click', function (e) {
        e.preventDefault();
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
            success: function (data) {
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

    $('#itable tbody').on('click', '.editBtn', function (e) {
        e.preventDefault();
        $('#itemImage').remove();
        $('#itemId').remove();
        $("#iform").trigger("reset");

        var id = $(this).data('id');
        $('#itemModal').modal('show');
        $('<input>').attr({ type: 'hidden', id: 'itemId', name: 'item_id', value: id }).appendTo('#iform');

        $('#itemSubmit').hide();
        $('#itemUpdate').show();

        $.ajax({
            method: "GET",
            url: `${url}api/v1/items/${id}`,
            dataType: "json",
            success: function (data) {
                const { result } = data;
                $('#pname').val(result[0].pname);
                $('#desc').val(result[0].description);
                $('#sell').val(result[0].sell_price);
                $('#cost').val(result[0].cost_price);
                $('#qty').val(result[0].quantity);
                if (result[0].images) {
                const images = result[0].images.split(',');
                images.forEach((img, index) => {
                    $("#iform").append(`<img src="${url}${img}" width='100px' height='100px' style="margin:5px;" class="itemImagePreview" />`);
                });
                }

            },
            error: function (error) {
                console.log(error);
            }
        });
    });

    $("#itemUpdate").on('click', function (e) {
        e.preventDefault();
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
                confirm: {
                    label: 'Yes',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-danger'
                }
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
                            Swal.fire({
                                icon: "error",
                                text: "Failed to delete item."
                            });
                        }
                    });
                }
            }
        });
    });
});
