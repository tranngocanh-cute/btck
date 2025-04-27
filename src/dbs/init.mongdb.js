'use-strict'

const mongoose = require('mongoose')
const { db: { host, name, port}} = require('../config/config.mongodb')
const connectString = `mongodb://${host}:${port}/${name || 'shopDEV'}`
console.log('Connection string:', connectString);

class Database {
    constructor(){
        this.connect()
    }
    connect(type = 'mongodb') {
        if(1 === 1){
            mongoose.set('debug', true)
            mongoose.set('debug', {color: true})
        }
    mongoose
      .connect(connectString, {
        maxPoolSize: 50,
        family: 4,               //  dùng IPv4
        serverSelectionTimeoutMS: 5000 
      })
      .then((_) => console.log(`Connected Mongodb Success`))
      .catch((err) => console.log(`MongoDB Connect Error:`, err));    }
    static getInstance() {
        if(!Database.instance){
            Database.instance = new Database()
        }
        return Database.instance
    }
}
const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;