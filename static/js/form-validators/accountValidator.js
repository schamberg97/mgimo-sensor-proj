
function AccountValidator()
{
// build array maps of the form inputs & control groups //
//							0				1				2				3				4					5					6						7					8					9
	this.formFields = [$('#name-tf'), $('#email-tf'), $('#user-tf'), $('#pass-tf'), $('#nameLast-tf'), $('#nameFirst-tf'), $('#nameMiddle-tf'), $('#company-tf'), $('#companyPosition-tf'), $('#oldPass-tf')];
	this.controlGroups = [$('#name-cg'), $('#email-cg'), $('#user-cg'), $('#pass-cg'), $('#nameLast-cg'), $('#nameFirst-cg'), $('#nameMiddle-cg'), $('#company-cg'), $('#companyPosition-cg'), $('#oldPass-cg')];
	
// bind the form-error modal window to this controller to display any errors //
	
	this.alert = $('.modal-form-errors');
	this.alert.modal({ show : false, keyboard : true, backdrop : true});
	
	this.validateName = function(s)
	{
		return s.length >= 3;
	}
	
	this.validatePassword = function(s)
	{
	// if user is logged in and hasn't changed their password, return ok
		if ($('#userId').val() && s===''){
			return true;
		}	else{
			return s.length >= 9;
		}
	}
	
	this.validateOldPassword = function(s)
	{
		if (!$('#pass-tf').val()) {
			return true;
		}
		else if ($('#pass-tf').val() && s.length >= 1){
			return true;
		}
		else {
			return false;
		}
	}
	
	this.validateCompany = function(s)
	{
		return s.length >= 3;
	}
	
	this.validateFirstName = function(s) {
		return s.length >= 2;
	}
	
	this.validateMiddleName = function(s) {
		return s.length >= 6;
	}
	
	this.validateLastName = function(s) {
		return s.length >= 1;
	}
	
	this.validateEmail = function(e)
	{
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(e);
	}
	
	this.validateDate = function(str) {
		str = str.replace(/\//g, '-');
		// replaces "/"
		str = str.replace(/\./g, '-');
		// replaces "."
		if (isISO8601(str) == false){
			return false;
		}
		else if (isISO8601(str) == true)	{
			var todaysDate = new Date();
			var pickedDate = Date.parse(str);
			if (pickedDate <= todaysDate) {
				return true;
			}
			else {
				return false;
			}
		}	
	}
	
	this.showErrors = function(a)
	{
		$('.modal-form-errors .modal-body p').text('Please correct the following problems :');
		var ul = $('.modal-form-errors .modal-body ul');
			ul.empty();
		for (var i=0; i < a.length; i++) ul.append('<li>'+a[i]+'</li>');
		this.alert.modal('show');
	}

}

AccountValidator.prototype.showInvalidEmail = function()
{
	this.controlGroups[1].addClass('error');
	this.showErrors(['That email address is already in use.']);
}

AccountValidator.prototype.showInvalidUserName = function()
{
	this.controlGroups[2].addClass('error');
	this.showErrors(['That username is already in use.']);
}

AccountValidator.prototype.validateForm = function()
{
	var e = [];
	for (var i=0; i < this.controlGroups.length; i++) this.controlGroups[i].removeClass('error');
	if (this.validateEmail(this.formFields[1].val()) == false) {
		this.controlGroups[1].addClass('error'); e.push('Please Enter A Valid Email');
	}
	if (this.validateName(this.formFields[2].val()) == false) {
		this.controlGroups[2].addClass('error');
		e.push('Please Choose A Username');
	}
	if (this.validatePassword(this.formFields[3].val()) == false) {
		this.controlGroups[3].addClass('error');
		e.push('Password Should Be At Least 9 Characters');
	}
	if (this.validateLastName(this.formFields[4].val()) == false) {
		this.controlGroups[4].addClass('error');
		e.push('Last Name Should Be At Least 1 Character');
	}
	if (this.validateFirstName(this.formFields[5].val()) == false) {
		this.controlGroups[5].addClass('error');
		e.push('First Name Should Be At Least 2 Characters');
	}
	if (this.validateMiddleName(this.formFields[6].val()) == false) {
		this.controlGroups[6].addClass('error');
		e.push('Middle Name Should Be At Least 6 Characters');
	}
	if (this.validateCompany(this.formFields[7].val()) == false) {
		this.controlGroups[7].addClass('error');
		e.push('Please, enter valid company name!');
	}
	if (this.validateCompany(this.formFields[8].val()) == false) {
		this.controlGroups[8].addClass('error');
		e.push('Please, enter valid company position!');
	}
	if (this.validateOldPassword(this.formFields[9].val()) == false) {
		this.controlGroups[9].addClass('error');
		e.push('Please, enter your old password');
	}
	if (e.length) this.showErrors(e);
	return e.length === 0;
}

var iso8601 = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;


function isISO8601(str) {
	var d = new Date();
	var check = iso8601.test(str);
	if (!check) {
		return false;
	}
	if (!isValidDate(str)) {
  		return false;
  	}
  	else if (parseInt(str.substr(0, 4), 10) > d.getFullYear() && parseInt(str.substr(5, 2), 10) > d.getMonth() + 1 && parseInt(str.substr(8, 2), 10) > d.getDate() ) {
  		return false;
  	}
  	else {
  		return true;
  	}
}

var isValidDate = function isValidDate(str) {
  // str must have passed the ISO8601 check
  // this check is meant to catch invalid dates
  // like 2009-02-31
  // first check for ordinal dates
  var ordinalMatch = str.match(/^(\d{4})-?(\d{3})([ T]{1}\.*|$)/);

  if (ordinalMatch) {
    var oYear = Number(ordinalMatch[1]);
    var oDay = Number(ordinalMatch[2]); // if is leap year

    if (oYear % 4 === 0 && oYear % 100 !== 0) return oDay <= 366;
    return oDay <= 365;
  }

  var match = str.match(/(\d{4})-?(\d{0,2})-?(\d*)/).map(Number);
  var year = match[1];
  var month = match[2];
  var day = match[3];
  var monthString = month ? "0".concat(month).slice(-2) : month;
  var dayString = day ? "0".concat(day).slice(-2) : day; // create a date object and compare

  var d = new Date("".concat(year, "-").concat(monthString || '01', "-").concat(dayString || '01'));
  if (isNaN(d.getUTCFullYear())) return false;

  if (month && day) {
    return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
  }
  else {
  	return true;
  }
};

