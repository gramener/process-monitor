/* globals ClipboardJS */

$(function() {
  $.getJSON('train')
    .fail(function () { alert('Could not train model!') })

  // Sync number and range in input
  $('.sync').on('input change', function () {
    var id = '#' + this.id.replace(/-range$/, '')
    $(id).val(this.value)
    $(id + '-range').val(this.value)
  })

  // When any input is changed, classify it
  $('input, select').on('change', function () {
    if (!$('form').get(0).reportValidity())
      return
    $('.copy-link').addClass('d-none')
    var q = $('form').serialize()
    $('[one-hot-name]').each(function () {
      var feature = $(this).attr('one-hot-name')
      $('option', this).each(function () {
        q += '&' + encodeURIComponent(feature + '_' + this.value) + '=' + (this.selected ? '1' : '0')
      })
    })
    $.getJSON('classify?' + q)
      .done(function (data) {
        $('.result').removeClass('Good Bad bg-light').addClass(data[0].result)
        $('.result-text').text(data[0].result)
      })
      .fail(function () {
        $('.result-text').html('in error <small>(see console log)</small>')
        console.log('Classification failure', arguments)  // eslint-disable-line no-console
      })
  }).eq(0).trigger('change')

  // When copy button is clicked, copy permalink to clipboard and navigate to page without reload
  new ClipboardJS('.copy', {
    text: function () {
      var url = location.search ? location.href.replace(location.search, '') : location.href
      url += '?' + $('form').serialize()
      history.pushState({}, document.title, url)
      $('.copy').attr('disabled', true)
      $('.copy-link').removeClass('d-none')
      $('.copy-link a').attr('href', url)
      setTimeout(function () {
        $('.copy').removeAttr('disabled')
        $('.copy-link').addClass('d-none')
      }, 2000)
      return url
    }
  })
})