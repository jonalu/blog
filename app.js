var express = require('express');
var mongo = require('./mongo').mongo;

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  //app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(require('node-sass').middleware({
      src :  __dirname + '/public',
      dest : __dirname + '/public',
      debug : true
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

var mongo = new Mongo( 'localhost' , 27017 );

app.get('/', 
  function(req, res){
    console.log( 'fetch all comments and render them...' );
    mongo.findAll( function(error,docs){
        res.render('index.jade', {
            title: 'A blog about nothing and everything',
            articles:docs
        });
    })
  }
);



app.post('/blog/addComment', function(req, res) {
    mongo.addCommentToArticle(req.param('_id'), {
        person: req.param('title'),
        comment: req.param('body'),
        created_at: new Date()
       } , function( err, docs) {
           console.log('error storing comment', err)
           res.redirect('/blog/' + req.param('_id'))
       });
});

app.get('/blog/new', 
  function( req, res ){
    console.log( 'render comment form...' );
    res.render( 'blog_new.jade' , { title : 'New blog post' } );
  }
);

app.get('/blog/:id',
  function( req, res ){
    mongo.findById( req.params.id ,
      function(error, article){
        res.render('blog_show.jade',
          {
            title   : article.title,
            article : article
          }
        )
      }
    )
  }
);

app.post('/blog/new',
  function( req, res ){
    console.log( 'posting new comment...' );
    mongo.save({
      title : req.param('title'),
      body  : req.param('body')
      }, function( error, docs ){
        res.redirect('/');
      }
    );
  }
);

app.listen(9001);
