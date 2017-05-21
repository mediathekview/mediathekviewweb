import { IHTTPListing } from './interfaces/http-listing';
import { NGINXListing } from './nginx-listing';

let listing: IHTTPListing = new NGINXListing();


listing.getAllFiles('https://archiv.mediathekviewweb.de/', true).then((listings) => {
  console.log('done');
  console.log(listings);
});
