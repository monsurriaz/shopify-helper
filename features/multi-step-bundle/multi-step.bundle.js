
// Function to start the countdown
function startTimer() {
  let timeLeft = 3 * 60 * 60 + 59 * 60 + 59;
  const timeWatchElem = document.getElementById('timeWatch');

  const timerInterval = setInterval(function() {
    let hours = Math.floor(timeLeft / 3600);
    let minutes = Math.floor((timeLeft % 3600) / 60);
    let seconds = timeLeft % 60;

    let formattedTime = 
      String(hours).padStart(2, '0') + ':' + 
      String(minutes).padStart(2, '0') + ':' + 
      String(seconds).padStart(2, '0');

    timeWatchElem.textContent = formattedTime;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timerInterval);
      alert("Time's up!");
    }
  }, 1000);
}

document.addEventListener('DOMContentLoaded', startTimer);

$(document).ready(function () {
  $('#btnChooseColorSize').click(function () {
    $('html, body').animate({
      scrollTop: $(".choose-your-package-cover-content-slide-1").offset().top - 120
    }, 1000);
    $(this).addClass('hide');
  }),
  $('#upsell-slide').click(function () {
    $('html, body').animate({
      scrollTop: $(".choose-your-package-cover-content-slide-3").offset().top - 140
    }, 1000)
    $(this).addClass('hide');
  })
});

$('#btnChooseColorSize').click(function () {
  $('.choose-your-package-cover-content-slide-1').slideToggle('slow', function () {
    $('.choose-your-package-cover-content').toggleClass('selecionado');
  });
});

$('#upsell-slide').click(function () {
  $('.choose-your-package-cover-content-slide-3').slideToggle('slow', function () {
    $('.choose-your-package-cover-content').toggleClass('selecionado');
  });
});

// select quantity
$(document).on('click', '.bundles__bars input[type="radio"]', function () {
  $('.bundle__bar.bundle__bar--selected').removeClass('bundle__bar--selected');
  $(this).closest('.bundle__bar').addClass('bundle__bar--selected');
});

// show/hide custom dropdown options
$(document).on('click', ".select-selected .color-option", function () {
  if ($(this).parents('.custom-select').find(".select-items").hasClass("select-items-open")) {
    $(".select-items").removeClass("select-items-open");
  } else {
      $(".select-items").removeClass("select-items-open");
    $(this).parents('.custom-select').find(".select-items").addClass("select-items-open");
  }
});

$(document).click(function(event){
  if (!$(event.target).closest('.custom-select').length) {
    if($('.custom-select').find(".select-items").hasClass("select-items-open")) {
      $(".select-items").removeClass("select-items-open");
    }
  }
})

// custom dropdown or select
$(document).on('click', '.select-items .color-option', function () {
  var img = $(this).find('img').attr('src');
  var title = $(this).attr('data-title');
  $(".select-items").removeClass("select-items-open");
  $(this).parents('.custom-select').find('.select-selected .color-option img').attr('src', img);
  $(this).parents('.custom-select').find('.select-selected .color-option').attr('data-title', title);
  $(this).parents('.color-container').find('.color-label .color-label-text').text(title)
});

// show number of dropdowns set
$(document).on('click', '.bundle__bar', function (e) {
  setTimeout(function () {
    var title_prod = $('.bundle__bar--selected .bundle__bar-container').data('qty');
    $('.selector').removeClass('active');
    if (title_prod == '1') {
      $('.selector').each(function (index) {
        if (index == 0) {
          $(this).addClass('active');
        }
      })
    } else if (title_prod == '2') {
      $('.selector').each(function (index) {
        if (index == 0 || index == 1) {
          $(this).addClass('active');
        }
      })
    } else if (title_prod == '3') {
      $('.selector').each(function (index) {
        $(this).addClass('active');
      })
    }
  }, 100)
})

// show number of dropdowns set
$(document).on('click', '.ctm_select_your_color_size', function (e) {
  e.preventDefault();
  var title_prod = $('.bundle__bar--selected .bundle__bar-container').data('qty');
  $('.selector').removeClass('active');
  if (title_prod == '1') {
    $('.selector').removeClass('active');
    $('.selector').each(function (index) {
      if (index == 0) {
        $(this).addClass('active');
      }
    })
  } else if (title_prod == '2') {
    $('.selector').removeClass('active');
    $('.selector').each(function (index) {
      if (index == 0 || index == 1) {
        $(this).addClass('active');
      }
    })
  } else if (title_prod == '3') {
    $('.selector').removeClass('active');
    $('.selector').each(function (index) {
      $(this).addClass('active');
    })
  }
});

// add to cart and buy now
$(document).on('click', '.ctm_checkout-form-submit-next-main-submit', function (e) {
  e.preventDefault();

  var select_len = $('.selector.active').length - 1;
  var prod_1 = '', prod_2 = '', prod_3 = ''
  var var_prod_1 = '', var_prod_2 = '', var_prod_3 = '';

  var addon_1 = '', addon_list = '';
  
  var items = [];

  $('.selector.active').each(function (index) {
    var color = $(this).find('.select-selected .color-option').attr('data-title');
    var size = $(this).find('#size-selector option:selected').val();
    if (index == 0) {
      prod_1 = color + ' / ' + size;
    }
    if (index == 1) {
      prod_2 = color + ' / ' + size;
    }
    if (index == 2) {
      prod_3 = color + ' / ' + size;
    }
  });


  addon_1 = $('.prod-check-selected-1 input:checked').attr('data-id');

  if (addon_1 != '' && addon_1 != undefined) {
    addon_list += ',' + addon_1 + ':1';
    items.push({ 'id': addon_1, 'quantity': 1 });
  }


  $('.selector.active #size-selector').each(function (index) {
    var selecte_opt = $(this).find('option:selected').val();
    if (selecte_opt == '') {
      alert('Please Select Size');
    }
    if (select_len == index) {
      if (selecte_opt == '') {
        alert('Please Select Size');
      } else {
        $('.var-prod-list-part option').each(function () {
          var data_t = $(this).attr('data-title');
          if (prod_1 == data_t) {
            var_prod_1 = $(this).val();
            items.push({ 'id': var_prod_1, 'quantity': 1 });
          }
          if (prod_2 == data_t) {
            var_prod_2 = $(this).val();
            items.push({ 'id': var_prod_2, 'quantity': 1 });
          }
          if (prod_3 == data_t) {
            var_prod_3 = $(this).val();
            items.push({ 'id': var_prod_3, 'quantity': 1 });
          }
        })

        /*
        if(var_prod_1 != '' && var_prod_2 != '' && var_prod_3 != ''){
          window.location.href = '/cart/'+var_prod_1+':1,'+var_prod_2+':1,'+var_prod_3+':1'+addon_list
        }else if(var_prod_1 != '' && var_prod_2 != ''){
          window.location.href = '/cart/'+var_prod_1+':1,'+var_prod_2+':1'+addon_list
        }
        else if(var_prod_1 != ''){
          window.location.href = '/cart/'+var_prod_1+':1'+addon_list
        }
        */

        var formData = { 'items': items };
        console.log(formData);
        addToCart(formData);
      }
    }
  })
})


function addToCart(formData) {
  fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
  .then(data => {
    console.log('Success');
    window.location.href = '/checkout';
  }).catch(error => {
    console.error('Error adding item to cart:', error);
  });
}
