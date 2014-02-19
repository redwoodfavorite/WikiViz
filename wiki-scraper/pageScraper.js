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

//////////////////////////////////////////////////////////////////
// HELPER FUNCTIONS
//////////////////////////////////////////////////////////////////

var createHash = function(url){
    var hash = 0;
    if (url.length == 0) return hash;
    for (i = 0; i < url.length; i++) {
        char = url.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}


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

var backLinkChecking = function(arrOfUrls){
  console.log(_.filter(arrOfUrls, function(url){
    connection.query('SELECT * FROM urls WHERE url = "' + url + '"')
  }));
}

var exploreUrls = function(urls){
  return Promise.all(_.map(urls, function(url){
    return request(url)
    .then(function(resp){
      urlConnections[url] = getUrlsOnPage(resp);
    });
  }));
};


//////////////////////////////////////////////////////////////////
// INITIATING SEARCH PROCESS
//////////////////////////////////////////////////////////////////

fs.readFileAsync(path.join(__dirname, 'testFile.txt'), 'utf8')
  .then(function(contents){ return contents.split(',') })
  .then(function(urls){
    return exploreUrls(urls);
  }).then(console.log(totalPagesVisited + " pages visited!"));


