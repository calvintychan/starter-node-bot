var Botkit = require('botkit');

var accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
var verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;
var port = process.env.PORT;

if (!accessToken) throw new Error('FACEBOOK_PAGE_ACCESS_TOKEN is required');
if (!verifyToken) throw new Error('FACEBOOK_VERIFY_TOKEN is required');
if (!port) throw new ERROR('PORT is required');

var controller = Botkit.facebookbot({
  access_token: accessToken,
  verify_token: verifyToken
});

var bot = controller.spawn();

controller.startServer(port, function (err, server) {
  if (err) return console.log(err);
  controller.createWebhookEndpoints(server, bot, function () {
    console.log('Server started!');
  });
});

controller.hears(['hello', 'hi'], 'message_received', function (bot, message) {
  bot.reply(message, 'Hello!');
  bot.reply(message, 'Good day!');
  bot.reply(message, {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: 'Ready to be productive?',
        buttons: [
          {
            type: 'postback',
            title: 'Yes',
            payload: 'yes'
          },
          {
            type: 'postback',
            title: 'No',
            payload: 'no'
          }
        ]
      }
    }
  });
});

controller.on('facebook_postback', function (bot, message) {
  switch (message.payload) {
    case 'yes':
      bot.reply(message, 'Let\'s get you started!');
      break;
    case 'no':
      bot.reply(message, 'Okay, maybe tomorrow then.');
      break;
  }
});
