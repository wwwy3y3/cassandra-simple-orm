var poolModule = require('generic-pool');
var helenus = require('helenus');
var pool= null;

module.exports= function (obj) {
    if(!pool){
        pool = poolModule.Pool({
            name     : 'cassandra',
            create   : function(callback) {
                var helenus_pool = new helenus.ConnectionPool(obj);

                helenus_pool.on('error', function(err){
                    callback(err);
                });

                helenus_pool.connect(function (err, keyspace) {
                    callback(null, helenus_pool);
                });
            },
            destroy  : function(helenus_pool) { helenus_pool.close(); },
            max      : 10,
            // optional. if you set this, make sure to drain() (see step 3)
            min      : 2, 
            // specifies how long a resource can stay idle in pool before being removed
            idleTimeoutMillis : 30000,
             // if true, logs via console.log - can also be a function
            log : false 
        });
    }

    return pool;
};