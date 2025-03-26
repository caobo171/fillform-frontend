import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

class SocketService {
    private socket: any;

    connect() {
        this.socket = io(SOCKET_URL);

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        this.socket.on('connect_error', (error: any) => {
            console.error('Socket connection error:', error);
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

export default new SocketService(); 