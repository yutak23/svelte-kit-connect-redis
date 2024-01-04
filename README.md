# auth-bearer-parser [![test](https://github.com/yutak23/auth-bearer-parser/actions/workflows/test.yaml/badge.svg)](https://github.com/yutak23/auth-bearer-parser/actions/workflows/test.yaml)

This is a parsing middleware for Bearer tokens that can be used with the Express framework.  
Parse the `Authorization` header and assign the Bearer token to `req.token`.

## Installation

### npm

```sh
$ npm install auth-bearer-parser
```

### yarn

```sh
$ yarn add auth-bearer-parser
```

## Usage

### TypeScript

```ts
import express, { Request, Response } from 'express';
import authBearerParser from 'auth-bearer-parser';

const app = express();
app.use(authBearerParser());
//=> now you have access to req.token, which contains the Bearer token

app.get('/', (req: Request, res: Response) => {
	console.log(req.token);
	...
});
...
```

### JavaScript

#### ES Module

```js
import express from 'express';
import authBearerParser from 'auth-bearer-parser';

const app = express();
app.use(authBearerParser());
//=> now you have access to req.token, which contains the Bearer token

app.get('/', (req, res) => {
	console.log(req.token);
	...
});
...
```

#### CommonJS

Note that you should be `require('...').default`.

```js
const express = require('express');
const authBearerParser = require('auth-bearer-parser').default;

const app = express();
app.use(authBearerParser());
//=> now you have access to req.token, which contains the Bearer token

app.get('/', (req, res) => {
	console.log(req.token);
	...
});
...
```

## API

`authBearerParser(options)` -> `void`

### options

_Optional_  
Type: `object`

#### isThrowError

_Optional_  
Type: `boolean`  
Default: `false`

If true, throw error when bearer token is invalid.  
The error objects thrown are as follows.

| status | message                                                                               |
| ------ | ------------------------------------------------------------------------------------- |
| 401    | authorization header missing                                                          |
| 400    | invalid token type: ${auth-scheme}<br>※`auth-scheme` is `Basic` or `Digest` and so on |
| 401    | token missing                                                                         |

To catch errors thrown and continue processing, the default error handling of express can be changed to any error by extending it. An example is shown below.

```js
import express from 'express';
import authBearerParser from 'auth-bearer-parser';

const app = express();
app.use(authBearerParser({ isThrowError: true })); // throw error when bearer token is invalid

// some kind of processing (API implementation by router, etc.)

// override express default error handlers (https://expressjs.com/en/guide/error-handling.html#writing-error-handlers)
app.use((err, req, res, next) => {
	// you can access property `status` and `message`
	res.status(err.status | 500).json({ message: err.message });
});
```

## License

[MIT licensed](./LICENSE)
