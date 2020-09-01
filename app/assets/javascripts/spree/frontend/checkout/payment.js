//= require spree/frontend/coupon_manager

Spree.ready(function ($) {
  Spree.onPayment = function () {
    if ($('#checkout_form_payment').length) {
      if ($('#existing_cards').length) {
        $('#payment-method-fields').hide()
        $('#payment-methods').hide()
        $('#use_existing_card_yes').click(function () {
          $('#payment-method-fields').hide()
          $('#payment-methods').hide()
          $('.existing-cc-radio').prop('disabled', false)
        })
        $('#use_existing_card_no').click(function () {
          $('#payment-method-fields').show()
          $('#payment-methods').show()
          $('.existing-cc-radio').prop('disabled', true)
        })
      }
      $('.cardNumber').payment('formatCardNumber')
      $('.cardExpiry').payment('formatCardExpiry')
      $('.cardCode').payment('formatCardCVC')
      $('.cardNumber').change(function () {
        $(this).parent().siblings('.ccType').val($.payment.cardType(this.value))
      })
      $('input[type="radio"][name="order[payments_attributes][][payment_method_id]"]').click(function () {
        $('#payment-methods li').hide()
        if (this.checked) {
          $('#payment_method_' + this.value).show()
        }
      })
      $('input[type="radio"]:checked').click()
      $('#checkout_form_payment').submit(function (event) {
        var input = {
          couponCodeField: $('#order_coupon_code'),
          couponStatus: $('#coupon_status')
        }
        if ($.trim(input.couponCodeField.val()).length > 0) {
          // eslint-disable-next-line no-undef
          if (new CouponManager(input).applyCoupon()) {
            return true
          } else {
            Spree.enableSave()
            event.preventDefault()
            return false
          }
        }
      })
    }

    /* eslint-disable no-new */
    if ($('#ccTypeDisplayCleaver').length) {
      new Cleave('.cardNumberCleaver', {
        creditCard: true,
        onCreditCardTypeChanged: function (type) {
          $('.ccTypeCleaver').val(type)
          $('#ccTypeDisplayCleaver').removeClass().addClass(type)
        }
      })
      /* eslint-disable no-new */
      new Cleave('.cardExpiryCleaver', {
        date: true,
        datePattern: ['m', 'Y']
      })
      /* eslint-disable no-new */
      new Cleave('.cardCodeCleaver', {
        numericOnly: true,
        blocks: [3]
      })
    }
  }
  Spree.onPayment()
})
