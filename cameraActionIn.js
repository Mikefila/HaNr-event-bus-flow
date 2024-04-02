if (msg.payload.event.action == undefined) {
    return(null);
}

const action = msg.payload.event.action;
const split = action.split("|");
const camera = split[0];
const delay = Number(split[1]) * 60 * 1000;
if (camera == "all"){
    const cameraList = global.get("cameraTimerArray");
    for (let i = 0; i < cameraList.length; i++) {
        const element = cameraList[i];
        const timer = flow.get(element);
        const delayTime = timer + delay;
        flow.set(element, delayTime);   
    }
} else {
        const cameraDelay = flow.get(camera);
        const extendDelay = cameraDelay + delay;
        flow.set(camera, extendDelay);
}


msg = {};
msg.camera = camera;
msg.delay = delay;

return msg;
