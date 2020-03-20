
$(document).ready(function(){

	var lv = new LoginValidator();
	var lc = new LoginController();

// main login form //

	$('#login').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			if (lv.validateForm() == false){
				return false;
			} 	else{
			// append 'remember-me' option to formData to write local cookie //
				formData.push({name:'remember-me', value:$('#btn_remember').find('span').hasClass('fa-check-square')});
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') window.location.href = '/';
		},
		error : function(e){
			if (JSON.parse(e.responseText).error == "unactivated") {
				lv.showActivationError('Error while logging in.', 'Your account is unactivated. Please, wait for activation email or request a new one.', $("#user-tf").val());
			}
			else {
				lv.showLoginError('Login Failure', 'Please check your username and/or password');
			}
		}
	}); 

	$("input:text:visible:first").focus();
	$('#btn_remember').click(function(){
		var span = $(this).find('span');
		if (span.hasClass('fa-minus-square')){
			span.removeClass('fa-minus-square');
			span.addClass('fa-check-square');
		}	else{
			span.addClass('fa-minus-square');
			span.removeClass('fa-check-square');
		}
	});

// login retrieval form via email //
	
	var ev = new EmailValidator();
	
	$('#get-credentials-form').ajaxForm({
		url: '/user/lost-password/',
		beforeSubmit : function(formData, jqForm, options){
			if (ev.validateEmail($('#email-tf').val())){
				ev.hideEmailAlert();
				return true;
			}	else{
				ev.showEmailAlert("Please enter a valid email address");
				return false;
			}
		},
		success	: function(responseText, status, xhr, $form){
			$('#cancel').html('OK');
			$('#retrieve-password-submit').hide();
			ev.showEmailSuccess("A link to reset your password was emailed to you.");
		},
		error : function(e){
			if (e.responseText == 'email-not-found'){
				ev.showEmailAlert("Email not found. Are you sure you entered it correctly?");
			}	else{
				$('#cancel').html('OK');
				$('#retrieve-password-submit').hide();
				ev.showEmailAlert("Sorry. There was a problem, please try again later.");
			}
		}
	});
	
	$('#resendEmailForm').ajaxForm({
		url: '/user/signup/resend/',
		beforeSubmit : function(formData, jqForm, options){
			$('#resendEmailModal').modal('hide');
		},
		success	: function(responseText, status, xhr, $form){
			lv.showLoginError('Успех!', 'Мы отправили Вам новый email для подтверждения регистрации! Осталось попыток: ' + responseText);
		},
		error : function(e){
			if (e.responseText == "no-account") {
				lv.showLoginError('Ошибка!', 'Учётная запись не найдена.');
			}
			else if (e.responseText == "already-activated") {
				lv.showLoginError('Ошибка!', 'Ваша учётная запись уже активирована. Если Вы испытываете проблемы с Вашей учётной записью, пожалуйста, обратитесь в <a href="mailto:support@quik.legal">службу поддержки.</a>');
			}
			else if (e.responseText == "too-many-attempts") {
				lv.showLoginError('Ошибка!', 'Вы запросили слишком много писем для подтверждения регистрации. Пожалуйста, обратитесь в <a href="mailto:support@quik.legal">службу поддержки.</a>');
			}
			else {
				lv.showLoginError('Ошибка!', 'На сервере QUIK.Legal что-то пошло не так. Пожалуйста, повторите Вашу попытку позднее');
			}
		}
	}); 
	
});
