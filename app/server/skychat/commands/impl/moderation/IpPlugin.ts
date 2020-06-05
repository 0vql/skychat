import {Command} from "../../Command";
import {Connection} from "../../../Connection";
import {User} from "../../../User";
import {Session} from "../../../Session";
import {Message} from "../../../Message";
import * as striptags from "striptags";
import {UserController} from "../../../UserController";


export class IpPlugin extends Command {

    readonly name = 'ip';

    readonly minRight = 30;

    readonly rules = {
        ip: {
            coolDown: 1000,
            minCount: 0,
            maxCount: 1,
            params: [{name: 'username', pattern: User.USERNAME_REGEXP}]
        },
    };

    async run(alias: string, param: string, connection: Connection): Promise<void> {

        // List of connections to be included
        let connections;

        // If using wildcard
        if (param === '') {
            connections = this.room.connections;

        } else {
            const username = Session.autocompleteIdentifier(param);
            const session = Session.getSessionByIdentifier(username);
            if (! session) {
                throw new Error('Username not found');
            }
            connections = session.connections;
        }

        // Build table containing the ips
        let content = `<table class="skychat-table">`;
        content += `
            <tr>
                <th>room</th>
                <th>username</th>
                <th>origin</th>
                <th>browser</th>
                <th>ip</th>
            </tr>
        `;
        for (const connection of connections) {
            const roomId = connection.room ? connection.room.id : 'none';
            content += `
                <tr>
                    <td>${roomId}</td>
                    <td>${connection.session.identifier}</td>
                    <td>${connection.origin}</td>
                    <td>${connection.userAgent}</td>
                    <td>${connection.ip}</td>
                </tr>`;
        }
        content += `</table>`;

        // Send the message
        const message = new Message('', null, UserController.getNeutralUser());
        message.edit(striptags(content), content);
        connection.send('message', message.sanitized());
    }
}
