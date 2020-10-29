import mongoose from 'mongoose'

class MongoConnection {

  URL: string
  connectionIsLive: boolean

  constructor () {
    this.connectionIsLive = false
    this.URL = ''
  }

  async createConnection (URL: string) {
    try {
     
      await mongoose.connect(URL, {
        useNewUrlParser: true,
        autoReconnect: true,
        reconnectTries: Number.MAX_VALUE,
        bufferMaxEntries: 0
      })
    } catch (error) {
      console.error('error to connect mongo', error.message)
      throw error
    }
  }

  async closeConnection () {
    await mongoose.connection.close()
    this.connectionIsLive = false
  }

  listenEvents () {
    mongoose.connection.on('connected', () => {
      console.log('Mongo connected in', this.URL)
      this.connectionIsLive = true
    })

    mongoose.connection.on('disconnected', () => {
      console.log('Mongo has disconnected')
      this.connectionIsLive = false
    })
  }

  async bootstrap (URL: string) {
    this.URL = URL
    this.listenEvents()
    await this.createConnection(URL)
  }
}

export default new MongoConnection()
