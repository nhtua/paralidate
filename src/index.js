import Parameter from 'parameter';

/**
 * `Paralidate` makes a middelware, which validates the request's data include ctx.params and ctx.request.body
 * If the request is valid then Koa continue run next() middleware.
 * Else, `Paralidate` stops the request and throw an 409 Http Error.
 * @param  {Object} rule :  See Parameter rule configuration https://github.com/node-modules/parameter
 * @param  {Object} opts: Config Options 
 *                  opts.box: < "params" | "box" | callback function > the place to get data. Default is "params"
 *                  opts.outputType: < "simple" | "json" | "complex">. Default is 'simple'
 *                  opts.errorCode: HTTP Error Code. Default is 409
 * @return {Async Function} A middleware for Koa2
 */

function getBox(ctx, box) {
	if (typeof box == 'function'){
		return box(ctx);
	}
	let source = {};
	switch(box) {
		case 'body':
			source = ctx.request.body;
			break;
		case 'query':
			source = ctx.request.query;
			break;
		case 'params':
		default:
			for(let mykey of Object.keys(ctx.params) ){
				if (!isNaN(ctx.params[mykey])){
					source[mykey] = 1*ctx.params[mykey];
				}else{
					source[mykey] = ctx.params[mykey];
				}
			}
			break;
	}
	return source;
}
function getData(source, rule) {
	let keys = Object.keys(rule);
	let data = {};
	for(let key of keys){
		if (source[key] !== undefined){
			data[key] = source[key];
		}
	}
	return data;
}
function paralidate(rule = {}, opts = {}) {
	opts.box = opts.box || 'params';
	opts.outputType = opts.outputType || 'simple';
	opts.errorCode = opts.errorCode || 400;
	return async (ctx, next) => {
		let source = getBox(ctx, opts.box);
		let data = getData(source, rule);
		let par = new Parameter();
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