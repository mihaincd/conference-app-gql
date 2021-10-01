const { SQLDataSource } = require('../../utils/sqlDataSource')

const commonColumn = ['Id', 'Name', 'Code']

class DictionaryDb extends SQLDataSource {
  async getTypeList() {
    const result = await this.knex.select(...commonColumn).from('DictionaryConferenceType')
    return result
  }
  async getCategoryList() {
    const result = await this.knex.select(...commonColumn).from('DictionaryCategory')
    return result
  }
  async getCountryList() {
    const result = await this.knex.select(...commonColumn).from('DictionaryCountry')
    return result
  }
  async getCountyList() {
    const result = await this.knex.select(...commonColumn).from('DictionaryCounty')
    return result
  }
  async getCityList() {
    const result = await this.knex.select(...commonColumn).from('DictionaryCity')
    return result
  }
}

module.exports = DictionaryDb
