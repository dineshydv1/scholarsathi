$(document).ready(function () {
    const baseUrl = $('#baseUrl').val();
    let dataTable;
    // data table
    if ($('#data-table')[0]) {
        dataTable = $('#data-table').DataTable({
            'aoColumnDefs': [{
                'bSortable': false,
                'aTargets': ['nosort']
            }]
        });
    };


    var loader = {
        show: function () {
            $('#loader-div').show();
        },
        hide: function () {
            $('#loader-div').hide();
        }
    }


    // checked all checkbox
    $('#checked-all-checkbox-table').change(function () {
        let checkboxs = $(this).parents('table').find('input[type="checkbox"][name="id_checkbox"]').not(this);
        checkboxs.prop('checked', this.checked);
        // var cells = dataTable.cells( ).nodes();
        // $( cells ).find(':checkbox').prop('checked', $(this).is(':checked'));
    });

    // checked all checkbox with all page
    $('#checked-all-checkbox-table-with-all-page').change(function () {
        // let checkboxs = $(this).parents('table').find('input[type="checkbox"][name="id_checkbox"]').not(this);
        // checkboxs.prop('checked', this.checked);
        var cells = dataTable.cells().nodes();
        $(cells).find(':checkbox').prop('checked', $(this).is(':checked'));
    });

    // check all check under his parent
    $('body').on('change', '.check-all-checkbox-under-his-parent', function () {
        let checkboxs = $(this).parent().parent().find('input[type="checkbox"]').not(this);
        checkboxs.prop('checked', this.checked);
    });

    // delete
    $('#delete-btn-table').click(function () {
        let checkboxs = $('#data-table, #normal-table').find('input[type="checkbox"][name="id_checkbox"]:checked').not('#checked-all-checkbox-table');
        let type = $(this).attr('data-type');
        let ids = [];
        let list = [];
        let img = [];
        let document = [];
        checkboxs.map(function () {
            // name
            let name = $(this).parents('tr').find('td[data-name]').text();
            list.push(`<li class="list-group-item">${name}</li>`);

            // img
            let imgUrl = $(this).parents('tr').find('input[name="img"]').val();
            if (imgUrl) img.push(imgUrl);

            // document
            if (type == 'scholarship') {
                let documentUrl = $(this).parents('tr').find('input[name="document"]').val();
                if (documentUrl) document.push(documentUrl);
            }

            // ids
            ids.push($(this).val());
        });
        if (!ids.length) {
            return alert('Please checked at least one checkbox');
        }
        $('#selected-delete-ids-table').val(ids.toString());
        $('#selected-delete-img-table').val(img.toString());
        $('#selected-delete-document-table').val(document.toString());
        $('#selected-delete-type-table').val(type);
        $('.delete-all-list-group').html('').append(list);
        $('#delete-all-modal').modal('show');
    });

    // get subcategory by id
    $('#header-menu-category-select').change(function () {
        let thisElement = $('#header-menu-category-select');
        let id = this.value;
        if (!id) return;
        $.ajax({
            url: baseUrl + '/admin/subcategory-by-category-id/' + id,
            type: 'GET',
            beforeSend: function () {
                loader.show();
            },
            success: function (success) {
                loader.hide();
                let array = []
                if (success.data.length) {
                    success.data.forEach(function (val) {
                        array.push(`<label style="margin-right: 20px;">
                                <input type="checkbox" value="${val.id}" name="subcategories">
                                ${val.name}
                            </label>`);
                    })
                    array.push(`
                    <label style="min-width: 20%; margin-right: 10px;">
                    <input type="checkbox" class="check-all-checkbox-under-his-parent">
                        Select All
                    </label>
                    `);
                }
                $('#header-menu-subcategory-checkbox-div').html(array);
                console.log(success);
            },
            error: function (error) {
                loader.hide();
                let err = error.responseJSON;
            }
        })
    });

    // state-change
    $('.state-change').change(function () {
        let id = $(this).val();
        let name = $(this).attr('name');
        $.ajax({
            url: baseUrl + `/get-cities/${id}`,
            type: 'GET',
            beforeSend: function () {
                loader.show();
            },
            success: function (success) {
                loader.hide();
                if (success) {
                    if (name == 'state_id') {
                        $('.profile-city').html('<option value="">--select city --</option>');
                        success.map(function (data) {
                            $('.profile-city').append(`<option value="${data.id}">${data.name}</option>`)
                        });
                    } else if (name == 'institute_state_id') {
                        $('.education-city').html('<option value="">--select city --</option>');
                        success.map(function (data) {
                            $('.education-city').append(`<option value="${data.id}">${data.name}</option>`)
                        });
                    }

                }

            },
            error: function (error) {
                loader.hide();
                let err = error.responseJSON;
                showToast(err.message, 'danger');
            }
        })
    });


});