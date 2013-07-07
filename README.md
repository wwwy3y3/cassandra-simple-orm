#api使用方法
##get
###get all from user
	cass.cf("user").get("*").exec(function (err, results) {
      	if(err) throw err;
      	//deal with results
      })