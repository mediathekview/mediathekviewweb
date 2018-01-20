import { Directory } from './directory';

export interface Listing {
    getBaseDirectory(): Directory;
}