# HaNr-event-bus-flow

This flow listens for `dahua_event_recived`. The funcion node manipulates event data:

1. Creates payload for snapshot call.
2. Numbers snapshot (allows multiple snapshots per message type before rewrite).
3. Stores snapshot in different folders according to event type.
4. Creates payload for text including snapshot file location.
5. Creates payload for seperate tts message.
6. Bounces duplicate messages.
7. Rate limit by type.

![Screenshot 2024-01-26 025008](https://github.com/Mikefila/HaNr-event-bus-flow/assets/74340408/985907b3-b5df-4988-80ed-6bd070e30632)
