
// isolate relevant incoming JSON
var cameraName = msg.payload.event.DeviceName;
var ivsRule = msg.payload.event.data.Name;
var evco = msg.payload.event.Code;
var action = msg.payload.event.action;

// message bounce 
// create varibles for timestamp context stores
// create camera variable
var index = msg.payload.event.index; // returns camera number
var cameraPx = "camera_"; 
var camera = cameraPx + index; // create camera


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
} else {
// if new time is greater than last camera event
    var aTTr = "continue";
    var aTTd = (aTT + 7000); // add delay in milliseconds
    context.set(camera, aTTd);
}

// create empty message objects
let msg1 = {};
let msg2 = {};
let msg3 = {};


// create message if bounced
if ((aTTr === "bounce") || (aTTr === "Stop")) {
    msg1 = null;
    msg2 = null;
    msg3.payload = camera; // output camera # if bounced
} else {
// create message if passes
    // phone state  ** used to stop tts while on phone  text still recieved
    const phoneState = global.get('homeassistant.homeAssistant.states["sensor.pixel_7_phone_state_2"].state');

    // create entity type for service call
    const haDom = "camera";  // domain
    const serv = "snapshot"; // service
    const entityType = "camera."; // same as domain with period


    // load snapshot count 
    let countPx = "count_";
    // build countId for snapshots
    let countId = countPx + camera;
    // load current camera count
    let countCc = context.get(countId) || 100;

    // Build message 1 (msg1)
    
    // Build entity
    let cameraEntity = entityType + (cameraName.toLowerCase()).replace(/\s/g, "_") + "_main";
    // convert to lowercase  replace spaces with _   add entity type at begining   add _main to end

    // Text for title and message
    var mtitle = ((cameraName.toUpperCase()).replace(/XVR /, "")).replace(/ FLOOR/, "");
    // convert to upper case  remove XVR and white space from beginning  remove whitespace and FLOOR from end
    // when present in title

    // rule 1
    if (evco === "CrossRegionDetection" && action === "Start" && ivsRule === "ivs") {

        countCc += 1; // if true add 1 to current count
        msg1.payload = {
            "domain": haDom, "service": serv, "data": { "entity_id": cameraEntity },
            "driveFolder": cameraName, // storage folder
            "title": mtitle,
            "count": countCc,
            "rule": "one", // this is for troubleshooting
        };
        // rule 2
    } else if (evco === "CrossRegionDetection" && action === "Start" && (ivsRule === "first" || ivsRule === "garden" || ivsRule === "alley" || ivsRule === "basement")) {

        countCc += 1; // if true add 1 to current count
        msg1.payload = {
            "domain": haDom, "service": serv, "data": { "entity_id": cameraEntity },
            "driveFolder": ivsRule, // storage folder
            "title": ivsRule.toUpperCase(),
            "count": countCc,
            "rule": "two", // this is for troubleshooting
        };
        // rule 3
    } else if (evco === "VideoMotion" && action === "Start") {

        countCc += 1; // if true add 1 to current count 
        msg1.payload = {
            "domain": haDom, "service": serv, "data": { "entity_id": cameraEntity },
            "driveFolder": cameraName, // storage folder
            "title": mtitle,
            "count": countCc,
            "rule": "three", // this is for troubleshooting
        };

    } else {
        msg1 = null;
    }

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
    } else if (ivsRule === "ivs" || evco === "VideoMotion") {
        msg2.payload = ((cameraName.toLowerCase()).replace(/xvr /, "")).replace(/ floor/, "");
    } else {
        msg2.payload = ivsRule;
    }

    msg3.payload = aTTr; //bounce test output
    //catch all if text output is null do nothing
    if (msg1 == null) {
        msg2 == null;
        msg3 == null;
    }

};

// send messages to their outputs
return [msg1, msg2, msg3];

// **msg numbers do not relate to where they go
// only the message itself 
// return [msg3, msg1, msg2] 
// message 3 to output 1
// message 1 to output 2
// message 2 to output 3
