Template.DataDashboard.helpers({
  session: function() {
    return Classes.find({}, {sort: {dateTime: -1}});
  },
});

Template.CreateSession.events({
  'click .create-session': function(evt, elm) {
    console.log("creating data session");
    var Me = $("#Me").val();
    var ta = $("#TA").val();
    var Week = $("#Week").val();
    var classSesh = $("#Class-session").val();
    var cond = 2;
    var cls = new DataSession(Me, ta, Week, classSesh);
    // Save tactics selected to show TA
    var cbs = $('.tactic-input');
    for (var i = 0;i<cbs.length;i++) {
      if (cbs[i].checked)
        cls.toi.push(cbs[i].name);
    }
    cls._id = Classes.insert(cls);
    //Meteor.call("getTinytUrl", [Router.route['TADashboard']]);
    console.log("Created data session: ", cls);
    Meteor.call('getTinyUrl',
        Router.routes['TADashboard'].url({"sessionId": cls._id}),
        cls._id,
        'url'
    );
    $("#Me").val("");
    $("#TA").val("");
    $("#Week").val("");
    $("#Class-session").val("");
  },
});

Template.CreateSession.helpers({
  tactics: function() {
    var data = [];
    for (var k in KeyToEventMap) {
    	data.push( {'tacticName':KeyToEventMap[k]} );
    }
    return data;
  },
});

Template.DataSessionListing.helpers({
  getDate: function() {
    var d = new Date(this.dateTime);
    return d.toDateString();
  },
  getData: function() {
    return {sessionId: this._id};
  },
});
