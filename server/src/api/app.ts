import * as HTTP from 'http';
import { MediathekViewWebAPI } from '../common/api';
import { BaseMediathekViewWebAPI } from './api';
import { SocketIOMediathekViewWebAPIExposer } from './exposers/socket-io';
import { RESTMediathekViewWebAPIExposer } from './exposers/rest';
import * as Express from 'express';

const httpServer = new HTTP.Server();

const api: MediathekViewWebAPI = new BaseMediathekViewWebAPI();

const restExposer = new RESTMediathekViewWebAPIExposer(api, httpServer, '/api/v2/');
const socketIOExposer = new SocketIOMediathekViewWebAPIExposer(api, httpServer);

httpServer.listen(8080);
