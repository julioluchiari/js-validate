'use strict'

var Validate = function (_fields) {
  this._fields = _fields;
  this._valid = true;
  this._messages = [];

  return this;
}

Validate.prototype._addMessage = function (_message) {
  this._messages.push(_message);
}

Validate.prototype._handle = function (_field_name, _rules) {
  if (typeof this[_rules.type] == 'function') {
    this[_rules.type](_field_name, _rules);
  }
}

Validate.prototype._doValidate = function (_field_name, _rules) {
  if (_rules.presence && ! _rules.value) {
    this._addMessage("The field '"+_field_name+"' is required.");
    this._valid = false;
  }

  if (_rules.value) {
    if (_rules.type) {
      this._handle(_field_name, _rules);
    }

    if (_rules.regex && ! _rules.regex.test(_rules.value)) {
      this._addMessage("The field '"+_field_name+"' do not match with regex.");
      this._valid = false;
    }
  }
}

Validate.prototype._validate = function () {
  for (var key in this._fields) {
    var rules = this._fields[key];

    if (! rules.value) {
      rules.value = document.querySelector("input[data-validate="+key+"]");
    }

    var field_name = key;

    if (rules.name) {
      field_name = rules.name;
    }

    this._doValidate(key, rules);
  }
}

Validate.prototype._validateNumberLength = function (_field_name, _value, _rules) {
  var validation_status = true;

  if (_rules.gt && _rules.gt > _value) {
    this._addMessage("The field '"+_field_name+"' must be greater than "+_rules.gt+".");
    validation_status = false;
  }

  if (_rules.gte && _rules.gte >= _value) {
    this._addMessage("The field '"+_field_name+"' must be greater or equal than "+_rules.gte+".");
    validation_status = false;
  }

  if (_rules.lt && _rules.lt < _value) {
    this._addMessage("The field '"+_field_name+"' must be less than "+_rules.lt+".");
    validation_status = false;
  }

  if (_rules.lte && _rules.lte <= _value) {
    this._addMessage("The field '"+_field_name+"' must be less or equal than "+_rules.lte+".");
    validation_status = false;
  }

  return validation_status;
}

Validate.prototype._validateStringLength = function (_field_name, _rules) {
  var value = _rules.value.length
  var validation_status = true

  if (_rules.min && value < _rules.min) {
    this._addMessage("The field '"+_field_name+"' must have at least "+_rules.min+" characters.");
    validation_status = false;
  }

  if (_rules.max && value > _rules.max) {
    this._addMessage("The field '"+_field_name+"' must have up to "+_rules.min+" characters.");
    validation_status = false;
  }

  if (_rules.exact && value == _rules.exact) {
    this._addMessage("The field '"+_field_name+"' must have "+_rules.exact+" characters.");
    validation_status = false;
  }

  return validation_status;
}

Validate.prototype.integer = function (_field_name, _rules) {
  var pattern = /^[0-9]*$/;

  if (! pattern.test(_rules.value)) {
    this._addMessage("The field '"+_field_name+"' must have only numbers.");
    this._valid = false;
    return false;
  }

  var value = parseFloat(_rules.value.replace('.', '').replace(',', '.'))
  return this._validateNumberLength(_field_name, value, _rules);
}

Validate.prototype.money = function (_field_name, _rules) {
  var pattern = /^\$?\d+(.\d{3})*(\,\d*)?$/

  if (! pattern.test(_rules.value)) {
    this._addMessage("The field '"+_field_name+"' is not monetary value.");
    this._valid = false;
    return false;
  }

  var value = parseInt(_rules.value);
  return this._validateNumberLength(_field_name, value, _rules);
}

Validate.prototype.onlyLetters = function (_field_name, _rules) {
  var pattern = /^[0-9]*$/i;

  if (! pattern.test(_rules.value)) {
    this._addMessage("The field '"+_field_name+"' must have only letters.");
    this._valid = false;
    return false;
  }

  return this._validateStringLength(_field_name, _rules);
}

Validate.prototype.noSpecialCharacters = function (_field_name, _rules) {
  var pattern = /^[0-9a-zA-Z]*$/i;

  if (! pattern.test(_rules.value)) {
    this._addMessage("The field '"+_field_name+"' must have only letters and numbers.");
    this._valid = false;
    return false;
  }

  return this._validateStringLength(_field_name, _rules);
}

Validate.prototype.personName = function (_field_name, _rules) {
  var pattern = /^[a-zA-Z\u00C0-\u00FF\s\.\-\']+/i;

  if (! pattern.test(_rules.value)) {
    this._addMessage("The field '"+_field_name+"' is not a person name.");
    this._valid = false;
    return false;
  }

  return this._validateStringLength(_field_name, _rules);
}

Validate.prototype.isValid = function () {
  this._validate();
  return this._valid;
}

Validate.prototype.getMessages = function () {
  return this._messages;
}
