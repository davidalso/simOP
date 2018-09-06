Template.TADash.onRendered(function() {
  console.log("Done Rendering with id: " + Session.get("sessionId"));
  //Tracker.autorun(updateTADash);
  Meteor.setInterval(checkStateUpdate, 10);
  // Tracker.autorun(function() {
    // console.log("Changing background to new state");
    // var sId = Session.get("sessionId");
    // var session = Classes.findOne({_id: sId});
    // switch (session.state) {
      // case eventStates['student']:
        // $(".dashboard").css("background-color", "#5BB1E2");
        // break;
      // case eventStates['teacher']:
        // $(".dashboard").css("background-color", "#5BB1E2");
        // break;
      // case eventStates['student-teacher']:
        // $(".dashboard").css("background-color", "#000");
        // break;
      // case eventStates['silence']:
        // $(".dashboard").css("background-color", "#F26D38");
        // break;
    // }
  // });
});

var getState = function() {
  var sessionId = Session.get("sessionId");
  var session = Classes.findOne({_id: sessionId});
  if (session != null) {
    //console.log("Got state: ", session);
    Session.set("lastState", session.state);
    Session.set("cond", session.cond);
    return session.state;
  } else {
    return null;
  }
};

var getLastState = function() {
  var last = Session.get("lastState");
  // console.log("Checking state update", last);
  if (last == null) {
    var state = getState();
    Session.set("lastState", state);
    return state;
  } else {
    return last; 
  }
};

var checkStateUpdate = function() {
  var last = getLastState();
  var state = getState();
  // console.log("updating state: ", state, last);
  if (state != last) {
    updateTADash(state, Session.get("cond"));
  }
}

var updateTADash = function(state, cond) {
  //console.log("******************************************");
  var stateColors = getStateColor(cond, state);
  console.log("updating TA Dash state", stateColors);
  if (stateColors.length == 1) {
    $(".dashboard").css("background", colors[stateColors[0]]);
    var animateInt = Session.get("animate-timeout");
    if (animateInt != null) {
        Meteor.clearInterval(animateInt);
        Session.set("animate-timeout", null);
        $(".dashboard .animation-view").remove();
    }
  } else if (stateColors.length == 2) {
    if ($(".dashboard .animation-view").length == 0) {
      Blaze.render(Template.AnimationView, $(".dashboard")[0]);
    } else {
      $(".dashboard .animation-view").css("width", "0");
    }
    $(".dashboard .animation-view").css("background", colors[stateColors[1]]);
    var counter = 0;
    var animateView = function() {
      counter++;
      var width = counter.toString() + '%';
      $(".dashboard .animation-view").css("width", width);
      console.log("animating", counter);
      if (counter >= 99) {
        var interval = Session.get("animate-timeout");
        console.log("clearing animation", interval);
        Meteor.clearInterval(interval);
        Session.set("animate-timeout", null);
        $(".dashboard .view").css("background", colors[stateColors[1]]);
        $(".dashboard .animation-view").remove();
      }
    };
    var intTime = WAIT_TIME / 100;
    var animateInterval = Meteor.setInterval(animateView, intTime);
    console.log("starting interval: ", animateInterval);
    Session.set("animate-timeout", animateInterval);
  }
};

Template.TADash.helpers({
  tactics: function(){
    var data = [];
    var sessionId = Session.get("sessionId");
    var cls = Classes.findOne({_id: sessionId});
    for (var i = 0; i<cls.toi.length;i++){
      var count = Events.find({'type':cls.toi[i], 'sessionId':sessionId}).count();
      data.push({'tacticName':cls.toi[i], 'tacticCount':count});
    }
    return data;
  },

});
