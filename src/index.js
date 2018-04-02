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
	let source;
	switch(box) {
		case 'body':
			source = ctx.request.body;
			break;
		case 'query':
			source = ctx.request.query;
			break;
		case 'params':
		default:
			source = ctx.params;
			for(let key of Object.keys(source) ){
				if (!isNaN(source[key])){
					source[key] = 1*source[key];
				}
			}
			break;
	}
	return source;
}

function paralidate(rule = {}, opts = {}) {
	opts.box = opts.box || 'params';
	opts.outputType = opts.outputType || 'simple';
	opts.errorCode = opts.errorCode || 400;
	let par = new Parameter();
	return async (ctx, next) => {
		let source = getBox(ctx, opts.box);
		let error = par.validate(rule, source);
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