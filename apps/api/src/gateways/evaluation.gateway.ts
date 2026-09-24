import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { EvaluationResult } from '../modules/ai/llm-provider.interface';

/**
 * EvaluationGateway emits real‑time events for evaluation lifecycle steps.
 * It is a singleton; the static `instance` is set on init for easy access from
 * background workers that are not part of the Nest DI container.
 */
@WebSocketGateway({ cors: { origin: process.env.WEBSOCKET_ORIGIN || 'http://localhost:3000' } })
@Injectable()
export class EvaluationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EvaluationGateway.name);
  static instance?: EvaluationGateway;

  afterInit(server: Server) {
    EvaluationGateway.instance = this;
    this.logger.log('EvaluationGateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitEvaluationStarted(answerId: string, userId: string) {
    this.server.emit('evaluation.started', { answerId, userId, timestamp: new Date().toISOString() });
  }

  emitEvaluationCompleted(answerId: string, result: EvaluationResult) {
    this.server.emit('evaluation.completed', { answerId, result, timestamp: new Date().toISOString() });
  }

  emitEvaluationFailed(answerId: string, error: any) {
    this.server.emit('evaluation.failed', { answerId, error: error?.message ?? String(error), timestamp: new Date().toISOString() });
  }
}
