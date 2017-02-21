$(document).ready(function() {
  $("#mainBtn").click(function (){
    $("#form").validate({
      debug: true,
      rules: {
        inputName: {
          required: true
        },
        inputEmail: {
          required:true,
          email: true
        },
        inputExplain: {
          required: true,
          minlength: 20
        }
      },
      messages: {
        inputName: {
          required: "Por favor especifique su nombre completo."
        },
        inputEmail: {
          required: "Por favor especifique su correo electrónico.",
          email: "El formato de correo electrónico no es válido. (Ejemplo: mail@dominio.com)"
        },
        inputExplain: {
          required: "Por favor especifique su razón.",
          minlength: jQuery.validator.format("Por lo menos {0} caracteres son necesarios.")
        }
      },
      highlight: function(element, errorClass, validClass) {
      $(element).addClass(errorClass).removeClass(validClass);
      $(element.form).find("label[for=" + element.id + "]")
        .addClass(errorClass);
      },
      unhighlight: function(element, errorClass, validClass) {
        $(element).removeClass(errorClass).addClass(validClass);
        $(element.form).find("label[for=" + element.id + "]")
          .removeClass(errorClass);
      },
      // success: "valid",
      submitHandler: function(form) {
        $("div.alert.alert-warning").hide();
        form.submit();
      },
      errorPlacement: function(error, element) {
        // var txt = "<span class='label label-war<ning'></span>";
        error.css("color", "red;").appendTo(element.parent());
      },
      invalidHandler: function(event, validator) {
      // 'this' refers to the form
      var errors = validator.numberOfInvalids();
      if (errors) {
        var message = errors == 1
          ? 'Hay un campo con error. Por favor, verifique.'
          : 'Hay ' + errors + ' campos con errores. Por favor, verifique.';
        $("div.alert.alert-warning").text(message).css("color", "black");
        $('html, body').animate({ scrollTop: 0 }, 'slow');
        $("div.alert.alert-warning").show();
        } else {
          $("div.alert.alert-warning").hide();
        }
      }
    }).form();
  })
})
