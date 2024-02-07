
// isolate relevant incoming JSON
try {
    var cameraName = msg.payload.event.DeviceName;
    var ivsRule = msg.payload.event.data.Name;
    var evco = msg.payload.event.Code;
    var action = msg.payload.event.action;
    var index = msg.payload.event.index;
} catch {
    var cameraName = undefined;
    var ivsRule = undefined;
    var evco = undefined;
    var action = undefined;
    var index = undefined;
}

// dahua events
const validEvents = {
    VideoMotion: "motion detection",
    VideoLoss: "video loss detection",
    VideoBlind: "video blind detection",
    AlarmLocal: "alarm detection",
    CrossLineDetection: "tripwire",
    CrossRegionDetection: "intrusion",
    LeftDetection: "abandoned object detection",
    TakenAwayDetection: "missing object detection",
    VideoAbnormalDetection: "scene change",
    FaceDetection: "face detect",
    AudioMutation: "intensity change",
    AudioAnomaly: "input abnormal",
    VideoUnFocus: "defocus detect",
    WanderDetection: "loitering detection",
    RioterDetection: "People Gathering",
    ParkingDetection: "parking detection",
    MoveDetection: "fast moving",
    HeatImagingTemper: "temperature alarm"
};
// list of available incoming event codes
const eventType = (Object.keys(validEvents));

// message bounce 
if (evco == undefined) {
    aTTr = "Stop";
} else {
    // create varibles for timestamp context stores
    // create camera variable
    const cameraPx = "camera_";
    var camera = cameraPx + index + evco + ivsRule; // create camera


    // retrive timer if value does not exist set at 10000
    var cameraTest = (context.get(camera || 10000));
    // create current time in ms
    var aTT = new Date().getTime();

    // bounce test  
    // if new time is greater than last camera event
    if (aTT < cameraTest) {
        var aTTr = "bounce";
        // if end of motion/ivs event message
    } else if (action === "Stop") {
        var aTTr = "Stop";
        // event is not supported
    } else if (eventType.indexOf(evco) === -1) {
        var attr = "event not upported";
        // if new time is greater than last camera event
    } else {
        var aTTr = "pass";
        var aTTd = (aTT + 30000); // add delay in milliseconds
        context.set(camera, aTTd);
    };
}
// create empty message objects
var msg1 = {};
var msg2 = {};
//var msg3 = {};


// create message if bounced output 3
if (aTTr === "bounce") {
    msg1 = null;
    msg2 = null;
    return [null, null, null];
    //msg3.payload = camera + " " + aTTr; // output camera # if bounced
} else if (aTTr === "Stop") {
    msg1 = null;
    msg2 = null;
    return [null, null, null];
    //msg3.payload = camera + " " + aTTr;
} else if (aTTr === "event not supported") {
    msg1 = null;
    msg2 = null;
    return [null, null, null];
    //msg3.payload = evco + " " + aTTr;
} else {
    // create message if passes
    // phone state  ** used to stop tts while on phone  text still sent
    const phoneState = global.get('homeassistant.homeAssistant.states["sensor.pixel_7_phone_state_2"].state');

    // create entity type for service call
    const haDom = "camera";  // domain
    const serv = "snapshot"; // service
    const entityType = "camera."; // same as domain with period
    // Dauha events

    // load snapshot count 
    var countPx = "count_";
    // build countId for snapshots
    var countId = countPx + camera;
    // load current camera count
    var countCc = context.get(countId) || 100;

    // Build message 1 (msg1)

    // Build entity
    var cameraEntity = entityType + (cameraName.toLowerCase()).replace(/\s/g, "_") + "_main";
    // convert to lowercase  replace spaces with _   add entity type at begining   add _main to end

    // Text for title and message
    var mTitle = ((cameraName.toUpperCase()).replace(/XVR /, "")).replace(/ FLOOR/, "");
    // convert to upper case  remove XVR and white space from beginning  remove whitespace and FLOOR from end
    // when present in title

    // resolves event code for message text
    var mEvent = validEvents[evco];

    var mText = cameraName.replace(/XVR /, "");

    var mRule = "set";




    // rule 1
    if (evco === "CrossRegionDetection" && (ivsRule === "first" || ivsRule === "garden" || ivsRule === "alley" || ivsRule === "basement")) {
        countCc += 1; // if true add 1 to current count
        cameraName = ivsRule; // storage folder
        mTitle = ivsRule.toUpperCase();
        mRule = "Rule one";
        //msg3.payload = mRule;

        // rule else
    } else {
        countCc += 1; // if true add 1 to current count 
        mRule = "Rule else";
        //msg3.payload = "else";

    };

    // message structure
    msg1.payload = {
        "domain": haDom,
        "service": serv,
        "target": {
            "entity_id": cameraEntity
        },
        "driveFolder": cameraName, //.replace(/\s/g, "_"), // storage folder
        "title": mTitle,
        "event": mEvent,
        "message": mText,
        "count": countCc,
        "rule": mRule, // this is for troubleshooting
    };

    // reset current counter  allow 10 snapshots before overwrite
    if (countCc >= 110) {
        countCc = 100;
    }

    // store current counter to counter id
    context.set(countId, countCc);

    // build tts message and rules **output 2**


    // if on phone, dont send tts 
    if (phoneState === "offhook" || action === "Stop") {
        msg2 = null;
    } else if (evco === "LeftDetection") {
        msg2.payload = "Something is at the mailbox";
    } else if (ivsRule === "ivs" || evco === "VideoMotion") {
        msg2.payload = ((cameraName.toLowerCase()).replace(/xvr /, "")).replace(/ floor/, "");
    } else {
        msg2.payload = ivsRule;
    }

    //catch all if text output is null do nothing
    if (msg1 == null) {
        msg2 == null;
    }



    var countOutput = (context.get('countOutput' || 1));

    if (countOutput == 1) {
        countOutput = 2;
        context.set("countOutput", countOutput);
        return [msg1, null, msg2];
    } else {
        countOutput = 1;
        context.set("countOutput", countOutput);
        return [null, msg1, msg2];
    };
}
// **msg numbers do not relate to where they go
// only the message itself
// return [msg3, msg1, msg2]
// message 3 to output 1
// message 1 to output 2
// message 2 to output 3

