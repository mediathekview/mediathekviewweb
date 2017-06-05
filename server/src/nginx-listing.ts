import { AsyncRequest } from './async-request';
import { Listing, ListingType, IHTTPListing } from './interfaces/http-listing';

export class NGINXListing implements IHTTPListing {
  async getAllFiles(url: string, recursive: boolean): Promise<Listing[]> {
    let listings = await this.getAllListings(url, recursive);
    return listings.filter((listing) => listing.type == ListingType.File);
  }

  async getAllFolders(url: string, recursive: boolean): Promise<Listing[]> {
    let listings = await this.getAllListings(url, recursive);
    return listings.filter((listing) => listing.type == ListingType.Folder);
  }

  async getAllListings(url: string, recursive: boolean): Promise<Listing[]> {
    let response = await AsyncRequest.get(url);

    let listings = this.parseBody(url, response.body);

    if (recursive) {
      let folders = listings.filter((listing) => listing.type == ListingType.Folder);

      let promises: Promise<Listing[]>[] = [];

      for (let i = 0; i < folders.length; i++) {
        promises.push(this.getAllListings(folders[i].url, recursive));
      }

      let subListings = await Promise.all(promises);

      for (let i = 0; i < subListings.length; i++) {
        listings = listings.concat(subListings[i]);
      }
    }

    return listings;
  }

  private parseBody(url: string, body: string): Listing[] {
    let pattern = /^<a href="(.*?)">(.*?)<\/a>\s*(\S+)\s+(\S+)/gm;

    let matches: RegExpExecArray[] = [];

    let match: RegExpExecArray;
    while ((match = pattern.exec(body)) !== null) {
      matches.push(match);
    }

    let listings: Listing[] = [];

    if (!url.endsWith('/')) {
      url = url + '/';
    }

    for (let i = 0; i < matches.length; i++) {
      let match = matches[i];
      listings.push({
        name: match[1],
        url: url + match[2],
        type: match[2].endsWith('/') ? ListingType.Folder : ListingType.File
      });
    }

    return listings;
  }
}
