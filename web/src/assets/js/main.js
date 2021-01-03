// ==================================================
// Project Name  :  nexavision
// File          :  JS Base
// Version       :  1.0.0  
// Author        :  Bitspeck
// Developer:    :  MD.ABDULLAH FAHAD GAZI
// ==================================================


$(document).ready(function() {

// preloader - start

  $(window).on('load', function () {
    $('#preloader').fadeOut('slow', function () { $(this).remove(); });
  });
  setTimeout(function()
  { $('#preloader').addClass('d-none'); }, 3000);
  
// preloader - end


$('.menuBtn').click(function() {
    $(this).toggleClass('act');
      if($(this).hasClass('act')) {
        $('.mainMenu').addClass('act');
      }
      else {
        $('.mainMenu').removeClass('act');
      }
  });



var headerId = $(".sticky-header");
  var headerTop = $(".sticky-header .header_top_area");

  $(window).on('scroll', function () {
    var amountScrolled = $(window).scrollTop();
    if ($(this).scrollTop() > 50) {
      headerId.removeClass("not-stuck");
      headerId.addClass("stuck");
      headerTop.addClass("display-none");
    } else {
      headerId.removeClass("stuck");
      headerId.addClass("not-stuck");
      headerTop.removeClass("display-none");
    }
  });

  // preloader - end

//   $('.banner-slider').owlCarousel({
//     loop:true,
//     margin:10,
//     nav:true,
//     responsive:{
//         0:{
//             items:1
//         },
//         600:{
//             items:1
//         },
//         1000:{
//             items:1
//         }
//     }
// })


var $range = $(".js-range-slider"),
    $inputFrom = $(".js-input-from"),
    $inputTo = $(".js-input-to"),
    instance,
    min = 0,
    max = 1000,
    from = 0,
    to = 0;

$range.ionRangeSlider({
  skin: "round",
    type: "double",
    min: min,
    max: max,
    from: 200,
    to: 800,
    onStart: updateInputs,
    onChange: updateInputs
});
instance = $range.data("ionRangeSlider");

function updateInputs (data) {
  from = data.from;
    to = data.to;
    
    $inputFrom.prop("value", from);
    $inputTo.prop("value", to); 
}

$inputFrom.on("input", function () {
    var val = $(this).prop("value");
    
    // validate
    if (val < min) {
        val = min;
    } else if (val > to) {
        val = to;
    }
    
    instance.update({
        from: val
    });
});

$inputTo.on("input", function () {
    var val = $(this).prop("value");
    
    // validate
    if (val < from) {
        val = from;
    } else if (val > max) {
        val = max;
    }
    
    instance.update({
        to: val
    });
});



function toggleChevron(e) { 
    $(e.target)
        .prev('.filter-btn')
        .find("i")
        .toggleClass('fa fa-plus fa fa-minus');
}
    $('#accordion').on('hidden.bs.collapse', toggleChevron);
    $('#accordion').on('shown.bs.collapse', toggleChevron);
    $('#accordion1').on('hidden.bs.collapse', toggleChevron);
    $('#accordion1').on('shown.bs.collapse', toggleChevron);
    $('#accordion2').on('hidden.bs.collapse', toggleChevron);
    $('#accordion2').on('shown.bs.collapse', toggleChevron);
    $('#accordion3').on('hidden.bs.collapse', toggleChevron);
    $('#accordion3').on('shown.bs.collapse', toggleChevron);
    $('#accordion4').on('hidden.bs.collapse', toggleChevron);
    $('#accordion4').on('shown.bs.collapse', toggleChevron);
    $('#accordion5').on('hidden.bs.collapse', toggleChevron);
    $('#accordion5').on('shown.bs.collapse', toggleChevron);
    $('#accordion6').on('hidden.bs.collapse', toggleChevron);
    $('#accordion6').on('shown.bs.collapse', toggleChevron);


//-----------------------------------------------
 // top-to-back - start 
 // ----------------------------------------------
  if ($(window).scrollTop() < 100) {
    $('.scrollToTop').hide();
  }
  
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('.scrollToTop').fadeIn('slow');
    } else {
      $('.back-to-top').fadeOut('slow');
    }
  });
  $('.scrollToTop').click(function(){
    $('html, body').stop().animate({scrollTop:0}, 0, 'swing');
    return false;
  });
  
// -----------------------------------------------
 // top-to-back - start 
 // ----------------------------------------------

 $('#contact_form .from-button').click(function () {
        $.ajax({
            type: 'post',
            url: 'mail.php',
            data: $('#contact_form').serialize(),
            success: function () {
                $('#contact_form .from-button').attr('style', "background-color:#16C39A");
                $('#contact_form .from-button').siblings().html("<i style='color:#16C39A'>*</i> Email has been sent successfully");
            }
        });
        return false;
    });


});