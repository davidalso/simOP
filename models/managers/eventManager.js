logEvent = function(type) {
  var sId = Session.get("sessionId");
  var session = Classes.findOne({_id: sId});
  var e = new Event(type, session);
  Events.insert(e);
};

logKeyEvent = function(key, isRelease) {
  // 83 is s = student
  if (key == 83) {
    if (isRelease) {
      logEvent(eventTypes[2]);
    } else {
      logEvent(eventTypes[1]);
    }
  } else if (key == 68) {
  // 68 is d = teacher
    if (isRelease) {
      logEvent(eventTypes[4]);
    } else {
      logEvent(eventTypes[3]);
    }

  }

  switch (key) {
	case 84: // Key T
		if (!isRelease) // Timing begin
			logEvent(eventTypes[5]);
		else	// Timing end
			logEvent(eventTypes[6]);
		break;
	case 49: // Key 1 Pause
		if (!isRelease) {
			logEvent(eventTypes[7]);
			observerPause = true;
		}
		break;
	case 48: // Key 0 Unpause
		if (!isRelease) {
			logEvent(eventTypes[8]);
			observerPause = false;
		}
		break;
	default:
  }
};

/**
 * @tommit
 *
 * Discount an event stored in the Model
 * @param type Event type (special)
 */
unlogEvent = function (type) {
  var sId = Session.get("sessionId");
  var session = Classes.findOne({_id: sId});
  var e = new Event(type, session);
  e.isUndo = true;
  Events.insert(e);
};

/**
 * @tommit
 *
 * Count an event in the Model
 * @param k Keypressed
 */
countEvent = function (k) {

 	if (KeyToEventMap[k] == undefined)
		return;

	console.log('count Keypressed:' + k);
	logEvent(KeyToEventMap[k]);
};

/**
 * @tommit
 * Decrement event count
 */
discountEvent = function (k) {

	if (KeyToEventMap[k] == undefined)
		return;

	console.log('Discount Keypressed:' + k);
	unlogEvent(KeyToEventMap[k]);
};
