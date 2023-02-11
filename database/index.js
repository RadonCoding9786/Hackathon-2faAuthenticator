const { MongoClient } = require('mongodb');
require('dotenv').config( { path: ".env" } )

async function main() {
    const mongoClient = new MongoClient(process.env.mongoDBUrl);
    await mongoClient.connect();
    const db = await mongoClient.db('auth')

    user = {
        username: 'test',
        password: 'testpass',
        token: 'tokenstring'
    }

    await db.collection('users').insertOne(user)

};


main()