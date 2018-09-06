/*****************************************************************************
* Key State machine management
*****************************************************************************/
setKeyState = function(key) {
  // Return true if a new key is pressed, false if the key was already pressed
  var state = Session.get("keyState");
  if (state == null) {
    ////console.log("Initializing keystate");
    if (key == -1) {
      state = {}
    } else {
      state = {key: true};
      logKeyEvent(key, false);
      setState();
    }
    Session.set("keyState", state);
    return true;
  } else {
    if (state[key]) {
      //console.log("Not a new keypress");
      return false;
    } else {
      state[key] = true;
      //console.log("Setting new key state", state);
      Session.set("keyState", state);
      logKeyEvent(key, false);
      setState();
      return true;
    }
  }
};

clearKeyState = function(key) {
  // Returns a list of keys that are still pressed after releasing the given key
  var state = Session.get("keyState");
  state[key] = false;
  var keys = Object.keys(state);
  //console.log("clearing key from state", state);
  Session.set("keyState", state);
  logKeyEvent(key, true);
  setState();
  return keys.length > 0 ? keys : false;
};

getKeyState = function() {
  var state = Session.get("keyState");
  var keys = Object.keys(state);
  var result = [];
  for (var i=0; i<keys.length; i++) {
    var key = keys[i];
    if (state[key]) {
      result.push(parseInt(key));
    }
  }
  return result;
};

/*****************************************************************************
* End Key State machine management
*****************************************************************************/

/*****************************************************************************
* Class/Data Session State machine management
*****************************************************************************/
WAIT_TIME = 1500;
CADENCE_TIME = 1500;

setState = function() {
  // Update the session state machine based on current key press state
  var keys = getKeyState();
  var sessionId = Session.get("sessionId");
  var state = Classes.findOne({_id: sessionId});
  // //console.log("Updating Class state", state, keys);
  if (keys.length == 0) {
    // Begin wait state machine
    startCadence(sessionId, state['state']);
  } else if (keys.length == 1) {
    switch(keys[0]) {
      case 68:
        //Entering Teacher State
        console.log("entering teacher state");
        clearTimeouts(state);
        Classes.update({_id: sessionId}, {$set:
            {'state': eventStates['teacher'],
             waitTimeout: null,
             cadenceTimeout: null}
        });
        break;
      case 83:
        //Entering Student State
        console.log("entering student state");
        clearTimeouts(state);
        Classes.update({_id: sessionId}, {$set:
            {'state': eventStates['student'],
             waitTimeout: null,
             cadenceTimeout: null}
        });
        break;
      default:
        // start cadence/wait/silence if last state was a talking state
        startCadence(sessionId, state['state']);
    }
  } else {
      if (isInList(68, keys) && isInList(83, keys)) {
        //Entering Teacher-Student State
        ////console.log("entering teacher-student state");
        clearTimeouts(state);
        Classes.update({_id: sessionId}, {$set:
            {'state': eventStates['student-teacher'],
             waitTimeout: null,
             cadenceTimeout: null}
        });
      } else if (isInList(68, keys)) {
        console.log("entering teacher state");
        clearTimeouts(state);
        Classes.update({_id: sessionId}, {$set:
            {'state': eventStates['teacher'],
             waitTimeout: null,
             cadenceTimeout: null}
        });
      } else if (isInList(83, keys)) {
        console.log("entering student state");
        clearTimeouts(state);
        Classes.update({_id: sessionId}, {$set:
            {'state': eventStates['student'],
             waitTimeout: null,
             cadenceTimeout: null}
        });
      } else {
        // start cadence/wait/silence if last state was a talking state
        startCadence(sessionId, state['state']);
      }
  }
  //console.log("Updating Class state", state);
}

startCadence = function(sId, lastState) {
  // Manage the silence state machine
  switch (lastState) {
    case eventStates['student']:
      console.log("Starting cadence state");
      var timeout = Meteor.setTimeout(function() {
        startWait(sId, 'cadence-student');
      }, CADENCE_TIME);
      Classes.update({_id: sId}, {$set:
          {state: eventStates['cadence-student'],
           waitTimeout: null,
           cadenceTimeout: timeout}
      });
      break;
    case eventStates['teacher']:
      console.log("Starting cadence state");
      var timeout = Meteor.setTimeout(function() {
        startWait(sId, 'cadence-teacher');
      }, CADENCE_TIME);
      Classes.update({_id: sId}, {$set:
          {state: eventStates['cadence-teacher'],
           waitTimeout: null,
           cadenceTimeout: timeout}
      });
      break;
    case eventStates['student-teacher']:
      console.log("Starting cadence state");
      var timeout = Meteor.setTimeout(function() {
        startWait(sId, 'cadence-both');
      }, CADENCE_TIME);
      Classes.update({_id: sId}, {$set:
          {state: eventStates['cadence-both'],
           waitTimeout: null,
           cadenceTimeout: timeout}
      });
      break;
    // if previous state was not a talking state, then do nothing
  }

}

startWait = function(sId, lastState) {
  // Set state change to silence after specified interval
  switch (lastState) {
    case 'cadence-student':
      console.log("Starting wait state");
      var timeout = Meteor.setTimeout(function() {
          Classes.update({_id: sId}, {$set:
              {state: eventStates['silence'],
               waitTimeout: null,
               cadenceTimeout: null}
          });
      }, WAIT_TIME);
      Classes.update({_id: sId}, {$set:
          {state: eventStates['wait-student'],
           waitTimeout: timeout,
           cadenceTimeout: null}
      });
      break;
    case 'cadence-teacher':
      console.log("Starting wait state");
      var timeout = Meteor.setTimeout(function() {
          Classes.update({_id: sId}, {$set:
              {state: eventStates['silence'],
               waitTimeout: null,
               cadenceTimeout: null}
          });
      }, WAIT_TIME);
      Classes.update({_id: sId}, {$set:
          {state: eventStates['wait-teacher'],
           waitTimeout: timeout,
           cadenceTimeout: null}
      });
      break;
    case 'cadence-both':
      console.log("Starting wait state");
      var timeout = Meteor.setTimeout(function() {
          Classes.update({_id: sId}, {$set:
              {state: eventStates['silence'],
               waitTimeout: null,
               cadenceTimeout: null}
          });
      }, WAIT_TIME);
      Classes.update({_id: sId}, {$set:
          {state: eventStates['wait-both'],
           waitTimeout: timeout,
           cadenceTimeout: null}
      });
      break;
  }
}

clearTimeouts = function(session) {
  // Clear any timeouts
  console.log("clearing all timeouts for silence state machine");
  if (session.waitTimeout != null) {
    Meteor.clearTimeout(session.waitTimeout);
  }
  if (session.cadenceTimeout != null) {
    Meteor.clearTimeout(session.cadenceTimeout);
  }
  // Remove references to cleared timeouts
  // Classes.update({_id: session._id}, {$set:
      // {waitTimeout: null,
       // cadenceTimeout: null}
  // });
};

getStateColor = function(cond, state) {
  // Define ta dashboard color state machine
  // cond 1:
  //      'student': [orange]
  //      'teacher': [orange]
  //      'student-teacher': [orange]
  //      'cadence-student': [orange]
  //      'cadence-teacher': [orange]
  //      'cadence-both': [orange]
  //      'wait-student': [orange, green]
  //      'wait-teacher': [orange, green]
  //      'wait-both': [orange, green]
  //      'silence': [green]
  // cond 2:
  //      'student': [orange]
  //      'teacher': [orange]
  //      'student-teacher': [orange]
  //      'cadence-student': [green]
  //      'cadence-teacher': [orange]
  //      'cadence-both': [orange]
  //      'wait-student': [green, blue]
  //      'wait-teacher': [blue]
  //      'wait-both': [blue]
  //      'silence': [blue]

  if (cond == '1') {
    switch (state) {
      case 'student':
        return visualState[1];
      case 'teacher':
        return visualState[1];
      case 'student-teacher':
        return visualState[1];
      case 'cadence-student':
        return visualState[1];
      case 'cadence-teacher':
        return visualState[1];
      case 'cadence-both':
        return visualState[1];
      case 'wait-student':
        return visualState[4];
      case 'wait-teacher':
        return visualState[4];
      case 'wait-both':
        return visualState[4];
      case 'silence':
        return visualState[2];
      default:
        return visualState[2];
    }
  } else {
    switch (state) {
      case 'student':
        return visualState[2];
      case 'teacher':
        return visualState[1];
      case 'student-teacher':
        return visualState[1];
      case 'cadence-student':
        return visualState[2];
      case 'cadence-teacher':
        return visualState[1];
      case 'cadence-both':
        return visualState[1];
      case 'wait-student':
        return visualState[5];
      case 'wait-teacher':
        return visualState[3];
      case 'wait-both':
        return visualState[3];
      case 'silence':
        return visualState[3];
      default:
        return visualState[3];
    }
  }
}
