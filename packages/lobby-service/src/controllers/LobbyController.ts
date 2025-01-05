// LobbyController.ts
import { NextFunction, Response } from 'express';
import { LobbyServiceImpl } from '../services/LobbyServiceImpl';
import { validateSchema } from '../utils/Validator';
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware';
import {
  Lobby,
  LobbyConfig,
  LobbyId,
  lobbyId,
  PlayerStatus,
  playerStatusSchema,
} from '../schemas/Lobby';
import { createNewLobby } from '../schemas/LobbyFactory';
import logger from '../utils/Logger';

export class LobbyController {
  private readonly lobbyService: LobbyServiceImpl;

  constructor(lobbyService: LobbyServiceImpl) {
    this.lobbyService = lobbyService;
  }

  // Create a new lobby
  createLobby = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const creatorId = req.user!.id;
      logger.info(`Creating lobby for user: ${creatorId}`);
      const lobbyConfig: LobbyConfig = req.body;
      const lobby = createNewLobby(lobbyConfig, creatorId);
      logger.info(`Created lobby: ${lobby}`);
      const createdLobby: Lobby = await this.lobbyService.createLobby(lobby);
      res.status(201).json({
        message: 'Lobby created successfully',
        lobby: createdLobby,
      });
    } catch (error) {
      next(error);
    }
  };

  // Join a lobby
  joinLobby = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: LobbyId = validateSchema(lobbyId, req.params);
      const userId = req.user!.id;
      const updatedLobby: Lobby = await this.lobbyService.joinLobby(id, userId);
      res.status(200).json({
        message: 'Successfully joined the lobby',
        lobby: updatedLobby,
      });
    } catch (error) {
      next(error);
    }
  };

  // Leave the lobby
  leaveLobby = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: LobbyId = validateSchema(lobbyId, req.params);
      const userId = req.user!.id;
      const updatedLobby: Lobby | null = await this.lobbyService.leaveLobby(
        id,
        userId,
      );
      if (!updatedLobby) {
        res.status(204).send();
        return;
      }
      res.status(200).json({
        message: 'Successfully left the lobby',
        lobby: updatedLobby,
      });
    } catch (error) {
      next(error);
    }
  };

  // Kick a player from a lobby
  kickPlayer = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: LobbyId = validateSchema(lobbyId, req.params);
      const creatorId = req.user!.id;
      const playerId = req.body.playerId;
      const updatedLobby: Lobby = await this.lobbyService.kickPlayer(
        id,
        creatorId,
        playerId,
      );
      res.status(200).json({
        message: 'Player kicked',
        lobby: updatedLobby,
      });
    } catch (error) {
      next(error);
    }
  };

  // Set a player's status
  setStatus = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      const status: PlayerStatus = validateSchema(
        playerStatusSchema,
        req.body,
      ).status;
      logger.info(
        `Setting status for player: ${userId} in lobby: ${id} to ${status}`,
      );
      const updatedLobby: Lobby = await this.lobbyService.setStatus(
        id,
        userId,
        status,
      );
      res.status(200).json({
        message: 'Player status updated',
        lobby: updatedLobby,
      });
    } catch (error) {
      next(error);
    }
  };

  // Start a match
  startMatch = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: LobbyId = validateSchema(lobbyId, req.params);
      const creatorId = req.user!.id;
      const updatedLobby: Lobby = await this.lobbyService.startMatch(
        id,
        creatorId,
      );
      res.status(200).json({
        message: 'Match started',
        lobby: updatedLobby,
      });
    } catch (error) {
      next(error);
    }
  };
}
