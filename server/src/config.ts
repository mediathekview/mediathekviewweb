import * as FS from 'fs';
import * as HJSON from 'hjson';

interface Config {
  dataDirectoriy: string;

  importer: {
    cache: boolean;
  }
}

class StaticConfig {
  static dataDirectoriy = './data';

  static importer = {
    cache: true
  }
}

const configFileString = FS.readFileSync('config.hjson', { encoding: 'utf-8' });
const configFile = HJSON.parse(configFileString) as Config;

StaticConfig.dataDirectoriy = configFile.dataDirectoriy;
StaticConfig.importer = configFile.importer;

export default StaticConfig as Config;
