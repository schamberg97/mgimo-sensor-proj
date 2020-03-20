
function LoginValidator()
{
// bind a simple alert window to this controller to display any errors //
	this.loginErrors = $('.modal-alert');
	
	this.showLoginError = function(t, m)
	{
		$('.modal-alert .modal-header h4').text(t);
		$('.modal-alert .modal-body').html(m);
		this.loginErrors.modal('show');
	}
	this.showActivationError = function(t, m, user)
	{
		
		$('#dynModal .modal-footer').prepend('<button id="resendEmailBtn" class="btn btn-primary" type="submit" style="width: 240px"><i class="fas fa-at"></i>&nbsp;Resend email</button>');
		this.showLoginError(t, m);
		$("#ok").on("click", function() {
  			$("#resendEmailBtn").remove();
		});
		$('#resendEmailBtn').on('click', function(){
			$("#resendEmailBtn").remove();
			$('.modal-alert').modal('hide');
			$('#cancelResend').html('Cancel');
			$('#resendEmailSubmit').show();
			$('#resendEmailModal').modal('show');
		})
	}
}

LoginValidator.prototype.validateForm = function()
{
	if ($('#user-tf').val() == ''){
		this.showLoginError('Whoops!', 'Please enter a valid username');
		return false;
	}	else if ($('#pass-tf').val() == ''){
		this.showLoginError('Whoops!', 'Please enter a valid password');
		return false;
	}	else{
		return true;
	}
}