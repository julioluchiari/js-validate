'use strict'

var Validate = function (fields) {
  this._fields = fields
  this._valid = true

  return this
}

Validate.prototype.handle = function (rules) {
  var __fn = this[rules.type]

  if (typeof __fn == 'function') {
    __fn(rules)
  }
}

Validate.prototype.doValidate = function (rules) {
  if (rules.value) {
    if (rules.type) {
      this.handle(rules)
    }

    if (rules.regex && ! rules.regex.test(rules.value)) {
      this._valid = false
    }
  }

  if (rules.presence && ! rules.value) {
    this._valid = false
  }
}

Validate.prototype.validate = function () {
  for (var key in this._fields) {
    var rules = this._fields[key]

    if (! rules.value) {
      rules.value = document.querySelector("input[data-validate="+key+"]")
    }

    this.doValidate(rules)
  }
}

Validate.prototype.integer = function (field) {
  var pattern = /^[0-9]*$/

  this.doValidate(pattern, field)

  return this
}

Validate.prototype.onlyLetters = function (field) {
  var pattern = /^[a-zA-Z]*$/

  this.doValidate(pattern, field)

  return this
}

Validate.prototype.noSpecialCharacters = function (field) {
  var pattern = /^[0-9a-zA-Z]*$/

  this.doValidate(pattern, field)

  return this
}

Validate.prototype.isValid = function () {
  return this._valid
}
