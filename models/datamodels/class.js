Classes = new Meteor.Collection("classes");
Events = new Meteor.Collection("events");


eventStates = {
          'student': 'student',
          'teacher': 'teacher',
          'student-teacher': 'student-teacher',
          'cadence-student': 'cadence-student',
          'cadence-teacher': 'cadence-teacher',
          'cadence-both': 'cadence-both', // likely unreachable
          'wait-student': 'wait-student',
          'wait-teacher': 'wait-teacher',
          'wait-both': 'wait-both', // likely unreachabl
          'silence': 'silence'
};

eventTypes = {
  1: "student begin talking",
  2: "student end talking",
  3: "teacher begin talking",
  4: "teacher end talking",
  // @Nikolai timing & pausing
  5: "timing begin",
  6: "timing end",
  7: "pause begin",
  8: "pause end",
};

// @tommit Mapping ASCII keys to events of interest
KeyToEventMap = {
	77: 'Meaningless TA Question', // Key M
  78: 'Not bad TA Question', // Key N
	85: 'Use of student name',	// Key U
	73: 'Ice cold call', 	// Key I
	70: 'First time student talks', // Key F
  80: 'Students present', // Key P
  72: 'Hand raised', // Key H
};
// @stevencdang Reverse the KeyToEventMap mapping above for reverse lookups
ReverseKeyToEventMap = {};
for (k in KeyToEventMap) {
  ReverseKeyToEventMap[KeyToEventMap[k]] = k;
};

// @Nikolai observerpause
observerPause = false;

// First color = background color
// Second color = transition color (color of growing rectangle
visualState = {
  1: ['orange'],
  2: ['green'],
  3: ['blue'],
  4: ['orange', 'green'],
  5: ['green', 'blue'],
}

colors = {
  'orange': "#FF6600",
  'green': "#66CC33",
  'blue': "#3366CC"
};

DataSession = function(Me, ta, Week, classSesh) {
  this.dateTime = new Date().getTime();
  this.Me = Me;
  this.ta = ta;
  this.Week = Week;
  this.csesh = classSesh;
  this.state = eventStates['silence'];
  this.waitTimeout = null;
  this.cadenceTimeout = null;
  this.url = "";
  this.toi = []; // Tactics of Interest
};

Event = function(type, session) {
  this.dateTime = new Date().getTime();
  this.type = type;
  this.sessionId = session._id;
  this.sessionMe = session.Me;
  this.sessionTA = session.ta;
  this.sessionWeek = session.Week;
  this.sessionCsesh = session.csesh;
  this.isUndo = false;
};
