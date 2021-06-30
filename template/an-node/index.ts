// import express from 'express'
// import http from "http";

// import bodyParser from "body-parser";
import handler from './function/handler';
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const defaultMaxSize = '100kb' // body-parser default

app.disable('x-powered-by');

const rawLimit = process.env.MAX_RAW_SIZE || defaultMaxSize
const jsonLimit = process.env.MAX_JSON_SIZE || defaultMaxSize

app.use(function addDefaultContentType(req: { headers: { [x: string]: string; }; }, res: any, next: () => void) {
    // When no content-type is given, the body element is set to 
    // nil, and has been a source of contention for new users.

    if(!req.headers['content-type']) {
        req.headers['content-type'] = "text/plain"
    }
    next()
})

if (process.env.RAW_BODY === 'true') {
    app.use(bodyParser.raw({ type: '*/*' , limit: rawLimit }))
} else {
    app.use(bodyParser.text({ type : "text/*" }));
    app.use(bodyParser.json({ limit: jsonLimit}));
    app.use(bodyParser.urlencoded({ extended: true }));
}

const isArray = (a: { constructor: ArrayConstructor; }) => {
    return (!!a) && (a.constructor === Array);
};

const isObject = (a: { constructor: ObjectConstructor; }) => {
    return (!!a) && (a.constructor === Object);
};

class FunctionEvent {
    body: any;
    headers: any;
    method: any;
    query: any;
    path: any;

    constructor(req: { body: any; headers: any; method: any; query: any; path: any; }) {
        this.body = req.body;
        this.headers = req.headers;
        this.method = req.method;
        this.query = req.query;
        this.path = req.path;
    }
}

class FunctionContext {
    statusCode: number;
    cb: any;
    headerValues: {};
    cbCalled: number;
    constructor(cb: (err: { toString: () => any; }, functionResult: any) => any) {
        this.statusCode = 200;
        this.cb = cb;
        this.headerValues = {};
        this.cbCalled = 0;
    }

    status(statusCode: number | undefined) {
        if(!statusCode) {
            return this.statusCode;
        }

        this.statusCode = statusCode;
        return this;
    }

    headers(value: {} | undefined) {
        if(!value) {
            return this.headerValues;
        }

        this.headerValues = value;
        return this;    
    }

    succeed(value: any) {
        let err;
        this.cbCalled++;
        this.cb(err, value);
    }

    fail(value: any) {
        let message;
        // if(this.status() == "200") {
            this.status(500)
        // }

        this.cbCalled++;
        this.cb(value, message);
    }
}

const middleware = async (req:any, res:any) => {
    const cb = (err: { toString: () => any; }, functionResult: any) => {
        if (err) {
            console.error(err);

            return res.status(fnContext.status())
                .send(err.toString ? err.toString() : err);
        }

        if(isArray(functionResult) || isObject(functionResult)) {
            res.set(fnContext.headers())
                .status(fnContext.status()).send(JSON.stringify(functionResult));
        } else {
            res.set(fnContext.headers())
                .status(fnContext.status())
                .send(functionResult);
        }
    };

    const fnEvent = new FunctionEvent(req);
    const fnContext:any = new FunctionContext(cb);

    console.log('/.....................')
    Promise.resolve(handler(fnEvent, fnContext))
    .then(res => {
        if(!fnContext.cbCalled) {
            fnContext.succeed(res);
        }
    })
    .catch(e => {
        // cb(e);
    });
};

app.post('/*', middleware);
app.get('/*', middleware);
app.patch('/*', middleware);
app.put('/*', middleware);
app.delete('/*', middleware);
app.options('/*', middleware);

const port = process.env.http_port || 3000;

app.listen(port, () => {
    console.log(`node14 listening on port: ${port}`)
});


