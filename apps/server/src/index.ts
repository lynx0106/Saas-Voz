/**
 * Voice AI Server - Entry Point
 * 
 * @description Servidor de voz en tiempo real para agentes IA
 * @version 2.0.0
 * @lastUpdated 2026-02-16
 */

import dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { websocketRoutes } from './routes/websocket';

// ============================================================
// CONFIGURACIÓN
// ============================================================

interface ServerConfig {
  port: number;
  host: string;
  nodeEnv: 'development' | 'production' | 'test';
  logLevel: string;
}

function getConfig(): ServerConfig {
  return {
    port: parseInt(process.env.PORT || '8080', 10),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: (process.env.NODE_ENV as ServerConfig['nodeEnv']) || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  };
}

// ============================================================
// SERVIDOR
// ============================================================

const config = getConfig();

const fastify = Fastify({
  logger: {
    level: config.logLevel,
    transport: config.nodeEnv === 'development' 
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
});

// ============================================================
// HOOKS
// ============================================================

/**
 * Hook para manejar errores globales
 */
fastify.setErrorHandler((error, request, reply) => {
  const err = error as Error;
  
  fastify.log.error({
    error: err.message,
    stack: err.stack,
    url: request.url,
    method: request.method,
  });

  reply.status(500).send({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

/**
 * Hook para logging de requests
 */
fastify.addHook('onRequest', async (request) => {
  fastify.log.debug({
    msg: 'Incoming request',
    method: request.method,
    url: request.url,
    ip: request.ip,
  });
});

/**
 * Hook para graceful shutdown
 */
const gracefulShutdown = async (signal: string) => {
  fastify.log.info(`Received ${signal}, closing server...`);
  try {
    await fastify.close();
    fastify.log.info('Server closed successfully');
    process.exit(0);
  } catch (err) {
    fastify.log.error(err, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================================
// INICIALIZACIÓN
// ============================================================

async function start(): Promise<void> {
  try {
    // Registrar plugins
    await fastify.register(cors, {
      origin: config.nodeEnv === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || []
        : '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    await fastify.register(websocket, {
      options: {
        maxPayload: 1048576, // 1MB max message size
        clientTracking: true,
      },
    });

    // Registrar rutas
    await fastify.register(websocketRoutes);

    // Ruta raíz
    fastify.get('/', async () => ({
      name: 'Voice AI Server',
      version: '2.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
    }));

    // Iniciar servidor
    await fastify.listen({ 
      port: config.port, 
      host: config.host 
    });

    fastify.log.info({
      msg: 'Voice Server started',
      port: config.port,
      host: config.host,
      environment: config.nodeEnv,
    });

  } catch (err) {
    fastify.log.error(err, 'Failed to start server');
    process.exit(1);
  }
}

// ============================================================
// START
// ============================================================

start();
