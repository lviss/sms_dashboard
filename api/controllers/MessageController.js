/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  
  // POST
  create: function(req, res) {
    var params = req.params.all();
    if (req.isSocket && req.method === 'POST') {
      Message.create(params).exec(function(err, newMessage) {
        if (err) return res.badRequest(err);
        //Message.publish(newMessage.id, newMessage, req);
        Message.publishCreate(newMessage, req);
        res.ok(newMessage);
      });
    } // else we need to handle a message sent from twilio maybe? TODO
  }
};

