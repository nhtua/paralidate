# Paralidate - Parameters Validator for Koa Router

Paralidate makes a Koa middelware, which validates the request's data include `ctx.params` and `ctx.request.body`
If the request is valid then Koa continues run the next() middleware.
Else, Paralidate stops the request and throw an 409 Http Error.

Paralidate uses [Parameter](https://github.com/node-modules/parameter) for validating function.

## Required
Paralidate will check `ctx.params` and `ctx.request.body`, so it assumes you already used **koa-router** and **koa-bodyparser**. 
- [koa-router](https://github.com/alexmingoia/koa-router)
- [koa-bodyparser](https://github.com/koajs/bodyparser)

## Usage

This is a very simple Koa Api with `koa-router` and `koa-bodyparser`, which we will change it soon!

```es6
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router 'koa-router';

const app = new Koa();
const router = new Router();


router.get('/', function (ctx, next) {
  // ctx.router available
  ctx.body = 'Hello World!';
});

app
  .use(whiteListOrigin)
  .use(bodyParser({
    enableTypes: ['json'],
    extendTypes: ['application/json'],
    onerror: function (err, ctx) {
      ctx.throw('Body parse error', 422);
    }
  }))
  .use(routers)

app.listen(3000, 'localhost');
console.log(`API Server started at http://localhost:3000`);
```

### Install

Install 
```shell
npm install paralidate --save

# or use yarn

yarn add paralidate
```

Import
```ES6
import paralidate from 'paralidate';
```
or 
```ES5
var paralidate = require('paralidate');
```


### Validate for all route
To apply a rule for all route, place it after the `router` middleware:

```ES6

const validator = paralidate({
  key: {
    type: 'string',
    max: 32
  }
}, 'body', false);

app
  .use(bodyParser({
    enableTypes: ['json'],
    extendTypes: ['application/json'],
    onerror: function (err, ctx) {
      ctx.throw('Body parse error', 422);
    }
  }))
  .use(routers)
  .use(validator)


```

`.user(validator)` ensures all routers must be included the param `key`, which is a string of 32 characters.

### Validate for specific route

To apply the validator for specific router, place it before the router middelware 

```ES6
const validator = paralidate({
  id: {
    type: 'int',
    min: 1,
    max: 10
  }
}, 'params', true);

router.get('/user/:id', validator,function (ctx, next) {
  // ctx.router available
  ctx.body = 'Hello World!';
});
```

The `validator` checks ID params in the request, which is integer and between 1 and 10.

### Paralidate options:

```ES6
const validator = paralidate(rule, box, noOutDetail);
```

Paralidate is a validator factory. It accepts 3 options:
- rule: An object that contains all rules following [The Parameter Rules](https://github.com/node-modules/parameter)
- box: "params" for checking `ctx.params` or "body" for `ctx.request.body`
- noOutDetail: `true` to hide error detail, or `false` to include the errors detail with response body.

### Validate rules:

 Object with format:
```ES
{
	param_name1: 'int', //compact way
	param_name2: 'date',
	param_name3: [1,2,3],
	param_name4: {type: 'enum', values: [1, 2]} //detail way
}
```

  - 'int' => {type: 'int', required: true}
  - 'integer' => {type: 'integer', required: true}
  - 'number' => {type: 'number', required: true}
  - 'date' => {type: 'date', required: true}
  - 'dateTime' => {type: 'dateTime', required: true}
  - 'id' => {type: 'id', required: true}
  - 'boolean' => {type: 'boolean', required: true}
  - 'bool' => {type: 'bool', required: true}
  - 'string' => {type: 'string', required: true, allowEmpty: false}
  - 'email' => {type: 'email', required: true, allowEmpty: false, format: EMAIL_RE}
  - 'password' => {type: 'password', required: true, allowEmpty: false, format: PASSWORD_RE, min: 6}
  - 'object' => {type: 'object', required: true}
  - 'array' => {type: 'array', required: true}
  - [1, 2] => {type: 'enum', values: [1, 2]}
  - /\d+/ => {type: 'string', required: true, allowEmpty: false, format: /\d+/}

	go [here](https://github.com/node-modules/parameter) for more details.
