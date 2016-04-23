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
  debug: true,
  logLevel: 1,
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
  bot.reply(message, 'I am Serena.');
});

controller.hears(['hello', 'hi', 'hey'], 'message_received', function (bot, message) {
  bot.startConversation(message, function (err, convo) {
    convo.say('Howdy!');
    convo.ask('Did you watch the NBA games yesterday?', [
      {
        pattern: 'yes',
        callback: function (response, convo) {
          convo.say('Lucky you!');
          convo.next();
        }
      },
      {
        pattern: 'no',
        callback: function (response, convo) {
          fetchGames({
            success: function (res) {
              var games = res.body.games;
              convo.say('Bummer. Here are the scores for yesterday\'s games :)');
              _.each(games, function (game, index) {
                convo.say(game.scoreline);
              });
              convo.next();
            }
          });
        }
      }
    ]);

    convo.on('end', function (convo) {
      if (convo.status == 'completed') {
        convo.say('Goodbye.');
      }
    });
  });
});

var fetchGames = function (callbacks) {
  Stattleship.fetch('game_logs', { on: 'yesterday' })
    .then(function (res) {
      callbacks.success(res);
    });
}

controller.hears(['thanks'], 'message_received', function (bot, message) {
  bot.reply(message, 'You are welcome!');
})

controller.on('facebook_postback', function (bot, message) {
});

controller.hears(['help'], 'message_received', function (bot, message) {
  bot.reply(message,
    'Here is what I understand: "What were the scores yesterday?"');
});

controller.on('message_received', function (bot, message) {
  bot.reply(message, 'Sorry, I don\'t understand what you are saying.');
});

exports.controller = controller;
