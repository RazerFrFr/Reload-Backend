const fs = require("fs");
const http = require("http");
const https = require("https");
const WebSocket = require("ws");
const functions = require("../structs/functions.js");
const config = require("../Config/config.json");
const log = require("../structs/log.js");

let wss;
let port = config.bEnableHTTPS ? 443 : config.matchmakerPort;

if (config.bEnableHTTPS) {
    const httpsOptions = {
        key: fs.readFileSync(config.ssl.key),
        cert: fs.readFileSync(config.ssl.cert),
        ca: fs.existsSync(config.ssl.ca) ? fs.readFileSync(config.ssl.ca) : undefined,
    };
    const httpsServer = https.createServer(httpsOptions);
    wss = new WebSocket.Server({ server: httpsServer });
    httpsServer.listen(port, () => {
        log.matchmaker(`Matchmaker started running on port ${port} (SSL Enabled)`);
    });
} else {
    const httpServer = http.createServer();
    wss = new WebSocket.Server({ server: httpServer });
    httpServer.listen(port, () => {
        log.matchmaker(`Matchmaker started running on port ${port} (SSL Disabled)`);
    });
}

wss.on("connection", async (ws) => {
    // create hashes
    const ticketId = functions.MakeID().replace(/-/ig, "");
    const matchId = functions.MakeID().replace(/-/ig, "");
    const sessionId = functions.MakeID().replace(/-/ig, "");

    Connecting();
    await functions.sleep(800);
    Waiting();
    await functions.sleep(1000);
    Queued();
    await functions.sleep(4000);
    SessionAssignment();
    await functions.sleep(2000);
    Join();

    function Connecting() {
        ws.send(JSON.stringify({
            payload: { state: "Connecting" },
            name: "StatusUpdate"
        }));
    }

    function Waiting() {
        ws.send(JSON.stringify({
            payload: { totalPlayers: 1, connectedPlayers: 1, state: "Waiting" },
            name: "StatusUpdate"
        }));
    }

    function Queued() {
        ws.send(JSON.stringify({
            payload: { ticketId, queuedPlayers: 0, estimatedWaitSec: 0, status: {}, state: "Queued" },
            name: "StatusUpdate"
        }));
    }

    function SessionAssignment() {
        ws.send(JSON.stringify({
            payload: { matchId, state: "SessionAssignment" },
            name: "StatusUpdate"
        }));
    }

    function Join() {
        ws.send(JSON.stringify({
            payload: { matchId, sessionId, joinDelaySec: 1 },
            name: "Play"
        }));
    }
});
