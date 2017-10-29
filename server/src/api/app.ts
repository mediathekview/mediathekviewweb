import * as HTTP from 'http';
import { MediathekViewWebAPI } from '../common/api';
import { BaseMediathekViewWebAPI } from './api';
import { SocketIOMediathekViewWebAPIExposer } from './exposers/socket-io';
import * as Express from 'express';

const httpServer = new HTTP.Server();

const api: MediathekViewWebAPI = new BaseMediathekViewWebAPI();
const socketIOExposer = new SocketIOMediathekViewWebAPIExposer(api, httpServer);

httpServer.listen(8080);
