const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()


const app=express()
const port=process.env.PORT || 5000;


app.use(cors())
app.use(express.json())

app.get('/', (req, res)=>{
    res.send('Resale server connected')
})

app.listen(port,()=>{
    console.log('listening to port:', port);
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.u5tj5cw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        // collections
        const qnaCollection=client.db('Product-resale').collection('qna')


        
        app.get('/qna', async(req, res)=>{
            const query={}
            const result=await qnaCollection.find(query).toArray()
            res.send(result)
        })
    }
    finally{

    }  
}
run().catch(e=>{console.error(e)})
