var request = require('superagent-bluebird-promise');

var endpoint = 'https://www.stattleship.com/basketball/nba/';
const header = {
  'Content-Type': 'application/json',
  'Authorization': `Token token=9a64822a8756980cb90c09db8a2bdb2b`,
  'Accept': 'application/vnd.stattleship.com; version=1'
};

var Stattleship = {
  fetch: function (method, options) {
    return request.get(endpoint + method)
      .set(header)
      .query(options)
      .promise()
  }
};

exports.stattleship = Stattleship;
