if (msg.cameraRate != undefined) {
    const rate = msg.cameraRate * 1000;
    flow.set('rate', rate);
    msg = {};
    msg.rate = 'delay changed to ' + rate/1000 + " seconds";
    node.done;
    return msg;
}

if (msg.payload.event.Code == undefined || msg.payload.event.action === "Stop" ) {
    msg = null;
    return [null, null, null, null, null];
} else {

function buildCameraId() {
    const index = msg.payload.event.index;
    const rule = msg.payload.event.data.Name || '';
    const evCo = msg.payload.event.Code;
    const camera = index + '_' + rule + '_' + evCo;
    const cameraTimerArray = global.get("cameraTimerArray")|| [];
    if (cameraTimerArray.indexOf(camera) === -1){
        cameraTimerArray.push(camera);
        global.set("cameraTimerArray", cameraTimerArray);
    }
    return camera;
}

const camera = buildCameraId();

function testCamera(camera) {    
    const lastTime = flow.get(camera) || 30000;
    const currentTime = new Date().getTime();
    const rate = flow.get('rate') || 30000;
    const result = (lastTime < currentTime);
        if (result) {
            flow.set(camera, currentTime + rate);
        }
    return result;
}

const result = testCamera(camera);


if (result) {
    
    const phoneState = global.get('homeassistant.homeAssistant.states["sensor.pixel_7_phone_state_2"].state');
    const evco = msg.payload.event.Code;
    const ivsRule = msg.payload.event.data.Name;
    const cameraName = msg.payload.event.DeviceName;
    const index = msg.payload.event.index;    
    const cameraEntity = "camera." + (cameraName.toLowerCase()).replace(/\s/g, "_") + "_main";
    const mTitle = ((cameraName.toUpperCase()).replace(/XVR /, "")).replace(/ FLOOR/, "");
    const validEvents = global.get("validEvents");
    const mEvent = validEvents[evco];
    const mText = cameraName.replace(/XVR /, "");

    let msg1 = {};
    let msg2 = {};
    let msg3 = {};


    

    function sendTts() {
        let tts = "";
        if (phoneState === "offhook") {
            tts = null;
        } else if (evco === "LeftDetection") {
            tts = "Something is at the mailbox";
        } else if (ivsRule === "ivs" || evco === "VideoMotion") {
            tts = ((cameraName.toLowerCase()).replace(/xvr /, "")).replace(/ floor/, "");
        } else {
            tts = ivsRule;
        }

        return tts;

    }

    
    msg1.payload = sendTts();
    node.send([null, null, null, msg1, null]);
   

    msg2.payload = {
            "title": mTitle,
            "message": mEvent +" on "+ mText,
            "image": cameraEntity,
            "action1": camera + "|5",
            "action2": camera + "|20",
            "action3": "all|10"
        }


    msg3.payload = (Number(index) + 1);
    msg3.cName = mText;
    msg3.cEntity = cameraEntity;

   

    let countOutput = (context.get('countOutput' || 1));

    if (countOutput == 1) {
        countOutput += 1;
        context.set("countOutput", countOutput);
        return [msg2, null, null, null, msg3];
    } else if (countOutput == 2) {
        countOutput += 1;
        context.set("countOutput", countOutput);
        return [null, msg2, null, null, msg3]; 
    } else {
        countOutput = 1;
        context.set("countOutput", countOutput);
        return [null, null, msg2, null, msg3];
    };
} else {
    return [null, null, null, null, null];
}

}
