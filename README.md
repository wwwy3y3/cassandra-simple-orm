# NOTICE! DEPRECATED!
#install
	npm install cassandra-simple-orm

#api使用方法
	var cass= require("cassandra-simple-orm");
	cass.config({
            hosts        : ['localhost:9160'],
            keyspace     : 'keyspace',
            timeout      : 3000
        })
	


##先指定column family
	cass().cf("<column family name>")

##再選擇method(get, update, insert, delete)
	cass().cf("user").get("*")
	cass().cf("user").get(["name", "thumb"])
	cass().cf("user").update({name: "hahaha"})
	cass().cf("user").insert({key: "uuidkey", name: "hahaha"}) //insert must specify KEY first, and not allowed to use WHERE
	cass().cf("user").delete() //delete all
	cass().cf("user").delete(["column name"])

##要使用where clause 再加上where, 可以用key 或是 second index
	cass().cf("club").get(["name", "thumb"])
	    .where({key: "77229190-c6e9-11e2-adcb-5f2a5769f204"})

###where有很多用法, 有≥, > , =, ≤, <

*	等於 eql:  	`where({age: 20})` or `where({age: {eql: 20}})`
*	大於 gt:  	`where({age: {gt: 20} })` 
*	小於 lt:  	`where({age: {lt: 20} })` 
*	大於等於 gte:  	`where({age: {gte: 20} })` 
*	小於等於 lte:  	`where({age: {lte: 20} })` 


##最後要執行query 就用exec()
	cass().cf("club").get(["name", "thumb"]).exec(function(err, results){
		//..
		});


##get

###get all from user- `get()`
####get() 可以get全部或是部分columns
	get("*")
	get(["name", "thumb"])

####example:
	cass().cf("user").get("*").exec(function (err, results) {
      	if(err) throw err;
      	//deal with results
      })


###get first element-  `first()`
####first用法跟get一樣, 只是他只會取出第一個row
	cass().cf("user").first("*").exec(function (err, results) {
      	if(err) throw err;
      	//deal with results
      })

###only get coulmns, used in valueless column, `getCols()`
####example:
	cass().cf("club_member").getCols("*").exec(function (err, results) {
      	if(err) throw err;
      	//deal with results
      })

##return
###可以選擇callback回來的row是什麼型態(array, object, Row Object)
###Row object 是 Helenus 的row object, 參考 [Helenus document](https://github.com/simplereach/helenus#row)

###使用方法
在exec前, 加上`toArray()`, `toObj()`, 如果沒加, 就會回傳row object
####example:
	 cass().clear().cf("club").get(["name", "thumb"])
      	  .where({url: {eql: "123123"}})
      	  .toObj()
      	  .exec(function (err, results) {
	      	//
	      })


##update
###`update()`
####傳入想要修改的object
####where需要指定key
	cass().cf("user").update({name: "howhow", email: "123@123.com"})
      	  .where({key: "0aacb3b0-c51d-11e2-b9de-1b8643031865"})
      	  .exec(function (err) {
      	  	//
      	  	})

##insert
###`insert()`
####傳入想要修改的object, 與update不同的地方在於 必需傳入`key`, 不接受此用`where`
	cass().cf("user").insert({key: "0aacb3b0-c51d-11e2-b9de-1b8643031865",name: "howhow123", email: "123@123.com"})
      	 .exec(function (err) {
      	  	//
      	  	})
##delete
###`delete()`
####刪除想要刪除的column, 如果沒傳入變數, key下面的全部column都會被刪除
	cass().cf("user").delete(["extra"])
	      		.where({key: "0aacb3b0-c51d-11e2-b9de-1b8643031865"})
	      		.exec(function (err) {
		      	//
		      })
#####delelte all
	cass().cf("user").delete()
	      		.where({key: "0aacb3b0-c51d-11e2-b9de-1b8643031865"})
	      		.exec(function (err) {
		      	//
		      })
