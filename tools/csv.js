JSONtoCSV = function JSONtoCSV(jsonArray, delimiter, dateFormat){
  delimiter = delimiter || ';' ;

  var body = '';
  // En tete
  var keys = _.map(jsonArray[0], function(num, key){ return key; });
  body += keys.join(delimiter) + '\r\n';
  // Data
  for(var i=0; i<jsonArray.length; i++){
    var item = jsonArray[i];
    for(var j=0; j<keys.length; j++){
      var obj = item[keys[j]] ;
      if (_.isDate(obj)) {                
      body += moment(obj).format(dateFormat) ;
      } else {
      body += obj ;
      }

      if (j < keys.length-1) { 
        body += delimiter; 
      }
    }
    body += '\r\n';
  }
   
  return body;
}
