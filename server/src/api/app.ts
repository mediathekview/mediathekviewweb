import * as HTTP from 'http';
import { IMediathekViewWebAPI } from '../common/api';
import { MediathekViewWebAPI } from './api';
import { SocketIOMediathekViewWebAPIExposer } from './exposers/socket-io';
import * as Express from 'express';

const httpServer = new HTTP.Server();

const api: IMediathekViewWebAPI = new MediathekViewWebAPI();
const socketIOExposer = new SocketIOMediathekViewWebAPIExposer(api, httpServer);

httpServer.listen(8080);
