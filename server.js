
var vcapServices = require('vcap_services');
var express = require("express");
var bodyParser = require("body-parser");
var MongoClient = require("mongodb").MongoClient;
var app = express();
let url;
var credentials = vcapServices.getCredentials('mlab');
url=credentials.uri;

if (url==null)
url="mongodb://127.0.0.1/test"
//url="mongodb://mongo:27017/"
//url="mongodb+srv://ashnaprasad:ashna123@cluster0.guyov.mongodb.net/test?retryWrites=true&w=majority"
var urlencodedParser = bodyParser.urlencoded({ extended: false });

MongoClient.connect(url, {native_parser:true},function (err, db) {
    if(!err)
    {

    console.log("Connected to Database");
    app.use(express.static('public'));
    app.use(bodyParser.json());

    app.get('/index.html', function (req, res) {
        res.sendFile( __dirname + "/" + "index.html" );
    })

    app.get('/insert.html', function (req, res) {
        res.sendFile( __dirname + "/" + "insert.html" );
    })

//-----------------------POST METHOD-------------------------------------------------
app.post('/process_post', function (req, res) {
    console.log(req.body);
    res.setHeader('Content-Type', 'text/html');
    req.body.serverMessage = "NodeJS replying to angular"
    var id = req.body.id;
    var name = req.body.name;
    var price = req.body.price;

	//To avoid duplicate entries in MongoDB
	db.collection('menus').createIndex({"id":1},{unique:true});
	/*response has to be in the form of a JSON*/
	db.collection('menus').insertOne({id:id,name:name,price:price}, (err, result) => {
                    if(err)
					{
						console.log(err.message);
						res.send("Duplicate Item ID")
					}
					else
					{
                    console.log("Sent data are (POST): ID :"+id+", Name :"+name+", Price:"+price);
                    console.log('Inserted into Menu');
		    res.end("Inserted-->"+JSON.stringify(req.body));
					}
                })

    });

//--------------UPDATE------------------------------------------
app.get('/update.html', function (req, res) {
    res.sendFile( __dirname + "/" + "update.html" );
})

app.post("/update", function(req, res) {
    var id=req.body.id;
    var select=req.body.select;
    var value=req.body.value;
    if(select=='ID'){
        db.collection('menus', function (err, data) {
            data.update({"id":id},{$set:{"id":value}},{multi:true},
                function(err, obj){
                    if (err) {
                        console.log("Failed to update data.");
                } else {
                    if (obj.result.n==1)
                    {
                    res.end("ID "+id+"'s ID Updated---> "+JSON.stringify(req.body));
                    console.log("Item Updated")
                    console.log(req.body)
                    }
                    else
                        res.send("Item Not Found")
                }
            });
        });
    }
    else if(select=='Name'){
        db.collection('menus', function (err, data) {
            data.update({"id":id},{$set:{"name":value}},{multi:true},
                function(err, obj){
                    if (err) {
                        console.log("Failed to update data.");
                } else {
                    if (obj.result.n==1)
                    {
                    res.end("ID "+id+"'s Name Updated---> "+JSON.stringify(req.body));

                    console.log("Item Updated")
                    console.log(req.body)
                    }
                    else
                        res.send("Item Not Found")
                }
            });
        });
    }
    else if(select=='Price'){
        db.collection('menus', function (err, data) {
            data.update({"id":id},{$set:{"price":value}},{multi:true},
                function(err, obj){
                    if (err) {
                        console.log("Failed to update data.");
                } else {
                    if (obj.result.n==1)
                    {
                    res.end("ID "+id+"'s Price Updated---> "+JSON.stringify(req.body));
                    console.log("Item Updated")
                    console.log(req.body)
                    }
                    else
                        res.send("Item Not Found")
                }
            });
        });
    }
   
})

//--------------SEARCH------------------------------------------

app.get('/search.html', function (req, res) {
    res.sendFile( __dirname + "/" + "search.html" );
 })

 app.post("/search", function(req, res) {
	var id=req.body.id;
    db.collection('menus').find({id: id},{_id:0}).toArray(function(err, docs) {
    if (err) {
      console.log(err.message+ "Failed to get data.");
    }
    else if(docs.length>0){
         console.log(docs);
		 res.send(JSON.stringify(docs));

    }
    else {
        console.log("Item not found");
      res.end("Item not found");
    }
  });
  });

// --------------To find "Single Document"-------------------

//--------------DELETE------------------------------------------
app.get('/delete.html', function (req, res) {
    res.sendFile( __dirname + "/" + "delete.html" );
 })

 app.post("/delete", function(req, res) {
    console.log(req.body);
	res.setHeader('Content-Type', 'text/html');
    req.body.serverMessage = "NodeJS replying to angular"
     var id=req.body.id;
     db.collection('menus', function (err, data) {
         data.remove({"id":id},function(err, obj){
                 if (err) {
                     console.log("Failed to remove data.");
             } else {
                 if (obj.result.n>=1)
                 {
                    res.end("Item deleted-->"+JSON.stringify(req.body));
                    console.log("Item Deleted")
                 }
                 else{
                     res.send("Item Not Found")
                     console.log('Item not found')
                 }
             }
         });
     });

   });

//-------------------DISPLAY-----------------------
app.get('/display', function (req, res) {
    console.log("Items displayed")
     db.collection('menus').find().sort({id:1}).toArray(
             function(err , i){
            if (err) return console.log(err)
            res.render('display.ejs',{comp: i})
         })
    })
    var server = app.listen(8080, function () {
        var host = server.address().address
        var port = server.address().port
        console.log("Dummy app listening at http://%s:%s", host, port)
        })

}
else {

    console.log("not connected",url);
    //db.close()

}

});
