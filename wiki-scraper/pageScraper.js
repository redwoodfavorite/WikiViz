//////////////////////////////////////////////////////////////////
// DEPENDENCIES
//////////////////////////////////////////////////////////////////

var cheerio = require('cheerio');
var Promise = require('bluebird');
var fs      = Promise.promisifyAll(require('fs'));
var request = Promise.promisify(require('request'));
var _       = require('underscore');
var path    = require('path');
var mysql   = require('mysql');

//////////////////////////////////////////////////////////////////
// GLOBAL VARIABLES
//////////////////////////////////////////////////////////////////

var totalPagesVisited = 0;
var urlConnections = {};

//////////////////////////////////////////////////////////////////
// CONNECTING TO DATABASE
//////////////////////////////////////////////////////////////////

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

Promise.promisifyAll(connection);

connection.queryAsync('USE wikiUrls', function(err) {
  if(err) {
    console.log(err);
  }
});

//////////////////////////////////////////////////////////////////
// HELPER FUNCTIONS
//////////////////////////////////////////////////////////////////

//not using this quite yet
var createHash = function(url){
    var hash = 0;
    if (url.length == 0) return hash;
    for (i = 0; i < url.length; i++) {
        char = url.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash;
    }
    return hash;
}

//returns a list of all local urls
var getUrlsOnPage = function(html){
  var pageUrls = [];
  var $ = cheerio.load(html);

  totalPagesVisited++;

  $('#mw-content-text a').each(function(i,link){
    if($(link).attr('href').match(/#/g) === null){
      pageUrls.push("http://en.wikipedia.org" + link.attribs.href)
    }
  });

  console.log("NEW PAGE has " + pageUrls.length + " links...");
  return pageUrls;
}

//returns an array of urls that have not yet been added to the database
var backLinkChecking = function(arrOfUrls){
  return Promise.filter(arrOfUrls, function(url){
    return connection.queryAsync('SELECT * FROM urls WHERE url = "' + url + '"').then(function(result){
      console.log('Querying database...');
      return !result[0][0];
    });
  }).then(function(arr){console.log('DONE FIRST')})
  .error(function(err){console.log(err)});
}

//performs requests for each url in a list and stores each url in database
var exploreUrls = function(urls){
  return Promise.all(_.map(urls, function(url){
    return request(url)
    .then(function(resp){
      var pageUrls = getUrlsOnPage(resp);
      urlConnections[url] = pageUrls;
      return pageUrls;
    }).then(function(allUrls){exploreUrls(backLinkChecking(allUrls))});
  }))
}

//////////////////////////////////////////////////////////////////
// INITIATING SEARCH PROCESS
//////////////////////////////////////////////////////////////////

fs.readFileAsync(path.join(__dirname, 'testFile.txt'), 'utf8')
  .then(function(contents){
    return contents.split(',');
  }).then(function(urls){
    return exploreUrls(urls);
  }).then(function(){
    console.log("DONE");
  }).error(function(err){
    console.log(err);
  });

// fs.readFileAsync(path.join(__dirname, 'testFile.txt'), 'utf8')
//   .then(function(contents){
//     return contents.split(',');
//   }).then(function(urls){
//     return backLinkChecking(urls);
//   }).then(function(){console.log('DONE SECOND')});

