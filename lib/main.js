var util= require("util");
var helenus= require("helenus");
var filterFactory= require("./filter");
var pool= require("./pool");


var isString = function (obj) {
  return toString.call(obj) == '[object String]';
}

var isObject = function(obj) {
    return Object.prototype.toString.call(obj) == "[object Object]";
};


var Cass= function (obj) {
	this.version = require('../package').version;
	this.qryObj= {
		condition: [],
		values: [],
		//datatype: null,
		filters: {}
	};
	this.config= obj;
	this.pool= pool(obj);
};


Cass.prototype.cf= function (columnFamily) {
	var self= this;
	self.qryObj.cf= columnFamily;

	return self;
}

Cass.prototype.get = function(param) {
	var self= this;
	self.qryObj.method= "select";

	if(param==="*")
		self.qryObj.exp= "*";
	else if(util.isArray(param))
		self.qryObj.exp= param.join();

	return self;
};

Cass.prototype.getCols = function() {
	var self= this;
	self.qryObj.method= "select";
	self.qryObj.filters.only= "col";

	if(arguments.length===1 && arguments[0]==="*")
		self.qryObj.exp= "*";
	else if(arguments.length===2){
		self.qryObj.exp= "*";
		self.qryObj.filters.colSlice= [ arguments[0], arguments[1] ];
	}

	return self;
};

Cass.prototype.first = function(param) {
	var self= this;
	self.qryObj.method= "select";

	if(param==="*")
		self.qryObj.exp= "*";
	else if(util.isArray(param))
		self.qryObj.exp= param.join();

	self.qryObj.filters.rowSlice= [0,1];

	return self;
};

Cass.prototype.update = function(param) {
	var self= this;
	var qryArr= [];
	self.qryObj.method= "update";

	for(key in param){
		qryArr.push( key+"=?" );
		self.qryObj.values.push(param[key]);
	}
	self.qryObj.exp= qryArr.join();

	return self;
};

Cass.prototype.insert = function(param) {
	var self= this;
	var qryArr= [];
	self.qryObj.method= "insert";

	for(key in param){
		qryArr.push(key);
		self.qryObj.values.push(param[key]);
	}

	self.qryObj.exp = '(';
	self.qryObj.exp += qryArr.join();
	self.qryObj.exp += ')';

	return self;
};

Cass.prototype.delete = function(param) {
	var self= this;
	self.qryObj.method= "delete";

	if(!param)
		self.qryObj.exp= '';
	else if(util.isArray(param))
		self.qryObj.exp= param.join();
	else if(param==="*")
		self.qryObj.exp= "*";

	return self;
};

Cass.prototype.toArray = function() {
	var self= this;
	self.qryObj.filters.datatype= "array";

	return this;
};

Cass.prototype.toObj = function() {
	var self= this;
	self.qryObj.filters.datatype= "object";

	return this;
};


//where({key: "123"}) or where({key: {eql: "123"}})
//where({key: {in: [col1, col2]}})
//where({age: {gte: 20}})
Cass.prototype.where = function(param) {
	var self= this;

	for(key in param)
		if(isObject(param[key])){
			var arr= [];
			arr.push(key);
			var value= param[key];
			for(key in value){
				switch(key){
					case "eql":
						arr.push("=");
						arr.push("?");
						self.qryObj.values.push(value[key]);
						break;

					case "gt":
						arr.push(">");
						arr.push("?");
						self.qryObj.values.push(value[key]);
						break;

					case "lt":
						arr.push("<");
						arr.push("?");
						self.qryObj.values.push(value[key]);
						break;

					case "gte":
						arr.push(">=");
						arr.push("?");
						self.qryObj.values.push(value[key]);
						break;

					case "lte":
						arr.push("<=");
						arr.push("?");
						self.qryObj.values.push(value[key]);
						break;

					case "in":
						arr.push("in")
						arr.push("(");
						var placeHolders= [];
						for(var i=0; i<value[key].length; i++){
							placeHolders.push("?");
							self.qryObj.values.push(value[key]);
						}
							
						arr.push(placeHolders.join());
						arr.push(")");
				}
			}

			var str= arr.join(" ");
			self.qryObj.condition.push(str);
		}else{
			var arr= [];
			arr.push(key);
			arr.push("=");
			arr.push("?");
			var str= arr.join(" ");
			self.qryObj.condition.push(str);
			self.qryObj.values.push(param[key]);
		}

		return this;
};

Cass.prototype.exec = function(cb) {
	var self= this;
	var arr= [];
	var method= self.qryObj.method;
	if(method==="select"){
		arr.push(self.qryObj.method);
		arr.push(self.qryObj.exp);
		arr.push("from");
		arr.push(self.qryObj.cf);

		if(self.qryObj.condition.length){
			arr.push("where");
			arr.push(self.qryObj.condition.join(" and "));
		}
	}else if(method==="update"){
		arr.push(self.qryObj.method);
		arr.push(self.qryObj.cf);
		arr.push("set");
		arr.push(self.qryObj.exp);

		if(self.qryObj.condition.length){
			arr.push("where");
			arr.push(self.qryObj.condition.join(" and "));
		}
	}else if(method==="insert"){
		arr.push(self.qryObj.method);
		arr.push("into");
		arr.push(self.qryObj.cf);
		arr.push(self.qryObj.exp);
		arr.push("values");

		var str= "(";
		var placeHolders= [];
		for(i=0; i<self.qryObj.values.length; i++)
			placeHolders.push("?");
		str += placeHolders.join();
		str += ")";
		arr.push(str);
		
	}else if(method==="delete"){
		arr.push(self.qryObj.method);
		arr.push(self.qryObj.exp);
		arr.push("from");
		arr.push(self.qryObj.cf);
		arr.push("where");
		arr.push(self.qryObj.condition.join(" and "));
	}
	
	
	var query= arr.join(" ");
	var values= self.qryObj.values;
	var filters= self.qryObj.filters;
	self.pool.acquire(function (err, client) {
		if(err) return cb(err);
		client.cql(query, values, function (err, results) {
			if(err) return cb(err);

			if(results){
				var data= new filterFactory(results, filters);
				cb(null, data);
			}else{
				cb();
			}

				self.pool.release(client);
		});
	})
};

Cass.prototype.clear = function() {
	this.qryObj= {
		condition: [],
		values: [],
		filters: {}
	};

	return this;
};

Cass.prototype.drainPool = function() {
	var self= this;
	self.pool.drain(function() {
	    self.pool.destroyAllNow();
	});
};

module.exports= Cass;

