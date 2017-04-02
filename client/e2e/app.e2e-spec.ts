import { MediathekviewwebClientPage } from './app.po';

describe('mediathekviewweb-client App', () => {
  let page: MediathekviewwebClientPage;

  beforeEach(() => {
    page = new MediathekviewwebClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('mvw works!');
  });
});
