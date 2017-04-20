export default {
  'absoluteUris': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXTINF:10,\n' +
    'http://example.com/00001.ts\n' +
    '#EXTINF:10,\n' +
    'https://example.com/00002.ts\n' +
    '#EXTINF:10,\n' +
    '//example.com/00003.ts\n' +
    '#EXTINF:10,\n' +
    'http://example.com/00004.ts\n' +
    '#ZEN-TOTAL-DURATION:57.9911\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'allowCache': '#EXTM3U\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXT-X-VERSION:4\n' +
    '#EXT-X-ALLOW-CACHE:YES\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:522828@0\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:587500@522828\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:713084@1110328\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:476580@1823412\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:535612@2299992\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:207176@2835604\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:455900@3042780\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:657248@3498680\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:571708@4155928\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:485040@4727636\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:709136@5212676\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:730004@5921812\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:456276@6651816\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:468684@7108092\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:444996@7576776\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:331444@8021772\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:1.4167,\n' +
    '#EXT-X-BYTERANGE:44556@8353216\n' +
    'hls_450k_video.ts\n' +
    '#EXT-X-ENDLIST\n',
  'allowCacheInvalid': '#EXTM3U\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXT-X-VERSION:4\n' +
    '#EXT-X-ALLOW-CACHE:0\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:522828@0\n' +
    'hls_450k_video.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'alternateAudio': '#EXTM3U\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",LANGUAGE="eng",NAME="English",AUTOSELECT=YES, DEFAULT=YES,URI="eng/prog_index.m3u8"\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",LANGUAGE="fre",NAME="Français",AUTOSELECT=YES, DEFAULT=NO,URI="fre/prog_index.m3u8"\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",LANGUAGE="sp",NAME="Espanol",AUTOSELECT=YES, DEFAULT=NO,URI="sp/prog_index.m3u8"\n' +
    '\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=195023,CODECS="avc1.42e00a,mp4a.40.2",AUDIO="audio"\n' +
    'lo/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=591680,CODECS="avc1.42e01e,mp4a.40.2",AUDIO="audio"\n' +
    'hi/prog_index.m3u8\n',
  'alternateVideo': '#EXTM3U\n' +
    '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="500kbs",NAME="Angle1",AUTOSELECT=YES,DEFAULT=YES\n' +
    '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="500kbs",NAME="Angle2",AUTOSELECT=YES,DEFAULT=NO,URI="Angle2/500kbs/prog_index.m3u8"\n' +
    '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="500kbs",NAME="Angle3",AUTOSELECT=YES,DEFAULT=NO,URI="Angle3/500kbs/prog_index.m3u8"\n' +
    '\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",LANGUAGE="eng",NAME="English",AUTOSELECT=YES,DEFAULT=YES,URI="eng/prog_index.m3u8"\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=754857,CODECS="mp4a.40.2,avc1.4d401e",VIDEO="500kbs",AUDIO="aac"\n' +
    'Angle1/500kbs/prog_index.m3u8\n',
  'brightcove': '#EXTM3U\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=240000,RESOLUTION=396x224\n' +
    'http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824686811001&videoId=1824650741001\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=40000\n' +
    'http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824683759001&videoId=1824650741001\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=440000,RESOLUTION=396x224\n' +
    'http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824686593001&videoId=1824650741001\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=1928000,RESOLUTION=960x540\n' +
    'http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824687660001&videoId=1824650741001\n' +
    '\n',
  'byteRange': '#EXTM3U\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXT-X-VERSION:3\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXTINF:10,\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:587500@522828\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:713084\n' +
    'hls_450k_video2.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:476580@1823412\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:535612@2299992\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:207176@2835604\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:455900@3042780\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:657248@3498680\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:571708@4155928\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:485040@4727636\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:709136@5212676\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:730004@5921812\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:456276@6651816\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:468684@7108092\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:444996@7576776\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:331444@8021772\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:1.4167,\n' +
    '#EXT-X-BYTERANGE:44556@8353216\n' +
    'hls_450k_video.ts\n' +
    '#EXT-X-ENDLIST\n',
  'dateTime': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-PROGRAM-DATE-TIME:2016-06-22T09:20:16.166-04:00\n' +
    '#EXT-X-ALLOW-CACHE:NO\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXTINF:10\n' +
    'hls_450k_video.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'disallowCache': '#EXTM3U\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXT-X-VERSION:4\n' +
    '#EXT-X-ALLOW-CACHE:NO\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:522828@0\n' +
    'hls_450k_video.ts\n' +
    '#EXT-X-ENDLIST\n',
  'disc-sequence': '#EXTM3U\n' +
    '#EXT-X-VERSION:3\n' +
    '#EXT-X-TARGETDURATION:19\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-DISCONTINUITY-SEQUENCE:3\n' +
    '#EXTINF:10,0\n' +
    '001.ts\n' +
    '#EXTINF:19,0\n' +
    '002.ts\n' +
    '#EXT-X-DISCONTINUITY\n' +
    '#EXTINF:10,0\n' +
    '003.ts\n' +
    '#EXTINF:11,0\n' +
    '004.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'discontinuity': '#EXTM3U\n' +
    '#EXT-X-VERSION:3\n' +
    '#EXT-X-TARGETDURATION:19\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXTINF:10,0\n' +
    '001.ts\n' +
    '#EXTINF:19,0\n' +
    '002.ts\n' +
    '#EXT-X-DISCONTINUITY\n' +
    '#EXTINF:10,0\n' +
    '003.ts\n' +
    '#EXTINF:11,0\n' +
    '004.ts\n' +
    '#EXT-X-DISCONTINUITY\n' +
    '#EXTINF:10,0\n' +
    '005.ts\n' +
    '#EXTINF:10,0\n' +
    '006.ts\n' +
    '#EXTINF:10,0\n' +
    '007.ts\n' +
    '#EXT-X-DISCONTINUITY\n' +
    '#EXTINF:10,0\n' +
    '008.ts\n' +
    '#EXTINF:16,0\n' +
    '009.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'domainUris': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXTINF:10,\n' +
    '/00001.ts\n' +
    '#EXTINF:10,\n' +
    '/subdir/00002.ts\n' +
    '#EXTINF:10,\n' +
    '/00003.ts\n' +
    '#EXTINF:10,\n' +
    '/00004.ts\n' +
    '#ZEN-TOTAL-DURATION:57.9911\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'empty': '\n',
  'emptyAllowCache': '#EXTM3U\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXT-X-VERSION:4\n' +
    '#EXT-X-ALLOW-CACHE:\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:522828@0\n' +
    'hls_450k_video.ts\n' +
    '#EXT-X-ENDLIST\n',
  'emptyMediaSequence': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-MEDIA-SEQUENCE:\n' +
    '#EXT-X-ALLOW-CACHE:YES\n' +
    '#EXT-X-TARGETDURATION:8\n' +
    '#EXTINF:6.640,{}\n' +
    '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' +
    '#EXTINF:6.080,{}\n' +
    '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' +
    '#EXTINF:6.600,{}\n' +
    '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' +
    '#EXTINF:5.000,{}\n' +
    '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'emptyPlaylistType': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00001.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00002.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00003.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00004.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00005.ts\n' +
    '#EXTINF:8,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00006.ts\n' +
    '#ZEN-TOTAL-DURATION:57.9911\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'emptyTargetDuration': '#EXTM3U\n' +
    '#EXT-X-TARGETDURATION:\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=240000,RESOLUTION=396x224\n' +
    'http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824686811001&videoId=1824650741001\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=40000\n' +
    'http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824683759001&videoId=1824650741001\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=440000,RESOLUTION=396x224\n' +
    'http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824686593001&videoId=1824650741001\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=1928000,RESOLUTION=960x540\n' +
    'http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824687660001&videoId=1824650741001\n' +
    '\n',
  'encrypted': '#EXTM3U\n' +
    '#EXT-X-VERSION:3\n' +
    '#EXT-X-MEDIA-SEQUENCE:7794\n' +
    '#EXT-X-TARGETDURATION:15\n' +
    '\n' +
    '#EXT-X-KEY:METHOD=AES-128,URI="https://priv.example.com/key.php?r=52"\n' +
    '\n' +
    '#EXTINF:2.833,\n' +
    'http://media.example.com/fileSequence52-A.ts\n' +
    '#EXTINF:15.0,\n' +
    'http://media.example.com/fileSequence52-B.ts\n' +
    '#EXTINF:13.333,\n' +
    'http://media.example.com/fileSequence52-C.ts\n' +
    '\n' +
    '#EXT-X-KEY:METHOD=AES-128,URI="https://priv.example.com/key.php?r=53"\n' +
    '\n' +
    '#EXTINF:15.0,\n' +
    'http://media.example.com/fileSequence53-A.ts\n' +
    '\n' +
    '#EXT-X-KEY:METHOD=AES-128,URI="https://priv.example.com/key.php?r=54",IV=0x00000000000000000000014BB69D61E4\n' +
    '\n' +
    '#EXTINF:14.0,\n' +
    'http://media.example.com/fileSequence53-B.ts\n' +
    '\n' +
    '#EXT-X-KEY:METHOD=NONE\n' +
    '\n' +
    '#EXTINF:15.0,\n' +
    'http://media.example.com/fileSequence53-B.ts\n',
  'event': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:EVENT\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00001.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00002.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00003.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00004.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00005.ts\n' +
    '#EXTINF:8,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00006.ts\n' +
    '#ZEN-TOTAL-DURATION:57.9911\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'extXPlaylistTypeInvalidPlaylist': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:STRING\n' +
    '#EXT-X-MEDIA-SEQUENCE:1\n' +
    '#EXT-X-ALLOW-CACHE:YES\n' +
    '#EXT-X-TARGETDURATION:8\n' +
    '#EXTINF:6.640,{}\n' +
    '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'extinf': '#EXTM3U\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXT-X-VERSION:3\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXTINF:10\n' +
    '#EXT-X-BYTERANGE:522828@0\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:;asljasdfii11)))00,\n' +
    '#EXT-X-BYTERANGE:587500@522828\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:5,\n' +
    '#EXT-X-BYTERANGE:713084@1110328\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:9.7,\n' +
    '#EXT-X-BYTERANGE:476580@1823412\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:535612@2299992\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:207176@2835604\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:455900@3042780\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:657248@3498680\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:571708@4155928\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:485040@4727636\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:709136@5212676\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:730004@5921812\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:456276@6651816\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:468684@7108092\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:444996@7576776\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:22,\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:331444@8021772\n' +
    'hls_450k_video.ts\n' +
    '#EXT-X-BYTERANGE:44556@8353216\n' +
    'hls_450k_video.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'fmp4': '#EXTM3U\n' +
    '#EXT-X-TARGETDURATION:6\n' +
    '#EXT-X-VERSION:7\n' +
    '#EXT-X-MEDIA-SEQUENCE:1\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-INDEPENDENT-SEGMENTS\n' +
    '#EXT-X-MAP:URI="main.mp4",BYTERANGE="720@0"\n' +
    '#EXTINF:6.00600,	\n' +
    '#EXT-X-BYTERANGE:5666510@720\n' +
    'main.mp4\n' +
    '#EXTINF:6.00600,	\n' +
    '#EXT-X-BYTERANGE:5861577@5667230\n' +
    'main.mp4\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'headerOnly': '#EXTM3U\n' +
    '\n',
  'invalidAllowCache': '#EXTM3U\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXT-X-VERSION:4\n' +
    '#EXT-X-ALLOW-CACHE:MAYBE\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:522828@0\n' +
    'hls_450k_video.ts\n' +
    '#EXT-X-ENDLIST\n',
  'invalidMediaSequence': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-MEDIA-SEQUENCE:gobblegobble\n' +
    '#EXT-X-ALLOW-CACHE:YES\n' +
    '#EXT-X-TARGETDURATION:8\n' +
    '#EXTINF:6.640,{}\n' +
    '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' +
    '#EXTINF:6.080,{}\n' +
    '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' +
    '#EXTINF:6.600,{}\n' +
    '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' +
    '#EXTINF:5.000,{}\n' +
    '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'invalidPlaylistType': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:asdRASDfasdR\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00001.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00002.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00003.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00004.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00005.ts\n' +
    '#EXTINF:8,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00006.ts\n' +
    '#ZEN-TOTAL-DURATION:57.9911\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'invalidTargetDuration': '#EXTM3U\n' +
    '#EXT-X-TARGETDURATION:NaN\n' +
    '#EXT-X-VERSION:4\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:522828@0\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:587500@522828\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:713084@1110328\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:476580@1823412\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:535612@2299992\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:207176@2835604\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:455900@3042780\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:657248@3498680\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:571708@4155928\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:485040@4727636\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:709136@5212676\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:730004@5921812\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:456276@6651816\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:468684@7108092\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:444996@7576776\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:331444@8021772\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:1.4167,	\n' +
    '#EXT-X-BYTERANGE:44556@8353216\n' +
    'hls_450k_video.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'liveMissingSegmentDuration': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-ALLOW-CACHE:YES\n' +
    '#EXT-X-TARGETDURATION:8\n' +
    '#EXTINF:6.640,{}\n' +
    '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' +
    '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' +
    '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' +
    '\n',
  'liveStart30sBefore': '#EXTM3U\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-ALLOW-CACHE:YES\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXTINF:10,0\n' +
    '001.ts\n' +
    '#EXTINF:19,0\n' +
    '002.ts\n' +
    '#EXTINF:10,0\n' +
    '003.ts\n' +
    '#EXTINF:11,0\n' +
    '004.ts\n' +
    '#EXTINF:10,0\n' +
    '005.ts\n' +
    '#EXTINF:10,0\n' +
    '006.ts\n' +
    '#EXTINF:10,0\n' +
    '007.ts\n' +
    '#EXTINF:10,0\n' +
    '008.ts\n' +
    '#EXTINF:16,0\n' +
    '009.ts\n',
  'manifestExtTTargetdurationNegative': '#EXTM3U\n' +
    '#ZEN-TOTAL-DURATION:50\n' +
    '#EXT-X-TARGETDURATION:-10\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/gogo/00001.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'manifestExtXEndlistEarly': '#EXTM3U\n' +
    '#ZEN-TOTAL-DURATION:50\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/gogo/00001.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/gogo/00002.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/gogo/00003.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/gogo/00004.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/gogo/00005.ts\n' +
    '\n' +
    '\n',
  'manifestNoExtM3u': '#ZEN-TOTAL-DURATION:10\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/gogo/00001.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'master-fmp4': '#EXTM3U\n' +
    '#EXT-X-VERSION:6\n' +
    '#EXT-X-INDEPENDENT-SEGMENTS\n' +
    '\n' +
    '\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud1",LANGUAGE="eng",NAME="English",AUTOSELECT=YES,DEFAULT=YES,URI="a1/prog_index.m3u8"\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud2",LANGUAGE="eng",NAME="English",AUTOSELECT=YES,DEFAULT=YES,URI="a2/prog_index.m3u8"\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud3",LANGUAGE="eng",NAME="English",AUTOSELECT=YES,DEFAULT=YES,URI="a3/prog_index.m3u8"\n' +
    '\n' +
    '\n' +
    '#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="sub1",NAME="English",LANGUAGE="eng",DEFAULT=YES,AUTOSELECT=YES,FORCED=NO,URI="s1/eng/prog_index.m3u8"\n' +
    '\n' +
    '\n' +
    '#EXT-X-MEDIA:TYPE=CLOSED-CAPTIONS,GROUP-ID="cc1",NAME="English",LANGUAGE="eng",DEFAULT=YES,AUTOSELECT=YES,INSTREAM-ID="CC1"\n' +
    '\n' +
    '\n' +
    '#EXT-X-I-FRAME-STREAM-INF:AVERAGE-BANDWIDTH=163198,BANDWIDTH=166942,CODECS="avc1.64002a",RESOLUTION=1920x1080,URI="v6/iframe_index.m3u8"\n' +
    '#EXT-X-I-FRAME-STREAM-INF:AVERAGE-BANDWIDTH=131314,BANDWIDTH=139041,CODECS="avc1.640020",RESOLUTION=1280x720,URI="v5/iframe_index.m3u8"\n' +
    '#EXT-X-I-FRAME-STREAM-INF:AVERAGE-BANDWIDTH=100233,BANDWIDTH=101724,CODECS="avc1.640020",RESOLUTION=960x540,URI="v4/iframe_index.m3u8"\n' +
    '#EXT-X-I-FRAME-STREAM-INF:AVERAGE-BANDWIDTH=81002,BANDWIDTH=84112,CODECS="avc1.64001e",RESOLUTION=768x432,URI="v3/iframe_index.m3u8"\n' +
    '#EXT-X-I-FRAME-STREAM-INF:AVERAGE-BANDWIDTH=64987,BANDWIDTH=65835,CODECS="avc1.64001e",RESOLUTION=640x360,URI="v2/iframe_index.m3u8"\n' +
    '#EXT-X-I-FRAME-STREAM-INF:AVERAGE-BANDWIDTH=41547,BANDWIDTH=42106,CODECS="avc1.640015",RESOLUTION=480x270,URI="v1/iframe_index.m3u8"\n' +
    '\n' +
    '\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=2165224,BANDWIDTH=2215219,CODECS="avc1.640020,mp4a.40.2",RESOLUTION=960x540,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud1",SUBTITLES="sub1"\n' +
    'v4/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=7962844,BANDWIDTH=7976430,CODECS="avc1.64002a,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud1",SUBTITLES="sub1"\n' +
    'v8/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=6165024,BANDWIDTH=6181885,CODECS="avc1.64002a,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud1",SUBTITLES="sub1"\n' +
    'v7/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=4664459,BANDWIDTH=4682666,CODECS="avc1.64002a,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud1",SUBTITLES="sub1"\n' +
    'v6/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=3164759,BANDWIDTH=3170746,CODECS="avc1.640020,mp4a.40.2",RESOLUTION=1280x720,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud1",SUBTITLES="sub1"\n' +
    'v5/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=1262552,BANDWIDTH=1276223,CODECS="avc1.64001e,mp4a.40.2",RESOLUTION=768x432,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud1",SUBTITLES="sub1"\n' +
    'v3/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=893243,BANDWIDTH=904744,CODECS="avc1.64001e,mp4a.40.2",RESOLUTION=640x360,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud1",SUBTITLES="sub1"\n' +
    'v2/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=527673,BANDWIDTH=538201,CODECS="avc1.640015,mp4a.40.2",RESOLUTION=480x270,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud1",SUBTITLES="sub1"\n' +
    'v1/prog_index.m3u8\n' +
    '\n' +
    '\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=2390334,BANDWIDTH=2440329,CODECS="avc1.640020,ac-3",RESOLUTION=960x540,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud2",SUBTITLES="sub1"\n' +
    'v4/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=8187954,BANDWIDTH=8201540,CODECS="avc1.64002a,ac-3",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud2",SUBTITLES="sub1"\n' +
    'v8/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=6390134,BANDWIDTH=6406995,CODECS="avc1.64002a,ac-3",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud2",SUBTITLES="sub1"\n' +
    'v7/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=4889569,BANDWIDTH=4907776,CODECS="avc1.64002a,ac-3",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud2",SUBTITLES="sub1"\n' +
    'v6/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=3389869,BANDWIDTH=3395856,CODECS="avc1.640020,ac-3",RESOLUTION=1280x720,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud2",SUBTITLES="sub1"\n' +
    'v5/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=1487662,BANDWIDTH=1501333,CODECS="avc1.64001e,ac-3",RESOLUTION=768x432,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud2",SUBTITLES="sub1"\n' +
    'v3/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=1118353,BANDWIDTH=1129854,CODECS="avc1.64001e,ac-3",RESOLUTION=640x360,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud2",SUBTITLES="sub1"\n' +
    'v2/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=752783,BANDWIDTH=763311,CODECS="avc1.640015,ac-3",RESOLUTION=480x270,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud2",SUBTITLES="sub1"\n' +
    'v1/prog_index.m3u8\n' +
    '\n' +
    '\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=2198334,BANDWIDTH=2248329,CODECS="avc1.640020,ec-3",RESOLUTION=960x540,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud3",SUBTITLES="sub1"\n' +
    'v4/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=7995954,BANDWIDTH=8009540,CODECS="avc1.64002a,ec-3",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud3",SUBTITLES="sub1"\n' +
    'v8/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=6198134,BANDWIDTH=6214995,CODECS="avc1.64002a,ec-3",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud3",SUBTITLES="sub1"\n' +
    'v7/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=4697569,BANDWIDTH=4715776,CODECS="avc1.64002a,ec-3",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud3",SUBTITLES="sub1"\n' +
    'v6/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=3197869,BANDWIDTH=3203856,CODECS="avc1.640020,ec-3",RESOLUTION=1280x720,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud3",SUBTITLES="sub1"\n' +
    'v5/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=1295662,BANDWIDTH=1309333,CODECS="avc1.64001e,ec-3",RESOLUTION=768x432,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud3",SUBTITLES="sub1"\n' +
    'v3/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=926353,BANDWIDTH=937854,CODECS="avc1.64001e,ec-3",RESOLUTION=640x360,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud3",SUBTITLES="sub1"\n' +
    'v2/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=560783,BANDWIDTH=571311,CODECS="avc1.640015,ec-3",RESOLUTION=480x270,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud3",SUBTITLES="sub1"\n' +
    'v1/prog_index.m3u8\n' +
    '\n',
  'master': '# A simple master playlist with multiple variant streams\n' +
    '#EXTM3U\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=240000,RESOLUTION=396x224\n' +
    'media.m3u8\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1, BANDWIDTH=40000\n' +
    'media1.m3u8\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=440000,RESOLUTION=396x224\n' +
    'media2.m3u8\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=1928000,RESOLUTION=960x540\n' +
    'media3.m3u8\n' +
    '\n',
  'media': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXTINF:10,\n' +
    'media-00001.ts\n' +
    '#EXTINF:10,\n' +
    'media-00002.ts\n' +
    '#EXTINF:10,\n' +
    'media-00003.ts\n' +
    '#EXTINF:10,\n' +
    'media-00004.ts\n' +
    '#ZEN-TOTAL-DURATION:57.9911\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'media1': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXTINF:10,\n' +
    'media1-00001.ts\n' +
    '#EXTINF:10,\n' +
    'media1-00002.ts\n' +
    '#EXTINF:10,\n' +
    'media1-00003.ts\n' +
    '#EXTINF:10,\n' +
    'media1-00004.ts\n' +
    '#ZEN-TOTAL-DURATION:57.9911\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'media2': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXTINF:10,\n' +
    'media2-00001.ts\n' +
    '#EXTINF:10,\n' +
    'media2-00002.ts\n' +
    '#EXTINF:10,\n' +
    'media2-00003.ts\n' +
    '#EXTINF:10,\n' +
    'media2-00004.ts\n' +
    '#ZEN-TOTAL-DURATION:57.9911\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'media3': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXTINF:10,\n' +
    'media3-00001.ts\n' +
    '#EXTINF:10,\n' +
    'media3-00002.ts\n' +
    '#EXTINF:10,\n' +
    'media3-00003.ts\n' +
    '#EXTINF:10,\n' +
    'media3-00004.ts\n' +
    '#ZEN-TOTAL-DURATION:57.9911\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'mediaSequence': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-ALLOW-CACHE:YES\n' +
    '#EXT-X-TARGETDURATION:8\n' +
    '#EXTINF:6.640,{}\n' +
    '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' +
    '#EXTINF:6.080,{}\n' +
    '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' +
    '#EXTINF:6.600,{}\n' +
    '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' +
    '#EXTINF:5.000,{}\n' +
    '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'missingEndlist': '#EXTM3U\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXTINF:10,\n' +
    '00001.ts\n' +
    '#EXTINF:10,\n' +
    '00002.ts\n' +
    '\n',
  'missingExtinf': '#EXTM3U\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXT-X-VERSION:3\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXTINF:10\n' +
    'hls_450k_video.ts\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    'hls_450k_video.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'missingMediaSequence': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-ALLOW-CACHE:YES\n' +
    '#EXT-X-TARGETDURATION:8\n' +
    '#EXTINF:6.640,{}\n' +
    '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' +
    '#EXTINF:6.080,{}\n' +
    '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' +
    '#EXTINF:6.600,{}\n' +
    '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' +
    '#EXTINF:5.000,{}\n' +
    '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'missingSegmentDuration': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-ALLOW-CACHE:YES\n' +
    '#EXT-X-TARGETDURATION:8\n' +
    '#EXTINF:6.640,{}\n' +
    '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' +
    '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' +
    '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' +
    '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'multipleAudioGroups': '#EXTM3U\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-lo",LANGUAGE="eng",NAME="English",AUTOSELECT=YES, DEFAULT=YES,URI="englo/prog_index.m3u8"\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-lo",LANGUAGE="fre",NAME="Français",AUTOSELECT=YES, DEFAULT=NO,URI="frelo/prog_index.m3u8"\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-lo",LANGUAGE="sp",NAME="Espanol",AUTOSELECT=YES, DEFAULT=NO,URI="splo/prog_index.m3u8"\n' +
    '\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-hi",LANGUAGE="eng",NAME="English",AUTOSELECT=YES, DEFAULT=YES,URI="eng/prog_index.m3u8"\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-hi",LANGUAGE="fre",NAME="Français",AUTOSELECT=YES, DEFAULT=NO,URI="fre/prog_index.m3u8"\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-hi",LANGUAGE="sp",NAME="Espanol",AUTOSELECT=YES, DEFAULT=NO,URI="sp/prog_index.m3u8"\n' +
    '\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=195023,CODECS="mp4a.40.5", AUDIO="audio-lo"\n' +
    'lo/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=260000,CODECS="avc1.42e01e,mp4a.40.2", AUDIO="audio-lo"\n' +
    'lo2/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=591680,CODECS="mp4a.40.2, avc1.64001e", AUDIO="audio-hi"\n' +
    'hi/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=650000,CODECS="avc1.42e01e,mp4a.40.2", AUDIO="audio-hi"\n' +
    'hi2/prog_index.m3u8\n' +
    '\n',
  'multipleAudioGroupsCombinedMain': '#EXTM3U\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-lo",LANGUAGE="eng",NAME="English",AUTOSELECT=YES, DEFAULT=YES\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-lo",LANGUAGE="fre",NAME="Français",AUTOSELECT=YES, DEFAULT=NO,URI="frelo/prog_index.m3u8"\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-lo",LANGUAGE="sp",NAME="Espanol",AUTOSELECT=YES, DEFAULT=NO,URI="splo/prog_index.m3u8"\n' +
    '\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-hi",LANGUAGE="eng",NAME="English",AUTOSELECT=YES, DEFAULT=YES,URI="eng/prog_index.m3u8"\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-hi",LANGUAGE="fre",NAME="Français",AUTOSELECT=YES, DEFAULT=NO,URI="fre/prog_index.m3u8"\n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-hi",LANGUAGE="sp",NAME="Espanol",AUTOSELECT=YES, DEFAULT=NO,URI="sp/prog_index.m3u8"\n' +
    '\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=195023,CODECS="mp4a.40.5", AUDIO="audio-lo"\n' +
    'lo/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=260000,CODECS="avc1.42e01e,mp4a.40.2", AUDIO="audio-lo"\n' +
    'lo2/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=591680,CODECS="mp4a.40.2, avc1.64001e", AUDIO="audio-hi"\n' +
    'hi/prog_index.m3u8\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=650000,CODECS="avc1.42e01e,mp4a.40.2", AUDIO="audio-hi"\n' +
    'hi2/prog_index.m3u8\n' +
    '\n',
  'multipleTargetDurations': '#EXTM3U\n' +
    '001.ts\n' +
    '#EXT-X-TARGETDURATION:9\n' +
    '002.ts\n' +
    '#EXTINF:7\n' +
    '003.ts\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '004.ts\n',
  'multipleVideo': '#EXTM3U\n' +
    '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="200kbs",NAME="Angle1",AUTOSELECT=YES,DEFAULT=YES\n' +
    '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="200kbs",NAME="Angle2",AUTOSELECT=YES,DEFAULT=NO,URI="Angle2/200kbs/prog_index.m3u8"\n' +
    '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="200kbs",NAME="Angle3",AUTOSELECT=YES,DEFAULT=NO,URI="Angle3/200kbs/prog_index.m3u8"\n' +
    ' \n' +
    '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="500kbs",NAME="Angle1",AUTOSELECT=YES,DEFAULT=YES\n' +
    '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="500kbs",NAME="Angle2",AUTOSELECT=YES,DEFAULT=NO,URI="Angle2/500kbs/prog_index.m3u8"\n' +
    '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="500kbs",NAME="Angle3",AUTOSELECT=YES,DEFAULT=NO,URI="Angle3/500kbs/prog_index.m3u8"\n' +
    ' \n' +
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",LANGUAGE="eng",NAME="English",AUTOSELECT=YES,DEFAULT=YES,URI="eng/prog_index.m3u8"\n' +
    ' \n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=300000,CODECS="mp4a.40.2,avc1.4d401e",VIDEO="200kbs",AUDIO="aac"\n' +
    'Angle1/200kbs/prog_index.m3u\n' +
    ' \n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=754857,CODECS="mp4a.40.2,avc1.4d401e",VIDEO="500kbs",AUDIO="aac"\n' +
    'Angle1/500kbs/prog_index.m3u8\n',
  'negativeMediaSequence': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-MEDIA-SEQUENCE:-11\n' +
    '#EXT-X-ALLOW-CACHE:YES\n' +
    '#EXT-X-TARGETDURATION:8\n' +
    '#EXTINF:6.640,{}\n' +
    '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' +
    '#EXTINF:6.080,{}\n' +
    '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' +
    '#EXTINF:6.600,{}\n' +
    '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' +
    '#EXTINF:5.000,{}\n' +
    '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'playlist': '#EXTM3U\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXT-X-VERSION:4\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:522828@0\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:587500@522828\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:713084@1110328\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:476580@1823412\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:535612@2299992\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:207176@2835604\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:455900@3042780\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:657248@3498680\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:571708@4155928\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:485040@4727636\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:709136@5212676\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:730004@5921812\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:456276@6651816\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:468684@7108092\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:444996@7576776\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,	\n' +
    '#EXT-X-BYTERANGE:331444@8021772\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:1.4167,	\n' +
    '#EXT-X-BYTERANGE:44556@8353216\n' +
    'hls_450k_video.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'playlistMediaSequenceHigher': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-MEDIA-SEQUENCE:17\n' +
    '#EXT-X-ALLOW-CACHE:YES\n' +
    '#EXT-X-TARGETDURATION:8\n' +
    '#EXTINF:6.640,{}\n' +
    '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'playlist_allow_cache_template': '#EXTM3U\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXT-X-VERSION:{{{version}}}\n' +
    '{{#if allowCache}}#EXT-X-ALLOW-CACHE:{{{allowCache}}}{{/if}}\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:522828@0\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:587500@522828\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:713084@1110328\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:476580@1823412\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:535612@2299992\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:207176@2835604\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:455900@3042780\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:657248@3498680\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:571708@4155928\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:485040@4727636\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:709136@5212676\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:730004@5921812\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:456276@6651816\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:468684@7108092\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:444996@7576776\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:331444@8021772\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:1.4167,\n' +
    '#EXT-X-BYTERANGE:44556@8353216\n' +
    'hls_450k_video.ts\n' +
    '#EXT-X-ENDLIST\n',
  'playlist_byte_range_template': '#EXTM3U\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXT-X-VERSION:{{{version}}}\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXTINF:10,\n' +
    '{{#if byteRange}}#EXT-X-BYTERANGE:{{{byteRange}}}{{/if}}\n' +
    '//#EXT-X-BYTERANGE:522828@0\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '{{#if byteRange1}}#EXT-X-BYTERANGE:{{{byteRange1}}}{{/if}}\n' +
    '//#EXT-X-BYTERANGE:587500@522828\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:713084@1110328\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:476580@1823412\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:535612@2299992\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:207176@2835604\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:455900@3042780\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:657248@3498680\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:571708@4155928\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:485040@4727636\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:709136@5212676\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:730004@5921812\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:456276@6651816\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:468684@7108092\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:444996@7576776\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:10,\n' +
    '#EXT-X-BYTERANGE:331444@8021772\n' +
    'hls_450k_video.ts\n' +
    '#EXTINF:1.4167,\n' +
    '{{#if byteRange2}}#EXT-X-BYTERANGE:{{{byteRange2}}}{{/if}}\n' +
    '//#EXT-X-BYTERANGE:44556@8353216\n' +
    'hls_450k_video.ts\n' +
    '#EXT-X-ENDLIST\n',
  'playlist_extinf_template': '#EXTM3U\n' +
    '  #EXT-X-TARGETDURATION:10\n' +
    '  #EXT-X-VERSION:{{{version}}}\n' +
    '  #EXT-X-MEDIA-SEQUENCE:0\n' +
    '  #EXT-X-PLAYLIST-TYPE:VOD\n' +
    '  {{#if extInf}}#EXTINF:{{{extInf}}}{{/if}}\n' +
    '  #EXT-X-BYTERANGE:522828@0\n' +
    '  {{#if segment}}{{{segment}}}\n{{/if}}\n' +
    '  {{#if extInf1}}#EXTINF:{{{extInf1}}}{{/if}}\n' +
    '  #EXT-X-BYTERANGE:587500@522828\n' +
    '  hls_450k_video.ts\n' +
    '  #EXTINF:10,\n' +
    '  #EXT-X-BYTERANGE:713084@1110328\n' +
    '  hls_450k_video.ts\n' +
    '  #EXTINF:10,\n' +
    '  #EXT-X-BYTERANGE:476580@1823412\n' +
    '  hls_450k_video.ts\n' +
    '  #EXTINF:10,\n' +
    '  #EXT-X-BYTERANGE:535612@2299992\n' +
    '  hls_450k_video.ts\n' +
    '  #EXTINF:10,\n' +
    '  #EXT-X-BYTERANGE:207176@2835604\n' +
    '  hls_450k_video.ts\n' +
    '  #EXTINF:10,\n' +
    '  #EXT-X-BYTERANGE:455900@3042780\n' +
    '  hls_450k_video.ts\n' +
    '  #EXTINF:10,\n' +
    '  #EXT-X-BYTERANGE:657248@3498680\n' +
    '  hls_450k_video.ts\n' +
    '  #EXTINF:10,\n' +
    '  #EXT-X-BYTERANGE:571708@4155928\n' +
    '  hls_450k_video.ts\n' +
    '  #EXTINF:10,\n' +
    '  #EXT-X-BYTERANGE:485040@4727636\n' +
    '  hls_450k_video.ts\n' +
    '  #EXTINF:10,\n' +
    '  #EXT-X-BYTERANGE:709136@5212676\n' +
    '  hls_450k_video.ts\n' +
    '  #EXTINF:10,\n' +
    '  #EXT-X-BYTERANGE:730004@5921812\n' +
    '  hls_450k_video.ts\n' +
    '  #EXTINF:10,\n' +
    '  #EXT-X-BYTERANGE:456276@6651816\n' +
    '  hls_450k_video.ts\n' +
    '  #EXTINF:10,\n' +
    '  #EXT-X-BYTERANGE:468684@7108092\n' +
    '  hls_450k_video.ts\n' +
    '  #EXTINF:10,\n' +
    '  #EXT-X-BYTERANGE:444996@7576776\n' +
    '  hls_450k_video.ts\n' +
    '  #EXTINF:10,\n' +
    '  #EXT-X-BYTERANGE:331444@8021772\n' +
    '  hls_450k_video.ts\n' +
    '  {{#if extInf2}}#EXTINF:{{{extInf2}}}{{/if}}\n' +
    '  #EXT-X-BYTERANGE:44556@8353216\n' +
    '  hls_450k_video.ts\n' +
    '  #EXT-X-ENDLIST\n' +
    '\n',
  'playlist_media_sequence_template': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '{{#if mediaSequence}}#EXT-X-MEDIA-SEQUENCE:{{{mediaSequence}}}{{/if}}\n' +
    '{{#if mediaSequence1}}#EXT-X-MEDIA-SEQUENCE:{{{mediaSequence2}}}{{/if}}\n' +
    '#EXT-X-ALLOW-CACHE:YES\n' +
    '#EXT-X-TARGETDURATION:8\n' +
    '#EXTINF:6.640,{}\n' +
    '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' +
    '#EXTINF:6.080,{}\n' +
    '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' +
    '#EXTINF:6.600,{}\n' +
    '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' +
    '#EXTINF:5.000,{}\n' +
    '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'playlist_target_duration_template': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-ALLOW-CACHE:YES\n' +
    '{{#if targetDuration}}#EXT-X-TARGETDURATION:{{{targetDuration}}}{{/if}}\n' +
    '#EXTINF:6.640,{}\n' +
    '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' +
    '#EXTINF:6.080,{}\n' +
    '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' +
    '#EXTINF:6.600,{}\n' +
    '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' +
    '#EXTINF:5.000,{}\n' +
    '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'playlist_type_template': '#EXTM3U\n' +
    '{{#if playlistType}}#EXT-X-PLAYLIST-TYPE:{{{playlistType}}}{{/if}}\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00001.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00002.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00003.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00004.ts\n' +
    '#EXTINF:10,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00005.ts\n' +
    '#EXTINF:8,\n' +
    '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00006.ts\n' +
    '#ZEN-TOTAL-DURATION:57.9911\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'streamInfInvalid': '# A simple master playlist with multiple variant streams\n' +
    '#EXTM3U\n' +
    '#EXT-X-STREAM-INF:PROGRAM-ID=1\n' +
    'media.m3u8\n' +
    '#EXT-X-STREAM-INF:\n' +
    'media1.m3u8\n' +
    '\n',
  'twoMediaSequences': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-MEDIA-SEQUENCE:11\n' +
    '#EXT-X-ALLOW-CACHE:YES\n' +
    '#EXT-X-TARGETDURATION:8\n' +
    '#EXTINF:6.640,{}\n' +
    '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' +
    '#EXTINF:6.080,{}\n' +
    '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' +
    '#EXTINF:6.600,{}\n' +
    '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' +
    '#EXTINF:5.000,{}\n' +
    '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'versionInvalid': '#EXTM3U\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '#EXT-X-VERSION:NaN\n' +
    '#EXT-X-MEDIA-SEQUENCE:0\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXTINF:10,\n' +
    'hls_450k_video.ts\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'whiteSpace': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '    \n' +
    '#EXTINF:10,\n' +
    'http://example.com/00001.ts \n' +
    '#EXTINF:10,\n' +
    ' https://example.com/00002.ts\n' +
    '#EXTINF:10,\n' +
    ' //example.com/00003.ts \n' +
    '#EXTINF:10,\n' +
    '	http://example.com/00004.ts\n' +
    '#ZEN-TOTAL-DURATION:57.9911\n' +
    '#EXT-X-ENDLIST\n' +
    '\n',
  'zeroDuration': '#EXTM3U\n' +
    '#EXT-X-PLAYLIST-TYPE:VOD\n' +
    '#EXT-X-TARGETDURATION:10\n' +
    '\n' +
    '#EXTINF:0,\n' +
    'http://example.com/00001.ts\n' +
    '#ZEN-TOTAL-DURATION:57.9911\n' +
    '#EXT-X-ENDLIST\n' +
    '\n'
};
