var util= require("util");


function FilterFactory (results, op) {
	//op= {datatype: "array", only: "col", rowSlice: [], colSlice: []}
	//順序: rowSlice -> colSlice -> only -> datatype

	var self= this;
	self.results= results;
	self.op= op;
}

module.exports= FilterFactory;

FilterFactory.prototype.digest = function() {
	var self= this;
	var op= self.op;

	//check empty
	if(self.checkEmpty())
		return null;

	//check if all r deleted coulmns
	if(self.chkDel())
		return null;

	if(op.rowSlice)
		self.rowSlice(op.rowSlice);

	if(op.colSlice)
		self.colSlice(op.colSlice);

	if(op.only)
		self.filterOnly(op.only);

	if(op.datatype)
		self.transform(op.datatype);

	//if slice row to only one, then return just one onbject
	if(op.rowSlice && op.rowSlice[1]- op.rowSlice[0]===1)
		if(isObject(self.results))
			if(objSize(self.results)===1)
				for(key in self.results){
					self.results[key].key= key;
					self.results= self.results[key];
				}		
		else
			if(self.results.length===1)
				self.results= self.results[0];

	return self.results;
};

FilterFactory.prototype.rowSlice = function(slice) {
	var self= this;
	if(self.results.length===1)
		return;

	self.results= self.results.slice(slice[0], slice[1]);
};

FilterFactory.prototype.colSlice = function(slice) {
	var self= this;
	var array= [];
	self.results.forEach(function(row){
		array.push(row.slice(slice[0], slice[1]));
	});
	self.results= array;
};

FilterFactory.prototype.filterOnly = function(param) {
	var self= this;

	var obj= {};
	self.results.forEach(function(row){
		obj[row.key]= [];
		row.forEach(function(name,value,ts,ttl){
			if(param==="col")
				obj[row.key].push(name);
			else if(param==="val")
				obj[row.key].push(value);
		});
	});

	self.results= obj;
};

FilterFactory.prototype.transform = function(datatype) {
	var self= this;
	if(datatype==="object"){
		if(isObject(self.results))
			return;

		if(util.isArray(self.results)){
			var obj= {};
			self.results.forEach(function(row){
				obj[row.key]= {};
				row.forEach(function(name,value,ts,ttl){
					obj[row.key][name]= value;
				});
			});
		}

		self.results= obj;
	}else if(datatype==="array"){
		if(isObject(self.results)){
			var array= [];
			for(key in self.results){
				if(util.isArray(self.results[key]))
					self.results[key].forEach(function (ele, idx) {
						array.push(ele);
					})
				else
					for(inKey in self.results[key])
						array.push(self.results[key][inKey]);
			}
		}else if(util.isArray(self.results)){
			var array= [];
			self.results.forEach(function(row){
				var obj= {key: row.key};
			  	row.forEach(function(name,value,ts,ttl){
				    obj[name]= value;
				  });
			  	array.push(obj);
			});
		}

		self.results= array;
	}
};

FilterFactory.prototype.checkEmpty = function() {
	var bool= true;
	var self= this;
	
	for (i = self.results.length - 1; i >= 0; i -= 1) {
	    if(self.results[i].count>0)
			bool= false;
		else //also filter out delete rows
			self.results.splice(i,1);
	}

	return bool;
};

FilterFactory.prototype.chkDel = function() {
	//都是null
	//後面再來推翻
	var bool= true; 
	var self= this;
	
	self.results.forEach(function (row) {
		if(row.count>0)  //確認裡面是不是都是null
			row.forEach(function(name,value,ts,ttl){
				if(value !== null)
					bool= false; //not empty
		});
	})

	return bool;
};

//helper

var isObject = function(obj) {
    return Object.prototype.toString.call(obj) == "[object Object]";
};

var objSize= function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};