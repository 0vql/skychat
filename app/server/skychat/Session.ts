import {User} from "./User";
import {Connection} from "./Connection";
import {IBroadcaster} from "./IBroadcaster";


/**
 * A SkyChatSession represents a connected user, who has an account or not
 */
export class Session implements IBroadcaster {

    /**
     * Object mapping all active sessions
     */
     static sessions: {[identifier: string]: Session} = {};

    /**
     * Find an existing session using its identifier
     * @param identifier
     */
    public static getSessionByIdentifier(identifier: string): Session | undefined {
        return Session.sessions[identifier];
    }

    /**
     * Autocomplete an identifier to match an active existing identifier
     * @param identifier
     */
    public static autocompleteIdentifier(identifier: string): string {
        const matches = Object.keys(Session.sessions).filter(i => i.indexOf(identifier.toLowerCase()) === 0);
        if (matches.length !== 1) {
            return identifier.toLowerCase();
        }
        return matches[0];
    }

    /**
     * Tells if there is currently an active session for a given identifier
     * @param identifier
     */
    public static sessionExists(identifier: string): boolean {
        return typeof Session.getSessionByIdentifier(identifier) !== 'undefined';
    }

    /**
     * Unique session identifier
     */
    private _identifier!: string;

    public connections: Connection[];

    /**
     * Associated user (if logged session)
     */
    public user: User;


    constructor(identifier: string) {
        this.connections = [];
        this.identifier = identifier;
        this.user = new User(0, identifier, '', 0, 0, -1);
    }

    /**
     * Detach a connection from this session
     * @param connection
     */
    public detachConnection(connection: Connection): void {
        this.connections = this.connections.filter(c => c !== connection);
    }

    /**
     * Update a session unique identifier
     * @param identifier
     */
    public set identifier(identifier: string) {
        identifier = identifier.toLowerCase();
        if (Session.getSessionByIdentifier(identifier)) {
            throw new Error('Cannot change identifier to ' + identifier + ': Identifier must be unique');
        }
        if (this._identifier) {
            delete Session.sessions[this._identifier];
        }
        this._identifier = identifier;
        Session.sessions[identifier] = this;
    }

    public get identifier(): string {
        return this._identifier;
    }

    /**
     * Attach a connection to this session
     * @param connection
     */
    public attachConnection(connection: Connection): void {
        if (connection.session === this) {
            return;
        }
        if (connection.session) {
            connection.session.detachConnection(connection);
        }
        connection.session = this;
        this.connections.push(connection);

        connection.send('set-user', this.user.sanitized())
    }

    /**
     * Set associated user
     * @param user
     */
    public setUser(user: User): void {
        this.identifier = user.username.toLowerCase();
        this.user = user;
        this.connections.forEach(connection => connection.send('set-user', this.user.sanitized()));
    }

    /**
     * Send to all this session's connections
     * @param event
     * @param payload
     */
    public send(event: string, payload: any): void {
        this.connections.forEach(connection => connection.send(event, payload));
    }
}