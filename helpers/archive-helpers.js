var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var urlParser = require('url');
var http = require("http");
var request = require('request');

exports.paths = {
  'siteAssets' : path.join(__dirname, '../web/public'),
  'archivedSites' : path.join(__dirname, '../archives/sites'),
  'list' : path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for jasmine tests, do not modify
exports.initialize = function(pathsObj){
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

exports.parseRoute = function(url){
  var parts = urlParser.parse(url);
  var route = parts.pathname;
  return route;
}

exports.readListOfUrls = function(){
  var urls = fs.readFileSync(exports.paths.list, 'utf8').split('\n');
  return _.filter(urls, function(url){ return url !== ""; });
};

exports.isUrlInList = function(url){
  var list = exports.readListOfUrls();
  return list.indexOf(url) > -1;
};

exports.addUrlToList = function(url){
  // get urls
  var list = exports.readListOfUrls();
  // check if duplicate
    // write urls to sites.txt
  list.push(url);
  fs.writeFileSync(exports.paths.list, list.join('\n'), 'utf8');
};

exports.isUrlArchived = function(url){
  return fs.existsSync(exports.paths.archivedSites.concat('/'+url));
};

exports.downloadUrls = function(){

  console.log('begin downloading URLs');
  // get url list
  var list = exports.readListOfUrls();

  // loop over list
  _.each(list, function(site){

    // check for HTTP protocol
    if (site.indexOf('http://') === -1){
      site = 'http://'.concat(site);
    }

    // send get request to url
    var fileName = urlParser.parse(site);
    fileName = fileName.hostname;
    var file = fs.createWriteStream(exports.paths.archivedSites.concat('/'+fileName));
    request(site).pipe(file);
  });
  console.log('finished downloading URLs')
};
