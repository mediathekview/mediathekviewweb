export default {
  "absoluteUris": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 10,
      "timeline": 0,
      "uri": "http://example.com/00001.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "https://example.com/00002.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "//example.com/00003.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "http://example.com/00004.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "allowCache": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "byterange": {
        "length": 522828,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 587500,
        "offset": 522828
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 713084,
        "offset": 1110328
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 476580,
        "offset": 1823412
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 535612,
        "offset": 2299992
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 207176,
        "offset": 2835604
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 455900,
        "offset": 3042780
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 657248,
        "offset": 3498680
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 571708,
        "offset": 4155928
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 485040,
        "offset": 4727636
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 709136,
        "offset": 5212676
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 730004,
        "offset": 5921812
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 456276,
        "offset": 6651816
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 468684,
        "offset": 7108092
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 444996,
        "offset": 7576776
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 331444,
        "offset": 8021772
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 44556,
        "offset": 8353216
      },
      "duration": 1.4167,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "allowCacheInvalid": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "byterange": {
        "length": 522828,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "alternateAudio": {
  allowCache: true,
  discontinuityStarts: [],
  mediaGroups: {
    // TYPE
    AUDIO: {
      // GROUP-ID
      "audio": {
        // NAME
        "English": {
          language: 'eng',
          autoselect: true,
          default: true,
          uri: "eng/prog_index.m3u8"
        },
        // NAME
        "Français": {
          language: "fre",
          autoselect: true,
          default: false,
          uri: "fre/prog_index.m3u8"
        },
        // NAME
        "Espanol": {
          language: "sp",
          autoselect: true,
          default: false,
          uri: "sp/prog_index.m3u8"
        }
      }
    },
    VIDEO: {},
    "CLOSED-CAPTIONS": {},
    SUBTITLES: {}
  },
  playlists: [{
    attributes: {
      "PROGRAM-ID": 1,
      BANDWIDTH: 195023,
      CODECS: "avc1.42e00a,mp4a.40.2",
      AUDIO: 'audio'
    },
    timeline: 0,
    uri: "lo/prog_index.m3u8"
  }, {
    attributes: {
      "PROGRAM-ID": 1,
      BANDWIDTH: 591680,
      CODECS: "avc1.42e01e,mp4a.40.2",
      AUDIO: 'audio'
    },
    timeline: 0,
    uri: "hi/prog_index.m3u8"
  }],
  segments: []
}
,
  "alternateVideo": {
  allowCache: true,
  discontinuityStarts: [],
  mediaGroups: {
    AUDIO: {
      aac: {
        English: {
          autoselect: true,
          default: true,
          language: "eng",
          uri: "eng/prog_index.m3u8"
        }
      }
    },
    VIDEO: {
      "500kbs": {
        Angle1: {
          autoselect: true,
          default: true
        },
        Angle2: {
          autoselect: true,
          default: false,
          uri: "Angle2/500kbs/prog_index.m3u8"
        },
        Angle3: {
          autoselect: true,
          default: false,
          uri: "Angle3/500kbs/prog_index.m3u8"
        }
      }
    },
    "CLOSED-CAPTIONS": {},
    SUBTITLES: {}
  },
  playlists: [{
    attributes: {
      "PROGRAM-ID": 1,
      BANDWIDTH: 754857,
      CODECS: "mp4a.40.2,avc1.4d401e",
      AUDIO: "aac",
      VIDEO: "500kbs"
    },
    timeline: 0,
    uri: "Angle1/500kbs/prog_index.m3u8"
  }],
  segments: []
}
,
  "brightcove": {
  "allowCache": true,
  "playlists": [
    {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 240000,
        "RESOLUTION": {
          "width": 396,
          "height": 224
        }
      },
      "timeline": 0,
      "uri": "http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824686811001&videoId=1824650741001"
    },
    {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 40000
      },
      "timeline": 0,
      "uri": "http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824683759001&videoId=1824650741001"
    },
    {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 440000,
        "RESOLUTION": {
          "width": 396,
          "height": 224
        }
      },
      "timeline": 0,
      "uri": "http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824686593001&videoId=1824650741001"
    },
    {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 1928000,
        "RESOLUTION": {
          "width": 960,
          "height": 540
        }
      },
      "timeline": 0,
      "uri": "http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824687660001&videoId=1824650741001"
    }
  ],
  "discontinuityStarts": [],
  "mediaGroups": {
    "VIDEO": {},
    "AUDIO": {},
    "CLOSED-CAPTIONS": {},
    "SUBTITLES": {}
  },
  "segments": []
}
,
  "byteRange": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 587500,
        "offset": 522828
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 713084,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video2.ts"
    },
    {
      "byterange": {
        "length": 476580,
        "offset": 1823412
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 535612,
        "offset": 2299992
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 207176,
        "offset": 2835604
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 455900,
        "offset": 3042780
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 657248,
        "offset": 3498680
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 571708,
        "offset": 4155928
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 485040,
        "offset": 4727636
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 709136,
        "offset": 5212676
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 730004,
        "offset": 5921812
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 456276,
        "offset": 6651816
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 468684,
        "offset": 7108092
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 444996,
        "offset": 7576776
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 331444,
        "offset": 8021772
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 44556,
        "offset": 8353216
      },
      "duration": 1.4167,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "dateTime": {
  "allowCache": false,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
  {
    "duration": 10,
    "timeline": 0,
    "uri": "hls_450k_video.ts"
  }
],
  "targetDuration": 10,
  "endList": true,
  "dateTimeString": "2016-06-22T09:20:16.166-04:00",
  "dateTimeObject": new Date("2016-06-22T09:20:16.166-04:00"),
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "disallowCache": {
  "allowCache": false,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "byterange": {
        "length": 522828,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "disc-sequence": {
  "allowCache": true,
  "mediaSequence": 0,
  "discontinuitySequence": 3,
  "segments": [
    {
      "duration": 10,
      "timeline": 3,
      "uri": "001.ts"
    },
    {
      "duration": 19,
      "timeline": 3,
      "uri": "002.ts"
    },
    {
      "discontinuity": true,
      "duration": 10,
      "timeline": 4,
      "uri": "003.ts"
    },
    {
      "duration": 11,
      "timeline": 4,
      "uri": "004.ts"
    }
  ],
  "targetDuration": 19,
  "endList": true,
  "discontinuityStarts": [2]
}
,
  "discontinuity": {
  "allowCache": true,
  "mediaSequence": 0,
  "discontinuitySequence": 0,
  "segments": [
    {
      "duration": 10,
      "timeline": 0,
      "uri": "001.ts"
    },
    {
      "duration": 19,
      "timeline": 0,
      "uri": "002.ts"
    },
    {
      "discontinuity": true,
      "duration": 10,
      "timeline": 1,
      "uri": "003.ts"
    },
    {
      "duration": 11,
      "timeline": 1,
      "uri": "004.ts"
    },
    {
      "discontinuity": true,
      "duration": 10,
      "timeline": 2,
      "uri": "005.ts"
    },
    {
      "duration": 10,
      "timeline": 2,
      "uri": "006.ts"
    },
    {
      "duration": 10,
      "timeline": 2,
      "uri": "007.ts"
    },
    {
      "discontinuity": true,
      "duration": 10,
      "timeline": 3,
      "uri": "008.ts"
    },
    {
      "duration": 16,
      "timeline": 3,
      "uri": "009.ts"
    }
  ],
  "targetDuration": 19,
  "endList": true,
  "discontinuityStarts": [2, 4, 7]
}
,
  "domainUris": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/00001.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/subdir/00002.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/00003.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/00004.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "empty": {
  "allowCache": true,
  "discontinuityStarts": [],
  "segments": []
}
,
  "emptyAllowCache": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "byterange": {
        "length": 522828,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "emptyMediaSequence": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    },
    {
      "duration": 6.08,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts"
    },
    {
      "duration": 6.6,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts"
    },
    {
      "duration": 5,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts"
    }
  ],
  "targetDuration": 8,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "emptyPlaylistType": {
  "allowCache": true,
  "mediaSequence": 0,
  "segments": [
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00001.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00002.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00003.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00004.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00005.ts"
    },
    {
      "duration": 8,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00006.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "emptyTargetDuration": {
  "allowCache": true,
  "playlists": [
    {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 240000,
        "RESOLUTION": {
          "width": 396,
          "height": 224
        }
      },
      "timeline": 0,
      "uri": "http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824686811001&videoId=1824650741001"
    },
    {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 40000
      },
      "timeline": 0,
      "uri": "http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824683759001&videoId=1824650741001"
    },
    {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 440000,
        "RESOLUTION": {
          "width": 396,
          "height": 224
        }
      },
      "timeline": 0,
      "uri": "http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824686593001&videoId=1824650741001"
    },
    {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 1928000,
        "RESOLUTION": {
          "width": 960,
          "height": 540
        }
      },
      "timeline": 0,
      "uri": "http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824687660001&videoId=1824650741001"
    }
  ],
  "discontinuityStarts": [],
  "mediaGroups": {
    "VIDEO": {},
    "AUDIO": {},
    "CLOSED-CAPTIONS": {},
    "SUBTITLES": {}
  },
  "segments": []
}
,
  "encrypted": {
  "allowCache": true,
  "mediaSequence": 7794,
  "discontinuitySequence": 0,
  "discontinuityStarts": [],
  "segments": [
    {
      "duration": 2.833,
      "timeline": 0,
      "key": {
        "method": "AES-128",
        "uri": "https://priv.example.com/key.php?r=52"
      },
      "uri": "http://media.example.com/fileSequence52-A.ts"
    },
    {
      "duration": 15,
      "timeline": 0,
      "key": {
        "method": "AES-128",
        "uri": "https://priv.example.com/key.php?r=52"
      },
      "uri": "http://media.example.com/fileSequence52-B.ts"
    },
    {
      "duration": 13.333,
      "timeline": 0,
      "key": {
        "method": "AES-128",
        "uri": "https://priv.example.com/key.php?r=52"
      },
      "uri": "http://media.example.com/fileSequence52-C.ts"
    },
    {
      "duration": 15,
      "timeline": 0,
      "key": {
        "method": "AES-128",
        "uri": "https://priv.example.com/key.php?r=53"
      },
      "uri": "http://media.example.com/fileSequence53-A.ts"
    },
    {
      "duration": 14,
      "timeline": 0,
      "key": {
        "method": "AES-128",
        "uri": "https://priv.example.com/key.php?r=54",
        "iv": new Uint32Array([0, 0, 331, 3063767524])
      },
      "uri": "http://media.example.com/fileSequence53-B.ts"
    },
    {
      "duration": 15,
      "timeline": 0,
      "uri": "http://media.example.com/fileSequence53-B.ts"
    }
  ],
  "targetDuration": 15
}
,
  "event": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "EVENT",
  "segments": [
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00001.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00002.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00003.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00004.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00005.ts"
    },
    {
      "duration": 8,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00006.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "extXPlaylistTypeInvalidPlaylist": {
  "allowCache": true,
  "mediaSequence": 1,
  "segments": [
    {
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    }
  ],
  "targetDuration": 8,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "extinf": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "byterange": {
        "length": 522828,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 587500,
        "offset": 522828
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 713084,
        "offset": 1110328
      },
      "duration": 5,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 476580,
        "offset": 1823412
      },
      "duration": 9.7,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 535612,
        "offset": 2299992
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 207176,
        "offset": 2835604
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 455900,
        "offset": 3042780
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 657248,
        "offset": 3498680
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 571708,
        "offset": 4155928
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 485040,
        "offset": 4727636
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 709136,
        "offset": 5212676
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 730004,
        "offset": 5921812
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 456276,
        "offset": 6651816
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 468684,
        "offset": 7108092
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 444996,
        "offset": 7576776
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 331444,
        "offset": 8021772
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 44556,
        "offset": 8353216
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "fmp4": {
  "allowCache": true,
  "mediaSequence": 1,
  "playlistType": "VOD",
  "targetDuration": 6,
  "discontinuitySequence": 0,
  "discontinuityStarts": [],
  "segments": [
    {
      "byterange": {
        "length": 5666510,
        "offset": 720
      },
      "duration": 6.006,
      "timeline": 0,
      "uri": "main.mp4",
      "map": {
        "byterange": {
          "length": 720,
          "offset": 0
        },
        "uri": "main.mp4"
      }
    },
    {
      "byterange": {
        "length": 5861577,
        "offset": 5667230
      },
      "duration": 6.006,
      "timeline": 0,
      "uri": "main.mp4",
      "map": {
        "byterange": {
          "length": 720,
          "offset": 0
        },
        "uri": "main.mp4"
      }
    }
  ],
  "endList": true
}
,
  "headerOnly": {
  "allowCache": true,
  "discontinuityStarts": [],
  "segments": []
}
,
  "invalidAllowCache": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "byterange": {
        "length": 522828,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "invalidMediaSequence": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    },
    {
      "duration": 6.08,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts"
    },
    {
      "duration": 6.6,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts"
    },
    {
      "duration": 5,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts"
    }
  ],
  "targetDuration": 8,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "invalidPlaylistType": {
  "allowCache": true,
  "mediaSequence": 0,
  "segments": [
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00001.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00002.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00003.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00004.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00005.ts"
    },
    {
      "duration": 8,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00006.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "invalidTargetDuration": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "byterange": {
        "length": 522828,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 587500,
        "offset": 522828
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 713084,
        "offset": 1110328
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 476580,
        "offset": 1823412
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 535612,
        "offset": 2299992
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 207176,
        "offset": 2835604
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 455900,
        "offset": 3042780
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 657248,
        "offset": 3498680
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 571708,
        "offset": 4155928
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 485040,
        "offset": 4727636
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 709136,
        "offset": 5212676
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 730004,
        "offset": 5921812
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 456276,
        "offset": 6651816
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 468684,
        "offset": 7108092
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 444996,
        "offset": 7576776
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 331444,
        "offset": 8021772
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 44556,
        "offset": 8353216
      },
      "duration": 1.4167,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }
  ],
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "liveMissingSegmentDuration": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    },
    {
      "duration": 8,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts"
    },
    {
      "duration": 8,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts"
    }
  ],
  "targetDuration": 8,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "liveStart30sBefore": {
  "allowCache": true,
  "mediaSequence": 0,
  "segments": [
    {
      "duration": 10,
      "timeline": 0,
      "uri": "001.ts"
    },
    {
      "duration": 19,
      "timeline": 0,
      "uri": "002.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "003.ts"
    },
    {
      "duration": 11,
      "timeline": 0,
      "uri": "004.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "005.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "006.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "007.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "008.ts"
    },
    {
      "duration": 16,
      "timeline": 0,
      "uri": "009.ts"
    }
  ],
  "targetDuration": 10,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "manifestExtTTargetdurationNegative": {
  "allowCache": true,
  "mediaSequence": 0,
  "segments": [
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/gogo/00001.ts"
    }
  ],
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "manifestExtXEndlistEarly": {
  "allowCache": true,
  "mediaSequence": 0,
  "segments": [
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/gogo/00001.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/gogo/00002.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/gogo/00003.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/gogo/00004.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/gogo/00005.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "manifestNoExtM3u": {
  "allowCache": true,
  "mediaSequence": 0,
  "segments": [
    {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/gogo/00001.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "master-fmp4": {
  allowCache: true,
  discontinuityStarts: [],
  mediaGroups: {
    AUDIO: {
      aud1: {
        English: {
          autoselect: true,
          default: true,
          language: "eng",
          uri: "a1/prog_index.m3u8"
        }
      },
      aud2: {
        English: {
          autoselect: true,
          default: true,
          language: "eng",
          uri: "a2/prog_index.m3u8"
        }
      },
      aud3: {
        English: {
          autoselect: true,
          default: true,
          language: "eng",
          uri: "a3/prog_index.m3u8"
        }
      }
    },
    VIDEO: {},
    "CLOSED-CAPTIONS": {
      cc1: {
        English: {
          autoselect: true,
          default: true,
          language: "eng",
          instreamId: "CC1"
        }
      }
    },
    SUBTITLES: {
      sub1: {
        English: {
          autoselect: true,
          default: true,
          language: "eng",
          uri: 's1/eng/prog_index.m3u8',
          forced: false
        }
      }
    }
  },
  playlists: [{
    attributes: {
      "AVERAGE-BANDWIDTH": "2165224",
      BANDWIDTH: 2215219,
      CODECS: "avc1.640020,mp4a.40.2",
      RESOLUTION: {
        width: 960,
        height: 540
      },
      "FRAME-RATE": "59.940",
      "CLOSED-CAPTIONS": "cc1",
      AUDIO: "aud1",
      SUBTITLES: "sub1"
    },
    timeline: 0,
    uri: "v4/prog_index.m3u8"
  },

  {
    "attributes": {
      "AUDIO": "aud1",
        "AVERAGE-BANDWIDTH": "7962844",
        "BANDWIDTH": 7976430,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,mp4a.40.2",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v8/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud1",
        "AVERAGE-BANDWIDTH": "6165024",
        "BANDWIDTH": 6181885,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,mp4a.40.2",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v7/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud1",
        "AVERAGE-BANDWIDTH": "4664459",
        "BANDWIDTH": 4682666,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,mp4a.40.2",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v6/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud1",
        "AVERAGE-BANDWIDTH": "3164759",
        "BANDWIDTH": 3170746,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.640020,mp4a.40.2",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 720,
          "width": 1280
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v5/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud1",
        "AVERAGE-BANDWIDTH": "1262552",
        "BANDWIDTH": 1276223,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64001e,mp4a.40.2",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 432,
          "width": 768
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v3/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud1",
        "AVERAGE-BANDWIDTH": "893243",
        "BANDWIDTH": 904744,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64001e,mp4a.40.2",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 360,
          "width": 640
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v2/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud1",
        "AVERAGE-BANDWIDTH": "527673",
        "BANDWIDTH": 538201,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.640015,mp4a.40.2",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 270,
          "width": 480
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v1/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud2",
        "AVERAGE-BANDWIDTH": "2390334",
        "BANDWIDTH": 2440329,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.640020,ac-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 540,
          "width": 960
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v4/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud2",
        "AVERAGE-BANDWIDTH": "8187954",
        "BANDWIDTH": 8201540,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,ac-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v8/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud2",
        "AVERAGE-BANDWIDTH": "6390134",
        "BANDWIDTH": 6406995,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,ac-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v7/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud2",
        "AVERAGE-BANDWIDTH": "4889569",
        "BANDWIDTH": 4907776,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,ac-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v6/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud2",
        "AVERAGE-BANDWIDTH": "3389869",
        "BANDWIDTH": 3395856,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.640020,ac-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 720,
          "width": 1280
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v5/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud2",
        "AVERAGE-BANDWIDTH": "1487662",
        "BANDWIDTH": 1501333,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64001e,ac-3",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 432,
          "width": 768
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v3/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud2",
        "AVERAGE-BANDWIDTH": "1118353",
        "BANDWIDTH": 1129854,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64001e,ac-3",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 360,
          "width": 640
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v2/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud2",
        "AVERAGE-BANDWIDTH": "752783",
        "BANDWIDTH": 763311,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.640015,ac-3",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 270,
          "width": 480
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v1/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud3",
        "AVERAGE-BANDWIDTH": "2198334",
        "BANDWIDTH": 2248329,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.640020,ec-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 540,
          "width": 960
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v4/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud3",
        "AVERAGE-BANDWIDTH": "7995954",
        "BANDWIDTH": 8009540,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,ec-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v8/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud3",
        "AVERAGE-BANDWIDTH": "6198134",
        "BANDWIDTH": 6214995,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,ec-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v7/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud3",
        "AVERAGE-BANDWIDTH": "4697569",
        "BANDWIDTH": 4715776,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,ec-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v6/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud3",
        "AVERAGE-BANDWIDTH": "3197869",
        "BANDWIDTH": 3203856,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.640020,ec-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 720,
          "width": 1280
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v5/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud3",
        "AVERAGE-BANDWIDTH": "1295662",
        "BANDWIDTH": 1309333,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64001e,ec-3",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 432,
          "width": 768
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v3/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud3",
        "AVERAGE-BANDWIDTH": "926353",
        "BANDWIDTH": 937854,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64001e,ec-3",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 360,
          "width": 640
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v2/prog_index.m3u8"
    },
    {
      "attributes": {
        "AUDIO": "aud3",
        "AVERAGE-BANDWIDTH": "560783",
        "BANDWIDTH": 571311,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.640015,ec-3",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 270,
          "width": 480
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v1/prog_index.m3u8"
    }],
    segments: []
}
,
  "master": {
  "allowCache": true,
  "playlists": [
    {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 240000,
        "RESOLUTION": {
          "width": 396,
          "height": 224
        }
      },
      "timeline": 0,
      "uri": "media.m3u8"
    },
    {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 40000
      },
      "timeline": 0,
      "uri": "media1.m3u8"
    },
    {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 440000,
        "RESOLUTION": {
          "width": 396,
          "height": 224
        }
      },
      "timeline": 0,
      "uri": "media2.m3u8"
    },
    {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 1928000,
        "RESOLUTION": {
          "width": 960,
          "height": 540
        }
      },
      "timeline": 0,
      "uri": "media3.m3u8"
    }
  ],
  "discontinuityStarts": [],
  "mediaGroups": {
    "VIDEO": {},
    "AUDIO": {},
    "CLOSED-CAPTIONS": {},
    "SUBTITLES": {}
  },
  segments: []
}
,
  "media": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 10,
      "timeline": 0,
      "uri": "media-00001.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "media-00002.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "media-00003.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "media-00004.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "mediaSequence": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    },
    {
      "duration": 6.08,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts"
    },
    {
      "duration": 6.6,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts"
    },
    {
      "duration": 5,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts"
    }
  ],
  "targetDuration": 8,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "missingEndlist": {
  "allowCache": true,
  "mediaSequence": 0,
  "segments": [
    {
      "duration": 10,
      "timeline": 0,
      "uri": "00001.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "00002.ts"
    }
  ],
  "targetDuration": 10,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "missingExtinf": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "missingMediaSequence": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    },
    {
      "duration": 6.08,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts"
    },
    {
      "duration": 6.6,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts"
    },
    {
      "duration": 5,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts"
    }
  ],
  "targetDuration": 8,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "missingSegmentDuration": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    },
    {
      "duration": 8,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts"
    },
    {
      "duration": 8,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts"
    },
    {
      "duration": 8,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts"
    }
  ],
  "targetDuration": 8,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "multipleAudioGroups": {
  allowCache: true,
  discontinuityStarts: [],
  mediaGroups: {
    AUDIO: {
      "audio-lo": {
        "English": {
          autoselect: true,
          default: true,
          language: "eng",
          uri: "englo/prog_index.m3u8"
        },
        "Français": {
          autoselect: true,
          default: false,
          language: "fre",
          uri: "frelo/prog_index.m3u8"
        },
        "Espanol": {
          autoselect: true,
          default: false,
          language: "sp",
          uri: "splo/prog_index.m3u8"
        }
      },
      "audio-hi": {
        "English": {
          autoselect: true,
          default: true,
          language: "eng",
          uri: "eng/prog_index.m3u8"
        },
        "Français": {
          autoselect: true,
          default: false,
          language: "fre",
          uri: "fre/prog_index.m3u8"
        },
        "Espanol": {
          autoselect: true,
          default: false,
          language: "sp",
          uri: "sp/prog_index.m3u8"
        }
      }
    },
    VIDEO: {},
    "CLOSED-CAPTIONS": {},
    SUBTITLES: {}
  },
  playlists: [{
    attributes: {
      "PROGRAM-ID": 1,
      BANDWIDTH: 195023,
      CODECS: "mp4a.40.5",
      AUDIO: "audio-lo",
    },
    timeline: 0,
    uri: "lo/prog_index.m3u8"
  }, {
    attributes: {
      "PROGRAM-ID": 1,
      BANDWIDTH: 260000,
      CODECS: "avc1.42e01e,mp4a.40.2",
      AUDIO: "audio-lo"
    },
    timeline: 0,
    uri: "lo2/prog_index.m3u8"
  }, {
    attributes: {
      "PROGRAM-ID": 1,
      BANDWIDTH: 591680,
      CODECS: "mp4a.40.2, avc1.64001e",
      AUDIO: "audio-hi"
    },
    timeline: 0,
    uri: "hi/prog_index.m3u8"
  }, {
    attributes: {
      "PROGRAM-ID": 1,
      BANDWIDTH: 650000,
      CODECS: "avc1.42e01e,mp4a.40.2",
      AUDIO: "audio-hi"
    },
    timeline: 0,
    uri: "hi2/prog_index.m3u8"
  }],
  segments: []
}
,
  "multipleAudioGroupsCombinedMain": {
  allowCache: true,
  discontinuityStarts: [],
  mediaGroups: {
    AUDIO: {
      "audio-lo": {
        "English": {
          autoselect: true,
          default: true,
          language: "eng",
        },
        "Français": {
          autoselect: true,
          default: false,
          language: "fre",
          uri: "frelo/prog_index.m3u8"
        },
        "Espanol": {
          autoselect: true,
          default: false,
          language: "sp",
          uri: "splo/prog_index.m3u8"
        }
      },
      "audio-hi": {
        "English": {
          autoselect: true,
          default: true,
          language: "eng",
          uri: "eng/prog_index.m3u8"
        },
        "Français": {
          autoselect: true,
          default: false,
          language: "fre",
          uri: "fre/prog_index.m3u8"
        },
        "Espanol": {
          autoselect: true,
          default: false,
          language: "sp",
          uri: "sp/prog_index.m3u8"
        }
      }
    },
    VIDEO: {},
    "CLOSED-CAPTIONS": {},
    SUBTITLES: {}
  },
  playlists: [{
    attributes: {
      "PROGRAM-ID": 1,
      BANDWIDTH: 195023,
      CODECS: "mp4a.40.5",
      AUDIO: "audio-lo",
    },
    timeline: 0,
    uri: "lo/prog_index.m3u8"
  }, {
    attributes: {
      "PROGRAM-ID": 1,
      BANDWIDTH: 260000,
      CODECS: "avc1.42e01e,mp4a.40.2",
      AUDIO: "audio-lo"
    },
    timeline: 0,
    uri: "lo2/prog_index.m3u8"
  }, {
    attributes: {
      "PROGRAM-ID": 1,
      BANDWIDTH: 591680,
      CODECS: "mp4a.40.2, avc1.64001e",
      AUDIO: "audio-hi"
    },
    timeline: 0,
    uri: "hi/prog_index.m3u8"
  }, {
    attributes: {
      "PROGRAM-ID": 1,
      BANDWIDTH: 650000,
      CODECS: "avc1.42e01e,mp4a.40.2",
      AUDIO: "audio-hi"
    },
    timeline: 0,
    uri: "hi2/prog_index.m3u8"
  }],
  segments: []
}
,
  "multipleTargetDurations": {
  "allowCache": true,
  "mediaSequence": 0,
  "targetDuration": 10,
  "segments": [
    {
      "uri": "001.ts",
      "timeline": 0
    },
    {
      "uri": "002.ts",
      "duration": 9,
      "timeline": 0
    },
    {
      "uri": "003.ts",
      "duration": 7,
      "timeline": 0
    },
    {
      "uri": "004.ts",
      "duration": 10,
      "timeline": 0
    }
  ],
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "multipleVideo": {
  allowCache: true,
  discontinuityStarts: [],
  mediaGroups: {
    AUDIO: {
      aac: {
        English: {
          autoselect: true,
          default: true,
          language: "eng",
          uri: "eng/prog_index.m3u8"
        }
      }
    },
    VIDEO: {
      "200kbs": {
        Angle1: {
          autoselect: true,
          default: true
        },
        Angle2: {
          autoselect: true,
          default: false,
          uri: "Angle2/200kbs/prog_index.m3u8"
        },
        Angle3: {
          autoselect: true,
          default: false,
          uri: "Angle3/200kbs/prog_index.m3u8"
        }
      },
      "500kbs": {
        Angle1: {
          autoselect: true,
          default: true
        },
        Angle2: {
          autoselect: true,
          default: false,
          uri: "Angle2/500kbs/prog_index.m3u8"
        },
        Angle3: {
          autoselect: true,
          default: false,
          uri: "Angle3/500kbs/prog_index.m3u8"
        }
      }
    },
    "CLOSED-CAPTIONS": {},
    SUBTITLES: {}
  },
  playlists: [{
    attributes: {
      "PROGRAM-ID": 1,
      BANDWIDTH: 300000,
      CODECS: "mp4a.40.2,avc1.4d401e",
      AUDIO: "aac",
      VIDEO: "200kbs"
    },
    timeline: 0,
    uri: "Angle1/200kbs/prog_index.m3u"
  }, {
    attributes: {
      "PROGRAM-ID": 1,
      BANDWIDTH: 754857,
      CODECS: "mp4a.40.2,avc1.4d401e",
      AUDIO: "aac",
      VIDEO: "500kbs"
    },
    timeline: 0,
    uri: "Angle1/500kbs/prog_index.m3u8"
  }],
  segments: []
}
,
  "negativeMediaSequence": {
  "allowCache": true,
  "mediaSequence": -11,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    },
    {
      "duration": 6.08,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts"
    },
    {
      "duration": 6.6,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts"
    },
    {
      "duration": 5,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts"
    }
  ],
  "targetDuration": 8,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "playlist": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "byterange": {
        "length": 522828,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 587500,
        "offset": 522828
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 713084,
        "offset": 1110328
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 476580,
        "offset": 1823412
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 535612,
        "offset": 2299992
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 207176,
        "offset": 2835604
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 455900,
        "offset": 3042780
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 657248,
        "offset": 3498680
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 571708,
        "offset": 4155928
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 485040,
        "offset": 4727636
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 709136,
        "offset": 5212676
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 730004,
        "offset": 5921812
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 456276,
        "offset": 6651816
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 468684,
        "offset": 7108092
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 444996,
        "offset": 7576776
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 331444,
        "offset": 8021772
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    },
    {
      "byterange": {
        "length": 44556,
        "offset": 8353216
      },
      "duration": 1.4167,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "playlistMediaSequenceHigher": {
  "allowCache": true,
  "mediaSequence": 17,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    }
  ],
  "targetDuration": 8,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "streamInfInvalid": {
  "allowCache": true,
  "playlists": [
    {
      "attributes": {
        "PROGRAM-ID": 1
      },
      "timeline": 0,
      "uri": "media.m3u8"
    },
    {
      "timeline": 0,
      "uri": "media1.m3u8"
    }
  ],
  "discontinuityStarts": [],
  "mediaGroups": {
    "VIDEO": {},
    "AUDIO": {},
    "CLOSED-CAPTIONS": {},
    "SUBTITLES": {}
  },
  "segments": []
}
,
  "twoMediaSequences": {
  "allowCache": true,
  "mediaSequence": 11,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    },
    {
      "duration": 6.08,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts"
    },
    {
      "duration": 6.6,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts"
    },
    {
      "duration": 5,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts"
    }
  ],
  "targetDuration": 8,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "versionInvalid": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "whiteSpace": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 10,
      "timeline": 0,
      "uri": "http://example.com/00001.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "https://example.com/00002.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "//example.com/00003.ts"
    },
    {
      "duration": 10,
      "timeline": 0,
      "uri": "http://example.com/00004.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}
,
  "zeroDuration": {
  "allowCache": true,
  "mediaSequence": 0,
  "playlistType": "VOD",
  "segments": [
    {
      "duration": 0.01,
      "timeline": 0,
      "uri": "http://example.com/00001.ts"
    }
  ],
  "targetDuration": 10,
  "endList": true,
  "discontinuitySequence": 0,
  "discontinuityStarts": []
}

};
