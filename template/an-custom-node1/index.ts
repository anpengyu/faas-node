import express from 'express'
import http from "http"

import handler from './function/handler'

const app = express();

const middleware = async (req:any, res:any) => {
    res.json(await handler())
};
app.post('/*', middleware);
app.get('/*', middleware);
app.patch('/*', middleware);
app.put('/*', middleware);
app.delete('/*', middleware);
app.options('/*', middleware);
const server = http.createServer(app)
app.listen(3000)
