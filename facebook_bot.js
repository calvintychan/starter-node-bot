var Botkit = require('botkit');
var Stattleship = require('./api/stattleship');
var _ = require('lodash');

// Facebook Messenger
var accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
var verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;
var port = process.env.PORT;

if (!accessToken) throw new Error('FACEBOOK_PAGE_ACCESS_TOKEN is required');
if (!verifyToken) throw new Error('FACEBOOK_VERIFY_TOKEN is required');
if (!port) throw new Error('PORT is required');

var controller = Botkit.facebookbot({
  debug: false,
  access_token: accessToken,
  verify_token: verifyToken
});

var bot = controller.spawn();

controller.setupWebserver(port, function (err, server) {
  if (err) return console.log(err);
  controller.createWebhookEndpoints(server, bot, function () {
    console.log('Server started!');
  });
});

controller.hears(['who are you'], 'message_received', function (bot, message) {
  bot.reply('I am Serena.');
});

controller.hears(['hello'], 'message_received', function (bot, message) {

  bot.startConversation(message, function (err, convo) {
    convo.say('Hello!');
    convo.ask('Are you a Golden States Warriors Fan?', [
      {
        pattern: 'yes',
        callback: function (response, convo) {
          convo.say('Awesome!');
          convo.next();
        }
      },
      {
        pattern: 'no',
        callback: function (response, convo) {
          convo.say('Boooo you!');
          convo.stop();
        }
      }
    ]);

    convo.next();

    convo.on('end', function(convo) {
      bot.reply('Goodbye!');
    });
  });
});

controller.hears(['scores'], 'message_received', function (bot, message) {
  bot.reply(message, 'Let me get you the scores from yesterday. Hold on...');
  Stattleship.fetch('game_logs', { on: 'yesterday' })
    .then(function (err, res) {
      if (err || !res.ok) {
        bot.reply(message, err);
      } else {
        var games = res.body.games;
        bot.reply(message, games.length + ' happened yesterday.');
        if (games.length > 1) {
          _.each(games, function (game) {
            bot.reply(message, game.scoreline);
          });
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

controller.on('message_received', function (bot, message) {
  bot.reply(message, 'Huh?! Sorry, I don\'t understand what you are saying');
})

exports.controller = controller;
