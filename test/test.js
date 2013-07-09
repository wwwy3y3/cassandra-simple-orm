var Cass= require("../index");
var helenus= require("helenus");
var uuid= require("node-uuid");
var should= require("should");

describe('Select', function(){
  describe('#get', function(){
  	var cass= new Cass();
    it('should get all user, return a object', function(done){
      
      cass.cf("user").get("*")
      	  .toObj()
      	  .exec(function (err, results) {
      	if(err) throw err;
      	console.log(results);
		done();
      })
    })

    it('should get one user, return a object', function(done){
      
      cass.clear().cf("user").first("*")
      	  .where({account: "li.bear@ymail.com"})
      	  .toObj()
      	  .exec(function (err, results) {
      	if(err) throw err;
      	console.log(results);
		done();
      })
    })

    it('should get club members, return array', function(done){
      
      cass.clear().cf("club_member").getCols("*")
      	  .where({key: "77229190-c6e9-11e2-adcb-5f2a5769f204"})
      	  .toArray()
      	  .exec(function (err, results) {
      	if(err) throw err;
      	console.log(results);
		done();
      })
    })

    it('should get club apps, return obj', function(done){
      
      cass.clear().cf("club_apps").get("*")
      	  .where({key: "a8d166a0-8e11-11e2-94a1-31a36788c8a5"})
      	  .toObj()
      	  .exec(function (err, results) {
      	if(err) throw err;
      	console.log(results);
		done();
      })
    })

    it('should get club apps, return obj', function(done){
      
      cass.clear().cf("club_apps").get("*")
      	  .where({key: "a8d166a0-8e11-11e2-94a1-31a36788c8a5"})
      	  .toObj()
      	  .exec(function (err, results) {
      	if(err) throw err;
      	console.log(results);
		done();
      })
    })

    it('should get selected columns', function(done){
      
      cass.clear().cf("club").get(["name", "thumb"])
      	  .where({key: "77229190-c6e9-11e2-adcb-5f2a5769f204"})
      	  .exec(function (err, results) {
	      	if(err) throw err;
	      	console.log(results);
			done();
	      })
    })

    it('should get selected columns, return original rows object', function(done){
      cass.clear().cf("club").get(["name", "thumb"])
      	  .where({key: "77229190-c6e9-11e2-adcb-5f2a5769f204"})
      	  .exec(function (err, results) {
	      	if(err) throw err;
	      	console.log(results);
			done();
	      })
  })

    it('should get selected columns, return object', function(done){
      cass.clear().cf("club").get(["name", "thumb"])
      	  .where({key: "77229190-c6e9-11e2-adcb-5f2a5769f204"})
      	  .toObj()
      	  .exec(function (err, results) {
	      	if(err) throw err;
	      	console.log(results);
			done();
	      })
  })

    it('should get selected columns, return object', function(done){
      
      cass.clear().cf("club").get(["name", "thumb"])
      	  .where({url: {eql: "123123"}})
      	  .toObj()
      	  .exec(function (err, results) {
	      	if(err) throw err;
	      	console.log(results);
			done();
	      })
    })

    it('should get selected columns where key in, return array', function(done){
      
      cass.clear().cf("user").get(["name", "thumb"])
      	  .where({key: {in: ["0aacb3b0-c51d-11e2-b9de-1b8643031865", "07e002a0-8e08-11e2-9bcf-033be9f2a618"]}})
      	  .toArray()
      	  .exec(function (err, results) {
	      	if(err) throw err;
	      	console.log(results);
			done();
	      })
    })

  })

 
})

describe('update', function () {
	describe('#update Selected columns where key = ?', function(){
  	var cass= new Cass();
    it('should update selected columns', function(done){
      
      cass.cf("user").update({name: "howhow"})
      	  .where({key: "0aacb3b0-c51d-11e2-b9de-1b8643031865"})
      	  .exec(function (err) {
	      	if(err) throw err;
	      	cass.clear().cf("user").get(["name"])
	      		.where({key: "0aacb3b0-c51d-11e2-b9de-1b8643031865"})
	      		.exec(function (err, results) {
		      	if(err) throw err;
		      	results.forEach(function(row){
				  	row.get("name").value.should.equal("howhow");
				});
				done();
		      })
    		})
  })
})

describe('#update Selected columns where key = ?', function(){
  	var cass= new Cass();
    it('should update selected columns', function(done){
      
      cass.cf("user").update({name: "howhow", email: "123@123.com"})
      	  .where({key: "0aacb3b0-c51d-11e2-b9de-1b8643031865"})
      	  .exec(function (err) {
	      	if(err) throw err;
	      	cass.clear().cf("user").get(["email", "name"])
	      		.where({key: "0aacb3b0-c51d-11e2-b9de-1b8643031865"})
	      		.exec(function (err, results) {
		      	if(err) throw err;
		      	results.forEach(function(row){
				  	row.get("email").value.should.equal("123@123.com");
				  	row.get("name").value.should.equal("howhow");
				});
				done();
		      })
    		})
  })
})

})

describe('insert', function () {
	describe('#Selected columns where key = ?', function(){
  	var cass= new Cass();
    it('should insert columns', function(done){
      
      cass.cf("user").insert({key: "0aacb3b0-c51d-11e2-b9de-1b8643031865",name: "howhow123", email: "123@123.com"})
      	  .exec(function (err) {
	      	if(err) throw err;
	      	cass.clear().cf("user").get(["email", "name"])
	      		.where({key: "0aacb3b0-c51d-11e2-b9de-1b8643031865"})
	      		.exec(function (err, results) {
		      	if(err) throw err;
		      	results.forEach(function(row){
				  	row.get("email").value.should.equal("123@123.com");
				  	row.get("name").value.should.equal("howhow123");
				});
				done();
		      })
    		})
  })
})


})


describe('delete', function () {
	describe('#insert an extra, and delete it', function(){
  	var cass= new Cass();
    it('should delete columns', function(done){
      
      cass.cf("user").insert({key: "0aacb3b0-c51d-11e2-b9de-1b8643031865", extra: "123123"})
      	  .exec(function (err) {
	      	if(err) throw err;
	      	cass.clear().cf("user").delete(["extra"])
	      		.where({key: "0aacb3b0-c51d-11e2-b9de-1b8643031865"})
	      		.exec(function (err) {
		      	if(err) throw err;
				done();
		      })
    		})
  })
})
})
