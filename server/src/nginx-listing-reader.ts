import * as request from 'request';



export class NGINXListingReader {
  async getAllFiles(recursive: boolean): Promise<ListingFile[]> {
  }

  private async getListings(url: string, recursive: boolean): Promise<Listing[]> {
    let response = await this.requestAsync(url);




  }

  async requestAsync(url: string): Promise<{ response: request.RequestResponse, body: string }> {
    return new Promise<{ response: request.RequestResponse, body: string }>((resolve, reject) => {
      request.get(url, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve({ response: response, body: body });
        }
      });
    });
  }

  parseBody(body: string) {
   let pattern = /^<a href="(.*?)">(.*?)<\/a>\s*(\S+)\s+(\S+)/gm;

    let matches: RegExpExecArray[] = [];

    let match: RegExpExecArray;
    while ((match = pattern.exec(body)) !== null) {
      matches.push(match);
    }

    let listings: Listing[] = [];

    for(let i = 0; i < matches.length; i++) {
      let match = matches[i];
      listings.push({
        name: match[1],
        url: match[2],
        type: match[2].endsWith('/') ? ListingType.Folder : ListingType.File
      });
    }
  }
}

export enum ListingType {
  File,
  Folder
}

export interface Listing {
  name: string;
  url: string;
  type: ListingType;
}
