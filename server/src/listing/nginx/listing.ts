import { Listing } from '../listing';
import { NginxDirectory } from './directory';

export class NginxListing implements Listing {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    getBaseDirectory(): NginxDirectory {
        return new NginxDirectory(this.baseUrl, '', new Date(0));
    }
}
