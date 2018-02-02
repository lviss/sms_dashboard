/**
 * Contact.js
 *
 * @description :: a contact represents a person we'll send an sms to, with properties like phone number and name.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    // e.g. "John Smith"
    displayName: {
      type: 'string'
    },

    // e.g. "5555555555"
    phone_number: {
      type: 'string'
    }
  }
};

