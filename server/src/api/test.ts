import { Server } from 'http';

import { Exposer, ExposedFunctionParameters } from './exposer';
import { RestExposer } from './exposer/rest';
import { MiddlewareExposer, ParameterVerifierExposerMiddleware } from './exposer/middleware';

const server = new Server();
server.listen(8081);


const restExposer = new RestExposer(server);
const middlewareExposer = new MiddlewareExposer(restExposer);

const echoParameterVerifier = new ParameterVerifierExposerMiddleware();
echoParameterVerifier.addRequired(['echo'], 'name');

middlewareExposer.registerMiddleware(echoParameterVerifier);

middlewareExposer.expose(['echo'], async (parameters: ExposedFunctionParameters) => {
  return { result: 'hello' };
});
