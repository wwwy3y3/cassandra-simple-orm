#api使用方法
##使用前要先new
	var Cass= require("cassandra-simple-orm");
	var cass= new Cass();

##先指定column family
	cass.cf("<column family name>")

##再選擇method(get, update, insert, delete)
	cass.cf("user").get("*")
	cass.cf("user").get(["name", "thumb"])
	cass.cf("user").update({name: "hahaha"})
	cass.cf("user").insert({key: "uuidkey", name: "hahaha"}) //insert must specify KEY first, and not allowed to use WHERE
	cass.cf("user").delete() //delete all
	cass.cf("user").delete(["column name"])

##要使用where clause 再加上where, 可以用key 或是 second index
	cass.cf("club").get(["name", "thumb"])
	    .where({key: "77229190-c6e9-11e2-adcb-5f2a5769f204"})

###where有很多用法, 有≥, > , =, ≤, <
*等於 eql:  	`where({age: 20})` or `where({age: {eql: 20}})`
*大於 gt:  	`where({age: {gt: 20} })` 
*小於 lt:  	`where({age: {lt: 20} })` 
*大於等於 gte:  	`where({age: {gte: 20} })` 
*小於等於 lte:  	`where({age: {lte: 20} })` 


##最後要執行query 就用exec()
	cass.cf("club").get(["name", "thumb"]).exec(function(err, results){
		//..
		});
		
##get
###get all from user
	cass.cf("user").get("*").exec(function (err, results) {
      	if(err) throw err;
      	//deal with results
      })