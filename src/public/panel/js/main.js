$(document).ready(function () {
  // const 
  window.baseUrl = $('#baseUrl').val();
  // configuration
  if ($('.selectpicker').length) {
    $('.selectpicker').selectpicker();
  }
  let userId = $('#user_id').val();

  var showToast = function (msg, type, timeout) {
    bootoast({
      message: msg,
      type: type,
      position: 'top-right',
      timeout: timeout || 2000
    });
  }



  var loader = {
    show: function () {
      $('#loader-div').show();
    },
    hide: function () {
      $('#loader-div').hide();
    }
  }

  $('.nav-item').mouseenter(function () {
    $(this).find('.dot-list').css('display', 'block');
    $(this).find('.nav-link').css('color', '#68e0ff');

  });
  $('.nav-item').mouseleave(function () {
    $(this).find('.dot-list').css('display', 'none');
    $(this).find('.nav-link').css('color', '#000');
  });

  // register
  $('body').on('submit', '#registration-form', function (ev) {
    ev.preventDefault();
    var values = {};
    var inputs = $('#registration-form :input');
    inputs.each(function () {
      if (!this.name) return;
      if (this.name == 'tnc') {
        return values[this.name] = $(this)[0].checked
      }
      values[this.name] = $(this).val();
    });
    // return console.log(values);
    $.ajax({
      url: baseUrl + '/register',
      type: 'POST',
      data: values,
      beforeSend: function () {
        loader.show();
      },
      success: function (success) {
        loader.hide();
        console.log(success);
        showToast(success.message, 'success');
        location.reload();
      },
      error: function (error) {
        loader.hide();
        let err = error.responseJSON;
        showToast(err.message, 'danger');
      }
    })

  });


  // login
  $('body').on('submit', '#login-form', function (ev) {
    ev.preventDefault();
    var values = {};
    var inputs = $('#login-form :input');
    inputs.each(function () {
      if (!this.name) return;
      values[this.name] = $(this).val();
    });
    console.log(values);

    $.ajax({
      url: baseUrl + '/login',
      type: 'POST',
      data: values,
      beforeSend: function () {
        loader.show();
      },
      success: function (success) {
        loader.hide();
        console.log(success);
        showToast(success.message, 'success');
        location.reload();
      },
      error: function (error) {
        loader.hide();
        let err = error.responseJSON;
        showToast(err.message, 'danger');
      }
    })

  });


  // selecte picker
  $('.scholarship-filter-dropdown .selectpicker').on('changed.bs.select', function (e, a, chekced, c) {
    // console.log(e);
    let name = $(this)[0].name;
    if (chekced) {
      $(this).find('option:selected').toArray().map((item, i) => {
        if (!$('.filter-tag-names').find(`span[data-id="${item.value}"]`).length) {
          $('.filter-tag-names').append(`<span data-id="${item.value}">${item.text} <img class="ml-2 mt-m-2" width="18px" src="${baseUrl}/public/panel/img/cancel.png"></span>`);
        }
      });
    } else {
      $(this).find('option:not(:selected)').toArray().map((item, i) => {
        $('.filter-tag-names').find(`span[data-id="${item.value}"]`).remove();
      });
    }
    $('#on-filter-scholarship-btn').prop('disabled', false);
  });

  // click on clear one filter
  $('body').on('click', '.filter-tag-names img', function(){
    let id = $(this).parent().attr('data-id');
    $('.selectpicker').find(`option[value="${id}"]`).prop('selected', false);
    $(this).parent().remove();
    $('#on-filter-scholarship-btn').prop('disabled', false);
  });

  // on filter scholarship btn
  $('body').on('click', '#on-filter-scholarship-btn, .pagination-link-ajax, .active-inactive-box-button', function () {
    let page = 1;
    let search = '';
    let elementId = this.id;
    if ($(this).hasClass('active-inactive-box-button')) {
      $('.active-inactive-box-button').removeClass('active');
      $(this).addClass('active')
    }


    if ($(this).hasClass('pagination-link-ajax')) {
      page = $(this).attr('data-page');
      if ($('#search-input').length) {
        search = $('#search-input').val();
      }
    }
    console.log(search)
    let type = $('.active-inactive-box-button.active').attr('data-type')
    // return console.log(type);
    let selectPickers = $('.filter-bar .selectpicker');
    // console.log(selectPickers);
    let ids = selectPickers.map(function (item) {
      return $(this).val();
    }).toArray().toString();
    // console.log(ids);
    // return;
    $.ajax({
      url: baseUrl + `/filter-scholarship?page=${page}`,
      type: 'POST',
      data: { ids, search, type },
      beforeSend: function () {
        loader.show();
      },
      success: function (success) {
        loader.hide();
        // console.log(success);
        if(elementId){
          $('#on-filter-scholarship-btn').prop('disabled', true);
        }
        if (success) {
          $('#scholarship-list').html(success);
        } else {
          $('#scholarship-list').html('');
        }
      },
      error: function (error) {
        loader.hide();
        let err = error.responseJSON;
        showToast(err.message, 'danger');
      }
    })

  });

  // education-change
  $('.education-change').change(function () {
    let id = $(this).val();
    let array = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
    let selectedName = $(this).find(':selected').text();
    if (array.indexOf(selectedName) > -1) {
      $('.subject-stream').val('');
      return $('.subject-stream').attr('disabled', 'disabled');
    } else {
      $('.subject-stream').attr('disabled', false);
    }
    $.ajax({
      url: baseUrl + `/get-subject/${id}`,
      type: 'GET',
      beforeSend: function () {
        loader.show();
      },
      success: function (success) {
        loader.hide();
        $('.subject-stream').html('<option value="">--select subject --</option>');
        if (success) {
          success.map(function (data) {
            $('.subject-stream').append(`<option value="${data.id}">${data.name}</option>`)
          });
        }

      },
      error: function (error) {
        loader.hide();
        let err = error.responseJSON;
        showToast(err.message, 'danger');
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

  // personal data update
  $('body').on('click', '#on-personal-data-update, #on-education-data-update, #on-interest-data-update, #on-scholarship-history-data-update, #on-edit-scholarship-history-by-id, #on-entrance-exam-data-update, #on-edit-entrance-exam-by-id, #on-change-password-btn', function () {
    var values = {};
    var inputs = $(this).parents('.card-body').find(':input');
    inputs.each(function () {
      if (!this.name) return;
      values[this.name] = $(this).val();
    });
    let url = '';
    let elementId = $(this).attr('id');
    if (elementId == 'on-personal-data-update') {
      values.interest = $('[name="interest"]:checked').toArray().map(function (data) {
        return data.value.toString();
      });
      values.interest = values.interest.toString();
      // if (!values.interest) return showToast('Please select at least one interest tag', 'danger');
      url = `/profile-update/personal/${userId}`;
    } else if (elementId == 'on-education-data-update') {
      url = `/profile-update/education/${userId}`;
    } else if (elementId == 'on-interest-data-update') {
      values.interest = $('[name="interest"]:checked').toArray().map(function (data) {
        return data.value.toString();
      });
      values.interest = values.interest.toString();
      if (!values.interest) return showToast('Please select at least one interest tag', 'danger');
      url = `/profile-update/interest/${userId}`;
    } else if (elementId == 'on-scholarship-history-data-update') {
      url = `/profile-update/scholarship-history/${userId}`;
    } else if (elementId == 'on-edit-scholarship-history-by-id') {
      url = `/profile-update/edit-scholarship-history/${userId}`;
    } else if (elementId == 'on-entrance-exam-data-update') {
      url = `/profile-update/entrance-exam/${userId}`;
    } else if (elementId == 'on-edit-entrance-exam-by-id') {
      url = `/profile-update/edit-entrance-exam/${userId}`;
    } else if (elementId == 'on-change-password-btn') {
      url = `/profile-update/change-password`;
    }
    // return console.log(values);
    $.ajax({
      url: baseUrl + url,
      type: 'POST',
      data: values,
      beforeSend: function () {
        loader.show();
      },
      success: function (success) {
        loader.hide();
        console.log(success);
        showToast(success.message, 'success');
        location.reload();
      },
      error: function (error) {
        loader.hide();
        console.log(error);
        let err = error.responseJSON;
        showToast(err.message, 'danger');
      }
    })
  });


  let fileToBase64 = async function (file) {
    return new Promise(function (resolve, reject) {
      let fileReader = new FileReader();
      fileReader.onload = function () {
        resolve(fileReader.result);
      };

      fileReader.readAsDataURL(file)

      fileReader.onerror = function (err) {
        reject(err);
      };
    });
  }

  // on-create-another-account
  $('#on-create-another-account').click(function () {
    var values = {};
    var inputs = $(this).parents('.card-body').find(':input');
    inputs.each(function () {
      if (!this.name) return;
      values[this.name] = $(this).val();
    });
    console.log(values);
    $.ajax({
      url: baseUrl + `/profile-update/create-another-account/${userId}`,
      type: 'POST',
      data: values,
      beforeSend: function () {
        loader.show();
      },
      success: function (success) {
        loader.hide();
        console.log(success);
        showToast(success.message, 'success');
        location.reload();
      },
      error: function (error) {
        loader.hide();
        console.log(error);
        let err = error.responseJSON;
        showToast(err.message, 'danger');
      }
    })
  });


  // on-edit-scholarship-history-view
  $('body').on('click', '#on-edit-scholarship-history-view', function () {
    let parentRow = $(this).parents('div.row[data-row="my-row"]');
    let data = {
      id: $(parentRow).find('[data-id]').val(),
      name: parentRow.find('[data-name]').text().trim(),
      source: parentRow.find('[data-source]').text().trim(),
      year: parentRow.find('[data-year]').text().trim(),
      description: parentRow.find('[data-description]').text().trim(),
    }
    parentRow.hide();
    $(this).parents('div.saved-card').html(editScholarhsipHtml(data));
  });

  $('body').on('click', '#on-edit-entrance-exam-view', function () {
    let parentRow = $(this).parents('div.row[data-row="my-row"]');
    let data = {
      id: $(parentRow).find('[data-id]').val(),
      name: parentRow.find('[data-name]').text().trim(),
      level: parentRow.find('[data-level]').text().trim(),
      qualification: parentRow.find('[data-qualification]').text().trim(),
      occupation: parentRow.find('[data-occupation]').text().trim(),
    }
    parentRow.hide();
    $(this).parents('div.saved-card').html(editEntranceExamHtml(data));
  });



  $('select[name="doc_name"]').on('change', function () {
    if ($(this).val() == 'Others') {
      $(this).parents('div[data-row="document-row"]').next().show();
    } else {
      $(this).parents('div[data-row="document-row"]').next().hide();
    }
  })

  $('form#user-document-form').on('submit', function (e) {
    var values = {};
    var inputs = $(this).find(':input');
    inputs.each(function () {
      if (!this.name) return;
      values[this.name] = $(this).val();
    });
    if (!values.doc_name) {
      e.preventDefault();
      return showToast('Document name is required', 'danger');
    } else if (values.doc_name == 'Others' && !values.doc_name_other) {
      e.preventDefault();
      return showToast('Document name is required', 'danger');
    } else if (!values.file) {
      e.preventDefault();
      return showToast('Document file is required', 'danger');
    }
  });

  // close and open modal (register and login)
  $('body').on('click', '#close-and-open-login-modal, #close-and-open-register-modal, #close-and-open-forgot-modal, #close-and-open-login-with-otp-modal, #close-and-open-login-with-password-modal', function () {
    let id = $(this).attr('id');
    if (id == 'close-and-open-login-modal') {
      $('#registerModal').modal('hide');
      setTimeout(() => {
        $('#loginModal').modal('show');
      }, 500);
    } else if (id == 'close-and-open-register-modal') {
      $('#loginModal').modal('hide');
      setTimeout(() => {
        $('#registerModal').modal('show');
      }, 500);
    } else if (id == 'close-and-open-forgot-modal') {
      $('#loginModal').modal('hide');
      setTimeout(() => {
        $('#forgotModal').modal('show');
      }, 500);
    } else if (id == 'close-and-open-login-with-otp-modal') {
      $('#loginModal').modal('hide');
      setTimeout(() => {
        $('#loginWithOtpModal').modal('show');
      }, 500);
    } else if (id == 'close-and-open-login-with-password-modal') {
      setTimeout(() => {
        $('#loginModal').modal('show');
      }, 500);
    }
  });

  // close and open modal
  $('body').on('click', '#close-and-open-modal', function () {
    let showModal = $(this).attr('data-modal');
    setTimeout(() => {
      $(showModal).modal('show');
    }, 500);
  })


  // contact us
  $('#contact-us-form').on('submit', function (e) {
    e.preventDefault()
    var values = {};
    var inputs = $(this).find(':input');
    inputs.each(function () {
      if (!this.name) return;
      values[this.name] = $(this).val();
    });
    console.log(values);
    $.ajax({
      url: baseUrl + `/contact-us`,
      type: 'POST',
      data: values,
      beforeSend: function () {
        loader.show();
      },
      success: function (success) {
        loader.hide();
        console.log(success);
        showToast(success.message, 'success');
        location.reload();
      },
      error: function (error) {
        loader.hide();
        console.log(error);
        let err = error.responseJSON;
        showToast(err.message, 'danger');
      }
    })
  });



  // get verification code 
  $('body').on('click', '.on-get-mobile-otp, .on-get-email-otp', function () {
    let tag = $(this).attr('data-tag');
    let url = null;
    let mobile = null;
    if (tag == 'login') {
      mobile = $('#login-otp-mobile-input').val();
      url = `/get-login-otp?mobile=${mobile}&tag=${tag}`;
    } else if (tag == 'verify-mobile') {
      url = `/get-mobile-verify-otp`;
    } else if (tag == 'forgot-otp') {
      mobile = $('#forgot-email-mobile-input').val();
      url = `/get-forgot-password-otp?mobile=${mobile}&tag=${tag}`;
    } else if (tag == 'verify-email') {
      url = `/get-email-verify-otp`;
    }

    $.ajax({
      url: baseUrl + url,
      type: 'GET',
      beforeSend: function () {
        loader.show();
      },
      success: function (success) {
        loader.hide();
        if (tag == 'forgot-otp') {
          $('.alert-success').text(success.message);
        }
        $('.alert-success').show();
        console.log(success);
        showToast(success.message, 'success');
      },
      error: function (error) {
        loader.hide();
        $('.alert-success').hide();
        console.log(error);
        let err = error.responseJSON;
        showToast(err.message, 'danger');
      }
    })
  });


  // otp with login
  $('body').on('click', '#on-otp-with-login', function () {
    let mobile = $('#login-otp-mobile-input').val();
    let otp = $('#login-otp-input').val();
    $.ajax({
      url: baseUrl + `/login-with-otp`,
      type: 'POST',
      data: {
        mobile, otp
      },
      beforeSend: function () {
        loader.show();
      },
      success: function (success) {
        loader.hide();
        console.log(success);
        showToast(success.message, 'success');
        location.reload();
      },
      error: function (error) {
        loader.hide();
        console.log(error);
        let err = error.responseJSON;
        showToast(err.message, 'danger');
      }
    })
  });


  // on verify
  $('body').on('click', '#on-verify-mobile, #on-verify-email', function () {
    var values = {};
    var inputs = $(this).parents('.modal-body').find(':input');
    inputs.each(function () {
      if (!this.name) return;
      values[this.name] = $(this).val();
    });
    url = null;
    if (this.id == 'on-verify-mobile') {
      url = `/verify-mobile-with-otp`;
    } else if (this.id == 'on-verify-email') {
      url = `/verify-email-with-otp`;
    }

    $.ajax({
      url: baseUrl + url,
      type: 'POST',
      data: values,
      beforeSend: function () {
        loader.show();
      },
      success: function (success) {
        loader.hide();
        console.log(success);
        showToast(success.message, 'success');
        location.reload();
      },
      error: function (error) {
        loader.hide();
        console.log(error);
        let err = error.responseJSON;
        showToast(err.message, 'danger');
      }
    })
  });


  // on-forgot-password
  $('body').on('click', '#on-forgot-password', function () {
    var values = {};
    var inputs = $(this).parents('.form-data').find(':input');
    inputs.each(function () {
      if (!this.name) return;
      values[this.name] = $(this).val();
    });
    $.ajax({
      url: baseUrl + `/verify-forgot-password-otp`,
      type: 'POST',
      data: values,
      beforeSend: function () {
        loader.show();
      },
      success: function (success) {
        loader.hide();
        $('.alert-success').text(success.message).show();
        inputs.each(function () { $(this).val(''); });
        console.log(success);
        showToast(success.message, 'success');
      },
      error: function (error) {
        loader.hide();
        console.log(error);
        let err = error.responseJSON;
        showToast(err.message, 'danger');
      }
    })
  })

  // on change mobile and number
  $('body').on('click', '#on-change-mobile, #on-change-email', function () {
    var values = {};
    var inputs = $(this).parents('.card-body').find(':input');
    inputs.each(function () {
      if (!this.name) return;
      values[this.name] = $(this).val();
    });
    let url = null;
    if (this.id == 'on-change-mobile') {
      url = '/change-mobile';
    } else if (this.id == 'on-change-email') {
      url = `/change-email`;
    }

    // return console.log(values);
    $.ajax({
      url: baseUrl + url,
      type: 'POST',
      data: values,
      beforeSend: function () {
        loader.show();
      },
      success: function (success) {
        loader.hide();
        console.log(success);
        showToast(success.message, 'success');
        location.reload();
      },
      error: function (error) {
        loader.hide();
        console.log(error);
        let err = error.responseJSON;
        showToast(err.message, 'danger');
      }
    })
  });

  // collapse change icon
  $('.collapse')
    .on('shown.bs.collapse', function () {
      let imgUrl = baseUrl + '/public/panel/img';
      $(this)
        .parent()
        .find(".card-header img")
        .attr("src", imgUrl + '/minus.svg');
    })
    .on('hidden.bs.collapse', function () {
      let imgUrl = baseUrl + '/public/panel/img';
      $(this)
        .parent()
        .find(".card-header img")
        .attr("src", imgUrl + '/add.svg');
    });


});

// $('.owl-carousel').owlCarousel({
//     loop:true,
//     margin:10,
//     responsiveClass:true,
//     responsive:{
//         0:{
//             items:1,
//             nav:true
//         },
//         600:{
//             items:1,
//             nav:false
//         },
//         1000:{
//             items:1,
//             nav:true,
//             loop:false
//         }
//     }
// })

$("#owl-example3").owlCarousel({
  loop: true,
  margin: 40,
  nav: true,
  items: 3,
  autoPlay: true,
  autoPlayTimeout: 500,
  autoPlayHoverPause: true,

});

$("#owl-example2").owlCarousel({
  loop: true,
  margin: 40,
  nav: true,
  items: 3,
  autoPlay: true,
  autoPlayTimeout: 500,
  autoPlayHoverPause: true,

});


var editScholarhsipHtml = function (data) {
  // let array = 
  return `<div class="card-body">
  <div class="card-form-input-wrapper acc-wrapper">
      <div class="row">
          <div class="col-sm-6">
              <label>Scholarship Name</label>
              <input type="text" class="form-control" name="name" value="${data.name}">
              <input type="hidden" name="id" data-id="${data.id}" value="${data.id}">
          </div>
          <div class="col-sm-6 ">
              <label>Source</label>
              <select class="form-control" name="source">
                  <option ${data.source == 'Private' ? 'selected' : null} value="Private">Private</option>
                  <option ${data.source == 'Government' ? 'selected' : null} value="Government">Government</option>
                  <option ${data.source == 'NGO' ? 'selected' : null} value="NGO">NGO</option>
                  <option ${data.source == 'Others' ? 'selected' : null} value="Others">Others</option>
              </select>
          </div>
      </div>

      <div class="row mr-form-top">
          <div class="col-sm-6">
              <label>scholarship received in year</label>
              <input type="number" class="form-control" name="year" placeholder="ex - 2016" value="${data.year}">
          </div>
          <div class="col-sm-6 ">
              <label>Description</label>
              <input type="text" class="form-control" name="description" value="${data.description}">
          </div>
      </div>

      <button class="btn btn-join mt-3" id="on-edit-scholarship-history-by-id">SAVE</button>

  </div>
</div>
`;
}


var editEntranceExamHtml = (data) => {
  let array = ["Common Addmission Test [CAT]", "Xaviers Admission test [XAT]", "IIT-Jee", "AIIMS", "CLAT", "GRE", "GMAT", "TOEFL", "SAT", "CET", "Other"];

  console.log(data);
  return `<div class="card-body">
  <div class="card-form-input-wrapper acc-wrapper">
    <div class="row">
      <div class="col-sm-6">
        <label>Entrance exam name</label>
        <select class="form-control" name="name">`
    +
    array.map((option) => {
      return `<option ${data.name == option ? 'selected' : null}   value="${option}">${option}</option>`
    })
    +
    `</select>
        <input type="hidden" name="id" data-id="${data.id}" value="${data.id}">
      </div>
      <div class="col-sm-6 ">
        <label>Level</label>
        <select class="form-control" name="level">
            <option ${data.level == 'State' ? 'selected' : null} value="State">State</option>
            <option ${data.level == 'National' ? 'selected' : null} value="National">National</option>
            <option ${data.level == 'International' ? 'selected' : null} value="International">International</option>
        </select>
      </div>
    </div>

    <div class="row mr-form-top">
      <div class="col-sm-6">
        <label>Qualification</label>
        <input type="text" class="form-control" name="qualification" value="${data.qualification}">
      </div>
      <div class="col-sm-6">
        <label>Occupation</label>
        <input type="text" class="form-control" name="occupation" value="${data.occupation}">
      </div>
    </div>

    <button class="btn btn-join mt-3" id="on-edit-entrance-exam-by-id">SAVE</button>

  </div>
</div>`;
}