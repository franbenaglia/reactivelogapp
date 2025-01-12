import { Socket, io } from "socket.io-client";
import { Climate } from "../model/Climate";
import { BehaviorSubject, Observable } from 'rxjs';

const URL_RESOURCE_SERVER = import.meta.env.VITE_URL_RESOURCE_SERVER;

export const socket: Socket<any, any> = io(URL_RESOURCE_SERVER);

export const ClimateEvent: BehaviorSubject<Climate> = new BehaviorSubject(null);

export const socketInit = () => {

    socket.on("connect", () => {
        console.log('socket id ' + socket.id);
        console.log('socket connected ' + socket.connected);
        const engine = socket.io.engine;
        console.log('socket trasnsport ' + engine.transport.name);
    });

    socket.on("disconnect", (reason) => {

        console.log('socket id ' + socket.id);
        console.log('socket connected ' + socket.connected);

        if (socket.active) {
            // temporary disconnection, the socket will automatically try to reconnect
        } else {
            // the connection was forcefully closed by the server or the client itself
            // in that case, `socket.connect()` must be manually called in order to reconnect
            console.log(reason);
        }
    });

    socket.on('newclientconnected', (arg: any) => {
        console.log('new client connected:' + arg);
    });

    socket.on('coordinateall', (c: Climate) => {
        console.log('receiving coordinates from server included me: ' + JSON.stringify(c));
    });

    socket.on('room1', (c: Climate) => { //'coordinateallwithoutme'
        console.log('receiving coordinates from server whitout me: ' + JSON.stringify(c));
        setClimateEvent(c);
    });


    socket.on("connect_error", (error) => {
        if (socket.active) {
            // temporary failure, the socket will automatically try to reconnect
        } else {
            // the connection was denied by the server
            // in that case, `socket.connect()` must be manually called in order to reconnect
            console.log(error.message);
        }
    });

}

export const getClimateEvent = (): Observable<Climate> => {
    return ClimateEvent.asObservable();
}

export const setClimateEvent = (event: Climate) => {
    ClimateEvent.next(event);
}


