const bookshelf = require('../util/bookshelf')

module.exports = bookshelf.Model.extend({
  tableName: 'server_sent_events'
})
