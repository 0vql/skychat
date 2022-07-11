import {Connection} from "../../../skychat/Connection";
import {GlobalPlugin} from "../../GlobalPlugin";
import {User} from "../../../skychat/User";
import {UserController} from "../../../skychat/UserController";
import { Session } from "../../../skychat/Session";
import { RoomManager } from "../../../skychat/RoomManager";
import { BinaryMessageTypes } from "../../../../api/BinaryMessageTypes";


/**
 * Handle cursor events
 */
export class CursorPlugin extends GlobalPlugin {

    static readonly CURSOR_DECAY_DELAY = 5 * 1000;

    static readonly defaultDataStorageValue = true;

    static readonly commandName = 'c';

    readonly minRight = -1;

    readonly hidden = true;

    /**
     * Recent received cursor positions. Kept for other plugins.
     */
    public readonly cursors: { [identifier: string]: { x: number, y: number, lastSent: Date } } = {};

    readonly rules = {
        c: {
            minCount: 2,
            maxCount: 2,
            maxCallsPer10Seconds: 100,
            params: [
                { name: "x", pattern: /^\d+(\.\d+)?$/}, {name: "y", pattern: /^\d+(\.\d+)?$/ }
            ]
        }
    };

    constructor(manager: RoomManager) {
        super(manager);

        setInterval(this.cleanUpCursors.bind(this), CursorPlugin.CURSOR_DECAY_DELAY);
    }

    async run(alias: string, param: string, connection: Connection): Promise<void> {
        // Else, unpack cursor position
        const [xRaw, yRaw] = param.split(' ');
        const [x, y] = [parseFloat(xRaw), parseFloat(yRaw)];
        // Store entry
        this.cursors[connection.session.identifier] = {
            x, y,
            lastSent: new Date()
        };
        this.sendCursorPosition(connection.session.user, x, y, [connection.session.identifier]);
    }

    /**
     * Send a cursor position to all users
     * @param user 
     * @param x 
     * @param y 
     */
    async sendCursorPosition(user: User, x: number, y: number, identifierIgnoreList?: string[]): Promise<void> {

        // For every connection in the room
        for (const conn of Session.connections) {
            // If the user has cursors disabled, don't send
            if (! UserController.getUserPluginData(conn.session.user, this.commandName)) {
                continue;
            }
            // If identifier is to be ignored
            if (identifierIgnoreList && identifierIgnoreList.includes(conn.session.identifier)) {
                continue;
            }
            const buffer = Buffer.alloc(14);
            buffer.writeUInt16LE(BinaryMessageTypes.CURSOR, 0);
            buffer.writeUInt32LE(user.id, 2);
            buffer.writeFloatLE(x, 6);
            buffer.writeFloatLE(y, 10);
            conn.webSocket.send(buffer);
        }
    }

    /**
     * Remove obsolete cursor entries from cache
     */
    cleanUpCursors(): void {
        // For each saved cursor position
        for (const identifier of Object.keys(this.cursors)) {
            // If it did not move since >5s
            if (new Date().getTime() - this.cursors[identifier].lastSent.getTime() > CursorPlugin.CURSOR_DECAY_DELAY) {
                // Remove entry
                delete this.cursors[identifier];
            }
        }
    }

    /**
     * Cursors are sent in binary format to save bandwidth.
     */
    async onBinaryDataReceived(connection: Connection, messageType: number, data: Buffer): Promise<Boolean> {
        if (messageType !== BinaryMessageTypes.CURSOR) {
            return false;
        }
        // If user not logged in
        if (! connection.session.user.id) {
            return true;
        }
        const x = data.readFloatLE(0);
        const y = data.readFloatLE(4);
        await this.execute(this.commandName, `${x} ${y}`, connection);
        return true;
    }
}