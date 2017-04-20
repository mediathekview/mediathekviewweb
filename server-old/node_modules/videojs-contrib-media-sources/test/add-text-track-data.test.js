import Qunit from 'qunit';
import { addTextTrackData } from '../src/add-text-track-data';

const { equal, module, test } = Qunit;

class MockTextTrack {
  constructor() {
    this.cues = [];
  }
  addCue(cue) {
    this.cues.push(cue);
  }
}

module('Text Track Data', {
  beforeEach() {
    this.sourceHandler = {
      inbandTextTrack_: new MockTextTrack(),
      metadataTrack_: new MockTextTrack(),
      mediaSource_: {
        duration: NaN
      },
      timestampOffset: 0
    };
  }
});

test('does nothing if no cues are specified', function() {
  addTextTrackData(this.sourceHandler, [], []);
  equal(this.sourceHandler.inbandTextTrack_.cues.length, 0, 'added no 608 cues');
  equal(this.sourceHandler.metadataTrack_.cues.length, 0, 'added no metadata cues');
});

test('creates cues for 608 captions', function() {
  addTextTrackData(this.sourceHandler, [{
    startTime: 0,
    endTime: 1,
    text: 'caption text'
  }], []);
  equal(this.sourceHandler.inbandTextTrack_.cues.length, 1, 'added one 608 cues');
  equal(this.sourceHandler.metadataTrack_.cues.length, 0, 'added no metadata cues');
});

test('creates cues for timed metadata', function() {
  addTextTrackData(this.sourceHandler, [], [{
    cueTime: 1,
    frames: [{}]
  }]);
  equal(this.sourceHandler.inbandTextTrack_.cues.length, 0, 'added no 608 cues');
  equal(this.sourceHandler.metadataTrack_.cues.length, 1, 'added one metadata cues');
});
