function CouponManager (input) {
  this.input = input
  this.couponCodeField = this.input.couponCodeField
  this.couponApplied = false
  this.couponStatus = this.input.couponStatus
}

CouponManager.prototype.applyCoupon = function () {
  this.couponCode = $.trim($(this.couponCodeField).val())
  if (this.couponCode !== '') {
    if (this.couponStatus.length === 0) {
      this.couponStatus = $('<div/>', {
        id: 'coupon_status'
      })
      this.couponCodeField.parent().after(this.couponStatus)
    }
    this.couponStatus.removeClass()
    this.sendRequest()
    return this.couponApplied
  } else {
    return true
  }
}

CouponManager.prototype.sendRequest = function () {
  return $.ajax({
    async: false,
    method: 'PATCH',
    url: Spree.routes.api_v2_storefront_cart_apply_coupon_code,
    dataType: 'json',
    headers: {
      'X-Spree-Order-Token': Spree.current_order_token
    },
    data: {
      coupon_code: this.couponCode
    }
  }).done(function () {
    this.couponCodeField.val('')
    this.couponStatus.addClass('alert-success').html(Spree.translations.coupon_code_applied)
    this.couponApplied = true

  }.bind(this)).fail(function (xhr) {
    var handler = xhr.responseJSON
    this.couponCodeField.next().addClass('animated headShake')
    this.couponCodeField.addClass('alert-error animated headShake')
    setTimeout(function(){
        $('.animated').removeClass('alert-error animated headShake');
    }, 2000);

  }.bind(this))
}
