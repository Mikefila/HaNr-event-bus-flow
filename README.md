# HaNr-event-bus-flow

This flow listens for `dahua_event_recived`. The funcion node manipulates event data:

1. Creates payload for snapshot call.
2. Covers all supported event types. [see here](https://github.com/rroller/dahua?tab=readme-ov-file#example-code-events)
3. Numbers snapshot (allows multiple snapshots per message type before rewrite).
4. Stores snapshot in different folders according to trigger type.
5. Creates payload for text including snapshot file location.
6. Creates payload for separate tts message.
7. Bounces duplicate and stop messages.
8. Rate limit by event and camera number.
9. Retrieve  phone state, bounce tts message if on phone.
10. Create multiple zone triggers per camera. (See below)
11. Alternating outputs for faster snapshot storage

![Screenshot 2024-02-06 105820](https://github.com/Mikefila/HaNr-event-bus-flow/assets/74340408/641dca40-efae-4881-968c-8afc6eb80bb4)


Dahua cameras allow the naming of ivs rules. These names are sent with the event. The Dahua intgration (https://github.com/rroller/dahua) combines all ivs rules from a single camera together. 

In the camera/dvr/nvr/xvr channel settings, create rules and name them. You will use theses names to identify triggers.

![Screenshot 2024-01-26 133716](https://github.com/Mikefila/HaNr-event-bus-flow/assets/74340408/375e07a0-7ea6-4e02-8cdc-3d0c82aef6df)


If you turn on show ivs rule in Dahua's smart pss app. (https://dahuawiki.com/SmartPSS_Lite) You can see the two ivs zones and their respective names.

![Screenshot 2024-01-26 133838](https://github.com/Mikefila/HaNr-event-bus-flow/assets/74340408/5a737624-4fb3-4f27-8c52-726521eb12b1)

When one of the rules are triggered there is the rule name `value` in `payload.event.data.Name`.

Using a conditinal statement (see rule 1 in camerafunc.js) allows us to target specific keywords found in the event data.

Dahua cameras offer other information in the event data. Target location and direction of travel among other things. Multiple sample JSON included in flow file.



