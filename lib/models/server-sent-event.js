const bookshelf = require('../utils/bookshelf')

module.exports = bookshelf.Model.extend({
  tableName: 'server_sent_events'
})
