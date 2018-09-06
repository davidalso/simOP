
if (Meteor.isServer) {
  Meteor.methods({
    getTinyUrl: function(longUrl, id, field) {
      /*****************************************************************
      * takes a long url and retrieves a shortened url from tinyurl
      * and inserts that url into the specific object in the given
      * collection
      *
      * @params:
      *    longurl - the long url to shorten
      *    col - the name of the collection containing the object to modify
      *    id - the _id of the object to modify
      *    field(optional) - the name of the field to insert the shortened url,
      *        this will be "shortUrl" by default
      ****************************************************************/
      var result = HTTP.get("http://tinyurl.com/api-create.php", 
          {params: {url: longUrl}},
          function (error, result) {
              if (!error) {
                console.log("Got shortended url: " + result.content);
                if (!field) {
                  field = "shortUrl";
                }
                var update = {};
                update[field] = result.content;
                Classes.update({_id: id}, {$set: update});
                console.log("Set url for object with id: " + id + 
                    " from collection: classes");
              } else {
                console.log("Failed to retrieve shortened url for url " +
                    longUrl + " for object in collection: classes" +
                    " with id: " + id
                );
                console.log(error)
              }
          }
      );
    },
  });

}
  
testTinyUrl = function(url) {
  /* Test function to call from client */
  var i = Ideas.find().fetch()[2];
  Meteor.call("getTinyUrl", url, 'ideas', i._id, 'shortUrl');
};
