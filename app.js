const express=require('express');
const app = express();
const path = require('path');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
const res = require('express/lib/response');
const viewpath =path.join(__dirname, './view');
const port=process.env.PORT||3200;

app.set('view engine', 'ejs');
app.set('views',viewpath);

app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/apiDB');

const fileSchema ={
    title:String,
    content:String,
}

const Articlelist= mongoose.model('article',fileSchema);

const item1=new Articlelist({
    title:'one', 
    content:'this is one'
})

const item2=new Articlelist({
    title:'two', 
    content:'this is two'
})

let defaultval=[item1,item2]
//get route of restful API that fetch data from server
//route in articles

//let's make chainable route which route for same page
app.route('/articles')
//to get
.get(function(req, res){
    Articlelist.find(function(err,foundarticles){
        //console.log(foundarticles);
        if(foundarticles.length===0)
        { 
            Articlelist.insertMany(defaultval, function(err){
                if(!err){
                    console.log('insert all elements');
                }
            })
            res.redirect('/articles');
        }else{
            if(!err){
        res.send(foundarticles);
            }
            else{
                res.send(err);
            }
        }
    });
})
//take input from client
.post( function(req, res){
    //console.log(req.body.title);
    //console.log(req.body.content);
    //new post and save to mongodb
    const newpost=new Articlelist({
        title: req.body.title,
        content: req.body.content
    })
    newpost.save(function(err){
        if(!err){
            res.send('successfully added');
        }
        else{
            res.send(err);
        }
    });
})
//delete
.delete(function(req, res){
    Articlelist.deleteMany(function(err){
        if(!err){
            res.send('delete all items');
        }
        else{
            res.send(err);
        }
    })
});//must close

//next route pager
app.route('/articles/:articletitle')
.get(function(req, res){
  Articlelist.findOne({title: req.params.articletitle},function(err,foundtitle){
      if(foundtitle){
          res.send(foundtitle);
          //res.send(foundtitle.content)
      }else{
          res.send('title does not exist');
      }
  })
})
//in put if one change and rest of them all are changes or may collapse
.put(function(req, res){
    Articlelist.updateMany(
        //condtions
        {title: req.params.articletitle},
        //update 
        {title:req.body.title,
        content: req.body.content},
        {overwrite:true},
        function(err){
            if(!err){
                console.log("updated one");
                res.send('updated one item');
            }  else{
                res.send(err);
            }
        }
    );
})
//update without changes particular
//in patch there is updated particular 
.patch(function(req, res){
    Articlelist.updateMany(
        {title: req.params.articletitle},
        {$set:req.body},
        function(err){
            if(!err){
            res.send('updated one items');
            }  else{
                res.send(err);
            }
        }
    )
})
//to delete all items
.delete(function(req, res){
    Articlelist.deleteOne(
        {title: req.params.articletitle},
        function(err){
            if(!err){
                res.send('deleted one item');
            }else{
                res.send(err);
            }
        }
    )
});
app.listen(port,function(){
    console.log('server is running');
})
