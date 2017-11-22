import Parameter from 'parameter';

/**
 * `Paralidate` makes a middelware, which validates the request's data include ctx.params and ctx.request.body
 * If the request is valid then Koa continue run next() middleware.
 * Else, `Paralidate` stops the request and throw an 409 Http Error.
 * @param  {Object} rule] :  See Parameter rule configuration https://github.com/node-modules/parameter
 * @param  {String} box: <"params"|"body"> describe how to get data from ctx. "params" to get from ctx.params, "body" to get from ctx.request.body
 * @param {Boolean} noOutDetail: If it's true, ctx will throw the validator errors within the response body. And vice versa.
 * @return {Async Function} A middleware for Koa2
 */
function paralidate(rule, box, noOutDetail = true) {
	let par = new Parameter();
	return async (ctx, next) => {
		let data = {}, source;
		switch(box) {
			case 'body':
				source = ctx.request.body;
				break;
			case 'params':
			default:
				source = ctx.params;
		}
		let keys = Object.keys(rule);
		for(let key of keys){
			if (source[key] !== undefined)
				data[key] = source[key];
		}
		let error = par.validate(rule, data);
		if (error){
			if (node-modules){
				ctx.throw(409, "Request "+box+" is invalid.");
			} else {
				ctx.throw(409, "Request "+box+" is invalid. \n\nDETAIL\n"+ JSON.stringify(error) );
			}
		} else {
			await next();
		}
	}
}

export default paralidate;