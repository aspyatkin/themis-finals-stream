const bookshelf = require('bookshelf')
const knex = require('./knex')

module.exports = bookshelf(knex)
