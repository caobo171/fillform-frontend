import { io } from 'socket.io-client';
import { SOCKET_URL } from '@/core/Constants';
import { RawUser } from '@/store/types';
class SocketServiceClient {
    public socket: any;

    public connected: boolean = false;
    connect(me: RawUser) {

        console.log('Connecting to WebSocket server, ', me.id, SOCKET_URL);

        if (this.connected) {
            return;
        }

        this.socket = io(SOCKET_URL + '/', {
            path: '/api/socket.io',
            auth: {
                userId: me.id
            }
        });

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');

            this.socket.emit('joinRoom', me.id);
            this.connected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
            this.connected = false;
        });

        this.socket.on('connect_error', (error: any) => {
            console.error('Socket connection error:', error);
            this.connected = false;
        });
    }

    // Subscribe to data updates
    subscribeToUpdates(callback: (data: any) => void) {
        this.socket.on('dataUpdated', callback);
    }

    // Emit data updates
    emitUpdate(data: any) {
        this.socket.emit('updateData', data);
    }

    // Disconnect from the server
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

const SocketService = new SocketServiceClient();
export { SocketService };