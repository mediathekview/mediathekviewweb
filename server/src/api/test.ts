import { Server } from 'http';

import { Parameters } from './exposer';
import { MiddlewareExposer, ParameterVerifierExposerMiddleware } from './exposer/middleware';
import { RestExposer } from './exposer/rest';

const server = new Server();
server.listen(8081);


const restExposer = new RestExposer(server);
const middlewareExposer = new MiddlewareExposer(restExposer);

const echoParameterVerifier = new ParameterVerifierExposerMiddleware();
echoParameterVerifier.addRequired(['echo'], 'name');

middlewareExposer.registerMiddleware(echoParameterVerifier);

middlewareExposer.expose(['echo'], async (_parameters: Parameters) => {
  return { result: 'hello' };
});
