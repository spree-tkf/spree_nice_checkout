Spree.ready(function($) {
  Spree.onAddress = function() {
    if ($('#checkout_form_address').length) {
      Spree.updateState = function(region) {
        var countryId = getCountryId(region)
        if (countryId != null) {
          if (Spree.Checkout[countryId] == null) {
            $.ajax({
              async: false,
              method: 'GET',
              url: '/api/v2/storefront/countries/' + countryId + '?include=states',
              dataType: 'json'
            }).done(function(data) {
              var json = data.included;
              var xStates = []
              for (var i = 0; i < json.length; i++) {
                var obj = json[i];
                xStates.push({ 'id': obj.id, 'name': obj.attributes.name })
              }
              Spree.Checkout[countryId] = {
                states: xStates,
                states_required: data.data.attributes.states_required,
                zipcode_required: data.data.attributes.zipcode_required
              }
              Spree.fillStates(Spree.Checkout[countryId], region)
              Spree.toggleZipcode(Spree.Checkout[countryId], region)
              Spree.toggleContainerWidth(Spree.Checkout[countryId], region)
            })
          } else {
            Spree.fillStates(Spree.Checkout[countryId], region)
            Spree.toggleZipcode(Spree.Checkout[countryId], region)
            Spree.toggleContainerWidth(Spree.Checkout[countryId], region)
          }
        }
      }

      // Sets the width of the Country State Zip containing element
      Spree.toggleContainerWidth = function(data, region) {
        var zipcodeRequired = data.zipcode_required
        var statesRequired = data.states_required
        var countrySelector = $('#' + region + 'country')
        var feildsContainer = $('#' + region + 'country_container')
        var states = data.states

        if (states.length > 0) {
          feildsContainer.addClass('address-half')
          if (zipcodeRequired) {
            feildsContainer.removeClass('address-half')
            feildsContainer.addClass('address-third')
          }
        } else {
          if (statesRequired && zipcodeRequired) {
            feildsContainer.removeClass('address-half')
            feildsContainer.addClass('address-third')
          } else if (!statesRequired && zipcodeRequired) {
            feildsContainer.removeClass('address-third')
            feildsContainer.addClass('address-half')
          } else if (statesRequired && !zipcodeRequired) {
            feildsContainer.removeClass('address-third')
            feildsContainer.addClass('address-half')
          } else {
            feildsContainer.removeClass('address-third')
            feildsContainer.removeClass('address-half')
          }
        }
      }

      Spree.toggleZipcode = function(data, region) {
        var zipcodeRequired = data.zipcode_required
        var zipcodePara = $('#' + region + 'zipcode')
        var zipcodeInput = zipcodePara.find('input')
        var zipcodeOptional = zipcodePara.find('abbr')

        if (zipcodeRequired) {
          zipcodeInput.prop('required', true)
          zipcodeOptional.removeClass('optional')
          zipcodeOptional.addClass('required')
          zipcodePara.show()
        } else {
          zipcodeInput.val('')
          zipcodeInput.prop('required', false)
          zipcodeOptional.removeClass('required')
          zipcodeOptional.addClass('optional')
          zipcodePara.hide()
        }
      }

      Spree.fillStates = function(data, region) {
        var selected, statesWithBlank
        var statesRequired = data.states_required
        var states = data.states
        var statePara = $('#' + region + 'state')
        var stateSelect = statePara.find('select')
        var stateInput = statePara.find('input')
        var stateLabel = statePara.find('label')
        var stateOptional = statePara.find('abbr')

        if (states.length > 0) {
          selected = parseInt(stateSelect.val())
          stateSelect.html('')
          statesWithBlank = [{
            name: '',
            id: ''
          }].concat(states)
          $.each(statesWithBlank, function(idx, state) {
            var opt = $(document.createElement('option')).attr('value', state.id).html(state.name)
             if (parseInt(selected) === parseInt(state.id)) {
              opt.prop('selected', true)
            }
            stateSelect.append(opt)
          })
          stateSelect.prop('required', false)
          stateSelect.prop('disabled', false).show()
          stateInput.hide().prop('disabled', true)
          stateInput.attr('placeholder', '')
          stateLabel.insertAfter(stateSelect)
          statePara.show()
          stateOptional.addClass('optional')
          stateOptional.removeClass('required')
          stateSelect.removeClass('required')

          if (statesRequired) {
            stateSelect.addClass('required')
            stateOptional.addClass('required')
            stateOptional.removeClass('optional')
            stateSelect.prop('required', true)
          }
          stateSelect.removeClass('hidden')
          stateInput.removeClass('required')
        } else {
          stateSelect.hide().prop('disabled', true)
          stateInput.show()
          if (statesRequired) {
            stateOptional.addClass('required')
            stateOptional.removeClass('optional')
            stateInput.addClass('required form-control')
          } else {
            stateInput.val('')
            stateOptional.addClass('optional')
            stateOptional.removeClass('required')
            stateInput.removeClass('required')
          }
          statePara.toggle(!!statesRequired)
          stateInput.prop('disabled', !statesRequired)
          stateLabel.insertAfter(stateInput)
          stateInput.attr('placeholder', 'State')
          stateInput.removeClass('hidden')
          stateSelect.removeClass('required')
        }
      }
      $('#bcountry select').change(function() {
        Spree.updateState('b')
      })
      $('#scountry select').change(function() {
        Spree.updateState('s')
      })
      Spree.updateState('b')

      var orderUseBilling = $('input#order_use_billing')
      orderUseBilling.change(function() {
        updateShippingFormState(orderUseBilling)
      })
      updateShippingFormState(orderUseBilling)
    }

    function updateShippingFormState(orderUseBilling) {
      if (orderUseBilling.is(':checked')) {
        $('#shipping .inner').hide()
        $('#shipping .inner input, #shipping .inner select').prop('disabled', true)
      } else {
        $('#shipping .inner').show()
        $('#shipping .inner input, #shipping .inner select').prop('disabled', false)
        Spree.updateState('s')
      }
    }

    function getCountryId(region) {
      return $('#' + region + 'country select').val()
    }
  }
  Spree.onAddress()
})
