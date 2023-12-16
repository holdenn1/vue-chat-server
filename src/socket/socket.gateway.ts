import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { NotificationType } from './types';

@WebSocketGateway()
export class SocketGateway {

  @WebSocketServer()
  private readonly server: Server;

  public emitToAll(type: NotificationType, notification) {
    return this.server.emit(type, notification);
  }
}