import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtFunctionType, NotificationType } from './types';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private jwtService: JwtService) {}

  @WebSocketServer()
  private readonly server: Server;

  private async authSocket(client: Socket) {
    try {
      const tokenPart = client.handshake.headers.cookie.split(';')[0];

      const accessToken = tokenPart.split('=')[1];

      return this.jwtService.decode(accessToken);
    } catch (e) {
      client.disconnect(true);
    }
  }

  public emitNotification(userId: number, type: NotificationType, notification) {
    
    return this.server.to(String(userId)).emit(type, notification);
  }

  public emitToAll(type: NotificationType, notification) {
    return this.server.emit(type, notification);
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.authSocket(client);

      if (user) {
        client.join(String(user.sub));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const user = await this.authSocket(client);

      if (user) {
        client.join(String(user.sub));
      }
    } catch (e) {
      console.error(e);
    }
  }
}
