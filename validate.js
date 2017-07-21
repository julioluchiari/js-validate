'use strict'

/**
 * "Class" for fields validation in forms
 *
 * @param  {object} _fields key value objects with their field names and validation rules
 * @return {object}         it self
 */
var Validate = function (_fields) {
  // store all fields with these validation rules
  this._fields = _fields;

  // flag to validation status
  this._valid = true;

  // store all validation error messages
  this._messages = [];

  return this;
}

/**
 * Add a validation error message
 *
 * @param  {string} _message the error message
 * @return {void}
 */
Validate.prototype._addMessage = function (_message) {
  this._messages.push(_message);
}

/**
 * Dinamic run a function by the name defined in 'type' key of validation rules object
 *
 * @param  {string} _field_name the field name
 * @param  {object} _rules      the validation rules of the field
 * @return {void}
 */
Validate.prototype._handle = function (_field_name, _rules) {
  if (typeof this[_rules.type] == 'function') {
    this[_rules.type](_field_name, _rules);
  } else {
    console.log("The function '"+_rules.type+"' does not exists.");
  }
}

/**
 * Run a validation for the field
 *
 * @param  {string} _field_name the field name
 * @param  {object} _rules      the validation rules of the field
 * @return {void}
 */
Validate.prototype._doValidate = function (_field_name, _rules) {
  // validates if the value is blank and if needs to be present
  if (_rules.presence && ! _rules.value) {
    this._addMessage("The field '"+_field_name+"' is required.");
    this._valid = false;
  }

  if (_rules.value) {
    // the field needs a type or a regex
    if (_rules.type) {
      // run the defined function
      this._handle(_field_name, _rules);
    }

    // test the regex
    if (_rules.regex && ! _rules.regex.test(_rules.value)) {
      this._addMessage("The field '"+_field_name+"' do not match with regex.");
      this._valid = false;
    }
  }
}

/**
 * Validate all fields
 *
 * @return {void}
 */
Validate.prototype._validate = function () {
  for (var key in this._fields) {
    var rules = this._fields[key];

    // if the object doesn't have a value, then use the 'data-validate' attribute of an input field
    if (! rules.value) {
      rules.value = document.querySelector("input[data-validate="+key+"]").value;
    }

    var field_name = key;

    // if the object has a name, the use that name to the validation messages
    if (rules.name) {
      field_name = rules.name;
    }

    // run validation for that field
    this._doValidate(key, rules);
  }
}

/**
 * Check number length according to the rules
 *
 * @param  {string}  _field_name the field name
 * @param  {number}  _value      the value of the field
 * @param  {object}  _rules      the object that contains the validation rules of the field
 * @return {boolean}             if the field is valid or not
 */
Validate.prototype._validateNumberLength = function (_field_name, _value, _rules) {
  var validation_status = true;

  // greater than
  if (_rules.gt && _rules.gt > _value) {
    this._addMessage("The field '"+_field_name+"' must be greater than "+_rules.gt+".");
    validation_status = false;
  }

  // greater than or equal to
  if (_rules.gte && _rules.gte >= _value) {
    this._addMessage("The field '"+_field_name+"' must be greater than or equal to "+_rules.gte+".");
    validation_status = false;
  }

  // less than
  if (_rules.lt && _rules.lt < _value) {
    this._addMessage("The field '"+_field_name+"' must be less than "+_rules.lt+".");
    validation_status = false;
  }


  // less than or equal to
  if (_rules.lte && _rules.lte <= _value) {
    this._addMessage("The field '"+_field_name+"' must be less than or equal to "+_rules.lte+".");
    validation_status = false;
  }

  return validation_status;
}

/**
 * Check string length according to the rules
 *
 * @param  {string}  _field_name the field name
 * @param  {object}  _rules      the object that contains the validation rules of the field
 * @return {boolean}             if the field is valid or not
 */
Validate.prototype._validateStringLength = function (_field_name, _rules) {
  var value = _rules.value.length
  var validation_status = true

  // at least
  if (_rules.min && value < _rules.min) {
    this._addMessage("The field '"+_field_name+"' must have at least "+_rules.min+" characters.");
    validation_status = false;
  }

  // up to
  if (_rules.max && value > _rules.max) {
    this._addMessage("The field '"+_field_name+"' must have up to "+_rules.min+" characters.");
    validation_status = false;
  }

  // equal to
  if (_rules.exact && value == _rules.exact) {
    this._addMessage("The field '"+_field_name+"' must have "+_rules.exact+" characters.");
    validation_status = false;
  }

  return validation_status;
}

/**
 * Check if a field is an integer value or not
 *
 * @param  {string}  _field_name the field name
 * @param  {object}  _rules      the object that contains the validation rules of the field
 * @return {boolean}             if the field is valid or not
 */
Validate.prototype.integer = function (_field_name, _rules) {
  var pattern = /^[0-9]*$/;

  if (! pattern.test(_rules.value)) {
    this._addMessage("The field '"+_field_name+"' must have only numbers.");
    this._valid = false;
    return false;
  }

  var value = parseInt(_rules.value);
  // validate length rules
  return this._validateNumberLength(_field_name, value, _rules);
}

/**
 * Check if a field value is monetary or not
 *
 * @param  {string}  _field_name the field name
 * @param  {object}  _rules      the object that contains the validation rules of the field
 * @return {boolean}             if the field is valid or not
 */
Validate.prototype.money = function (_field_name, _rules) {
  var pattern = /^\$?\d+(.\d{3})*(\,\d*)?$/

  if (! pattern.test(_rules.value)) {
    this._addMessage("The field '"+_field_name+"' is not monetary value.");
    this._valid = false;
    return false;
  }

  var value = parseFloat(_rules.value.replace('.', '').replace(',', '.'))
  // validate length rules
  return this._validateNumberLength(_field_name, value, _rules);
}

/**
 * Check if a field value has only letters or not
 * This validation does not include spaces
 *
 * @param  {string}  _field_name the field name
 * @param  {object}  _rules      the object that contains the validation rules of the field
 * @return {boolean}             if the field is valid or not
 */
Validate.prototype.onlyLetters = function (_field_name, _rules) {
  var pattern = /^[a-zA-Z]*$/;

  if (! pattern.test(_rules.value)) {
    this._addMessage("The field '"+_field_name+"' must have only letters.");
    this._valid = false;
    return false;
  }

  // validate length rules
  return this._validateStringLength(_field_name, _rules);
}

/**
 * Check if a field value has only letters and numbers
 * This validation does not include spaces
 *
 * @param  {string}  _field_name the field name
 * @param  {object}  _rules      the object that contains the validation rules of the field
 * @return {boolean}             if the field is valid or not
 */
Validate.prototype.noSpecialCharacters = function (_field_name, _rules) {
  var pattern = /^[0-9a-zA-Z]*$/;

  if (! pattern.test(_rules.value)) {
    this._addMessage("The field '"+_field_name+"' must have only letters and numbers.");
    this._valid = false;
    return false;
  }

  // validate length rules
  return this._validateStringLength(_field_name, _rules);
}

/**
 * Check if a field value is a valid person name
 *
 * @param  {string}  _field_name the field name
 * @param  {object}  _rules      the object that contains the validation rules of the field
 * @return {boolean}             if the field is valid or not
 */
Validate.prototype.personName = function (_field_name, _rules) {
  var pattern = /^[a-zA-Z\u00C0-\u00FF\s\.\-\']+/i;

  if (! pattern.test(_rules.value)) {
    this._addMessage("The field '"+_field_name+"' is not a person name.");
    this._valid = false;
    return false;
  }

  // validate length rules
  return this._validateStringLength(_field_name, _rules);
}

/**
 * Check if a field value is a valid CPF
 *
 * @param  {string}  _field_name the field name
 * @param  {object}  _rules      the object that contains the validation rules of the field
 * @return {boolean}             if the field is valid or not
 */
Validate.prototype.cpf = function (_field_name, _rules) {
  var strCpf = _rules.value.replace(/[^\d]+/g, '');

  var validation_status = true;

  var sum;
	var rest;
	sum = 0;
	if (
    strCpf.length != 11 ||
    strCpf == "00000000000" ||
    strCpf == "11111111111" ||
    strCpf == "22222222222" ||
    strCpf == "33333333333" ||
    strCpf == "44444444444" ||
    strCpf == "55555555555" ||
    strCpf == "66666666666" ||
    strCpf == "77777777777" ||
    strCpf == "88888888888" ||
    strCpf == "99999999999"
  ) {
    validation_status = false;
	} else {
  	for (i = 1; i <= 9; i++) {
      sum = sum + parseInt(strCpf.substring(i - 1, i)) * (11 - i);
  	}

  	rest = sum % 11;

  	if (rest == 10 || rest == 11 || rest < 2) {
      rest = 0;
  	} else {
      rest = 11 - rest;
  	}

  	if (rest != parseInt(strCpf.substring(9, 10))) {
      validation_status = false;
  	} else {
      sum = 0;

      for (i = 1; i <= 10; i++) {
        sum = sum + parseInt(strCpf.substring(i - 1, i)) * (12 - i);
      }
      rest = sum % 11;

      if (rest == 10 || rest == 11 || rest < 2) {
        rest = 0;
      } else {
        rest = 11 - rest;
      }

      if (rest != parseInt(strCpf.substring(10, 11))) {
        validation_status = false;
      }
    }
  }

  if (! validation_status) {
    this._addMessage("The field '"+_field_name+"' is not a valid CPF.");
  }

  return validation_status;
}

/**
 * Check if a field value is a valid CNPJ
 *
 * @param  {string}  _field_name the field name
 * @param  {object}  _rules      the object that contains the validation rules of the field
 * @return {boolean}             if the field is valid or not
 */
Validate.prototype.cnpj = function (_field_name, _rules) {
  var cnpj = _rules.value.replace(/[^\d]+/g, '');
  var validation_status = true;

  if (
    cnpj.length != 14 ||
  	cnpj == '' ||
  	cnpj == "00000000000000" ||
    cnpj == "11111111111111" ||
    cnpj == "22222222222222" ||
    cnpj == "33333333333333" ||
    cnpj == "44444444444444" ||
    cnpj == "55555555555555" ||
    cnpj == "66666666666666" ||
    cnpj == "77777777777777" ||
    cnpj == "88888888888888" ||
    cnpj == "99999999999999"
  ) {
    validation_status = false;
  } else {
    str_length = cnpj.length - 2
    numbers = cnpj.substring(0,str_length);
    digits = cnpj.substring(str_length);
    sum = 0;
    pos = str_length - 7;

    for (i = str_length; i >= 1; i--) {
      sum += numbers.charAt(str_length - i) * pos--;

      if (pos < 2) {
        pos = 9;
      }
    }

    result = sum % 11 < 2 ? 0 : 11 - sum % 11;

    if (result != digits.charAt(0)) {
      this._valid = false;
      validation_status = false;
    } else {
      str_length = str_length + 1;
      numbers = cnpj.substring(0,str_length);
      sum = 0;
      pos = str_length - 7;

      for (i = str_length; i >= 1; i--) {
        sum += numbers.charAt(str_length - i) * pos--;

        if (pos < 2) {
          pos = 9;
        }
      }

      result = sum % 11 < 2 ? 0 : 11 - sum % 11;

      if (result != digits.charAt(1)) {
        this._valid = false;
        validation_status = false;
      }
    }
  }

  if (! validation_status) {
    this._addMessage("The field '"+_field_name+"' is not a valid CNPJ.");
    this._valid = false;
  }

  return validation_status;
}

/**
 * Check if a field value is a valid CPF or CNPJ
 *
 * @param  {string}  _field_name the field name
 * @param  {object}  _rules      the object that contains the validation rules of the field
 * @return {boolean}             if the field is valid or not
 */
Validate.prototype.cpfOrCnpj = function (_field_name, _rules) {
  var value = _rules.value.replace(/[^\d]+/g, '');

  var CPF_LENGTH = 11;
  var CNPJ_LENGTH = 14;

  if (value.length == CPF_LENGTH) {
    return this.cpf(_field_name, _rules);
  } else if (value.length == CNPJ_LENGTH) {
    return this.cnpj(_field_name, _rules);
  } else {
    this._addMessage("The field '"+_field_name+"' is not a valid CPF or CNPJ.");
    this._valid = false;
    return false;
  }
}

/**
 * Check if a field value is a valid email
 *
 * @param  {string}  _field_name the field name
 * @param  {object}  _rules      the object that contains the validation rules of the field
 * @return {boolean}             if the field is valid or not
 */
Validation.prototype.email = function (_field_name, _rules) {
  var pattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i

  if (! pattern.test(_rules.value)) {
    this._addMessage("The field '"+_field_name+"' is not a valid email.");
    this._valid = false;
    return false;
  }

  return true;
}

/**
 * Check is a field value is a valid zipcode
 *
 * @param  {string}  _field_name the field name
 * @param  {object}  _rules      the object that contains the validation rules of the field
 * @return {boolean}             if the field is valid or not
 */
Validation.prototype.zipcode = function (_field_name, _rules) {
  var pattern = /[^\d]+/g;
  var zipcode_length = 0;

  if (! _rules.country) {
    _rules.country = "br";
  }

  switch (_rules.country) {
    case "br":
      zipcode_length = 8; // Example: 09435-470
      var pattern = /[^\d]+/g;
      break;
    default:
      console.error("Invalid country for zipcode validation");
      this._valid = false;
      return false;
  }

  var value = _rules.value.replace(pattern, '');

  if (zipcode_length != value.length) {
    this._addMessage("The field '"+_field_name+"' is not a valid zipcode.");
    this._valid = false;
    return false;
  }

  return true;
}

/**
 * Check if all fields is valid and return it validation status
 *
 * @return {boolean} the validation status
 */
Validate.prototype.isValid = function () {
  this._validate();
  return this._valid;
}

/**
 * Get all validation error messages
 *
 * @return {array} the validation error messages
 */
Validate.prototype.getMessages = function () {
  return this._messages;
}
