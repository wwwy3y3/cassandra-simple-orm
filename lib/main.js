var util= require("util");
var helenus= require("helenus");


var helenus = require('helenus'),
      pool = new helenus.ConnectionPool({
        hosts      : ['localhost:9160'],
        keyspace   : 'clubond_1_1',
        timeout    : 3000
    });

pool.on('error', function(err){
    console.error(err.name, err.message);
});

var isString = function (obj) {
  return toString.call(obj) == '[object String]';
}

var isObject = function(obj) {
    return obj === Object(obj);
};

var Cass= function () {
	this.version = require('../package').version;
	this.qryObj= {
		condition: [],
		values: []
	};
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
	console.log(query);
	pool.connect(function (err, keyspace) {
		if(err) return cb(err);
		pool.cql(query, self.qryObj.values, cb);
	})
};

Cass.prototype.clear = function() {
	this.qryObj= {
		condition: [],
		values: []
	};

	return this;
};

module.exports= Cass;

