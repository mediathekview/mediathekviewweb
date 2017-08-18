import * as FS from 'fs';
import * as HJSON from 'hjson';
import * as Path from 'path';

interface Config {
  dataDirectoriy: string;

  redis: {
    host: string;
    port: number;
    db: number;
  }

  importer: {
    latestCheckInterval: number;
    fullCheckTimeout: number;
    archiveRange: number;
    cache: boolean;
  }
}

class StaticConfig {
  static dataDirectoriy = './data';

  static redis = {
    host: 'localhost',
    port: 6379,
    db: 0
  };

  static importer = {
    latestCheckInterval: 60 * 2,
    fullCheckTimeout: 60 * 45,
    archiveRange: 30,
    cache: true
  }
}

const configFileString = FS.readFileSync(Path.join(__dirname, 'config.hjson'), { encoding: 'utf-8' });
const configFile = HJSON.parse(configFileString) as Config;

StaticConfig.dataDirectoriy = configFile.dataDirectoriy;
StaticConfig.importer = configFile.importer;

export default StaticConfig as Config;
