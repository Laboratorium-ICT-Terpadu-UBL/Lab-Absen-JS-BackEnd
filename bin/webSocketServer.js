import { WebSocket, WebSocketServer } from "ws";
import idGenerate from "../security/idGenerate.js";


const clients = new Map()
export default (server) => {
    const wsServer = new WebSocketServer({ server: server })


    wsServer.on('connection', ws => {
        const clientId = idGenerate()
        console.log(`Client connected with ID: ${clientId}`);
        clients.set(clientId, ws)

        ws.on('close', () => {
            console.log(`Client disconnected with ID: ${clientId}`);
            clients.delete(clientId)
        })
    })
}

export const wsBroadcastdMsg = (message) => {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
        }
    })
}


