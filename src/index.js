import Parameter from 'parameter';

/**
 * `Paralidate` makes a middelware, which validates the request's data include ctx.params and ctx.request.body
 * If the request is valid then Koa continue run next() middleware.
 * Else, `Paralidate` stops the request and throw an 409 Http Error.
 * @param  {Object} rule :  See Parameter rule configuration https://github.com/node-modules/parameter
 * @param  {String} box: <"params"|"body"> describe how to get data from ctx. "params" to get from ctx.params, "body" to get from ctx.request.body
 * @param {Boolean} noOutDetail: If it's true, ctx will throw the validator errors within the response body. And vice versa.
 * @return {Async Function} A middleware for Koa2
 */

function getBox(ctx, box) {
	if (typeof box == 'function'){
		return box(ctx);
	}
	let source;
	switch(box) {
		case 'body':
			source = ctx.request.body;
			break;
		case 'params':
		default:
			source = ctx.params;
	}
	return source;
}
function getData(source, rule) {
	let keys = Object.keys(rule);
	let data = {};
	for(let key of keys){
		if (source[key] !== undefined){
			if ( isNaN(source[key]) ) {
				data[key] = source[key];
			} else {
				data[key] = 1*source[key];
			}
		}
	}
	return data;
}
function paralidate(rule = {}, opts = {}) {
	opts.box = opts.box || 'params';
	opts.outputType = opts.outputType || 'simple';
	opts.errorCode = opts.errorCode = 409;
	let par = new Parameter();
	return async (ctx, next) => {
		let data = {}, source;
		source = getBox(ctx, opts.box);
		data = getData(source, rule);
		let error = par.validate(rule, data);
		let reqName = typeof opts.box == 'function' ? "Request" : "Request "+opts.box;
		if (error){
			switch(opts.outputType){
				case 'json':
					ctx.set('Content-type','application/json');
					ctx.status = opts.errorCode;
					ctx.body = JSON.stringify(error);
					break;
				case 'complex':
					ctx.throw(opts.errorCode, reqName+" is invalid. \n\nDETAIL:\n"+ JSON.stringify(error) );
					break;
				case 'simple':
				default:
					ctx.throw(opts.errorCode, reqName+" is invalid.");
			}
		} else {
			await next();
		}
	}
}

export default paralidate;