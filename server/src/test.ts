import { IHTTPListing } from './interfaces/http-listing';
import { NGINXListingReader } from './nginx-listing-reader';

let reader: IHTTPListing = new NGINXListingReader();


reader.getAllFiles('https://archiv.mediathekviewweb.de/', true).then((listings) => {
  console.log('done');
  console.log(listings);
});
