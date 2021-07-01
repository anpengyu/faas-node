import express from 'express'
import http from 'http'
import handler from './function/handler'

const app = express()

const middleware = async(req:any,res:any)=>{
    res.json(await handler())
}

app.get('/*',middleware)
app.post('/*',middleware)

http.createServer(app)
app.listen('3000')