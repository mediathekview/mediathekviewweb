import * as FS from 'fs';
import * as HTTP from 'http';
import * as HTTPS from 'https';

const data = [{
  "id": "5QvYQl38hQu1B5NWxKEwsKkAp95",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Wahlkampf auf der Klatschmohnwiese - Folge 105",
  "timestamp": 1529211900,
  "duration": 739,
  "description": "Die Wiesenbewohner beklagen sich über die vielen Versammlungen der letzten Zeit. Das sei viel zu zeitaufwändig und mühsam. Flip macht daraufhin den Vorschlag ein Wiesenoberhaupt zu wählen.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/wahlkampf-klatschmohnwiese-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171113_folge_105_wahlkampf_maj/7/171113_folge_105_wahlkampf_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171113_folge_105_wahlkampf_maj/7/171113_folge_105_wahlkampf_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171113_folge_105_wahlkampf_maj/7/171113_folge_105_wahlkampf_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171113_folge_105_wahlkampf_maj/7/Die_Biene_Maja_Wahlkampf_auf_der_Klatschmohnwiese.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1529193600,
  "time": 18300,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "kUEJaKOeMqWTrhByKWYBUlhHYBJ",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Das Honig-Diplom - Folge 104",
  "timestamp": 1529211300,
  "duration": 760,
  "description": "Frau Kassandra ist krank und so springt Richter Bienenwachs für sie als Vertretungslehrer ein. Sehr zum Leidwesen der Bienenschüler,  denn der Unterricht bei Bienenwachs ist sehr langweilig.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/das-honig-diplom-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171109_honig_folge_104_maj/7/171109_honig_folge_104_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171109_honig_folge_104_maj/7/171109_honig_folge_104_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171109_honig_folge_104_maj/7/171109_honig_folge_104_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171109_honig_folge_104_maj/7/F1014650_hoh_deu_Die_Biene_Maja_Das_Honigdiplom.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1529193600,
  "time": 17700,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "7LSWuKHVS1mFRwZ40egWPqFuBW6",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Kurt will berühmt werden - Folge 103",
  "timestamp": 1528607100,
  "duration": 742,
  "description": "Maja und Willi sollen für den Unterricht bei Frau Kassandra eine Liste mit berühmten Insekten erstellen. Dabei stellt Kurt fest, dass es bedauerlicherweise keinen berühmten Mistkäfer gibt.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/kurt-beruehmt-werden-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171113_folge_103_kurt_beruehmt_maj/6/171113_folge_103_kurt_beruehmt_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171113_folge_103_kurt_beruehmt_maj/6/171113_folge_103_kurt_beruehmt_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171113_folge_103_kurt_beruehmt_maj/6/171113_folge_103_kurt_beruehmt_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171113_folge_103_kurt_beruehmt_maj/6/Die_Biene_Maja_Kurt_will_beruehmt_werden.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1528588800,
  "time": 18300,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "1GKR87yMt4NlnVNt2dd6FFgFKet",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Die fantastischen Vier - Folge 102",
  "timestamp": 1528606500,
  "duration": 754,
  "description": "Maja erfährt von Flip, dass er vor langer Zeit eine Band mit seinen drei Cousins, Flop, Flap und Flup hatte. Die Band hat sich nach einem Streit aufgelöst. Warum weiß Flip nicht mehr.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/die-fantastischen-vier-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_fanstastische_vier_folge102_maj/6/171107_fanstastische_vier_folge102_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_fanstastische_vier_folge102_maj/6/171107_fanstastische_vier_folge102_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_fanstastische_vier_folge102_maj/6/171107_fanstastische_vier_folge102_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171107_fanstastische_vier_folge102_maj/6/F1014584_hoh_deu_Die_Biene_Maja_Die_fantastischen_Vier.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1528588800,
  "time": 17700,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "uGB6Ykl3EphjWFB4dJUbaBN9haV",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Das Lied der Ameisen - Folge 101",
  "timestamp": 1528002300,
  "duration": 728,
  "description": "Richter Bienenwachs ist beeindruckt, wie gut die Ameisen in Reih und Glied marschieren können. Seiner Meinung nach hilft das Lied der Ameisen der Truppe, so im Gleichklang zu marschieren.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/das-lied-der-ameisen-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171109_ameisen_folge_101_maj/6/171109_ameisen_folge_101_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171109_ameisen_folge_101_maj/6/171109_ameisen_folge_101_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171109_ameisen_folge_101_maj/6/171109_ameisen_folge_101_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171109_ameisen_folge_101_maj/6/F1014649_hoh_deu_Die_Biene_Maja_Das_Lied_der_Ameisen.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1527984000,
  "time": 18300,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "f33HjrQmpiEt3uVfAVlsmwBX3gc",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Operation Blaumeise - Folge 99",
  "timestamp": 1527397500,
  "duration": 732,
  "description": "Paul wird von der Bienenkönigin für seine Leistung zum Ordensträger der Bienenwabe erklärt. Willi und Maja sind begeistert. Zur gleichen Zeit beginnt die Eröffnungsfeier des neuen Ameisennests.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/operation-blaumeise-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171109_blaumeise_folge_99_maj/5/171109_blaumeise_folge_99_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171109_blaumeise_folge_99_maj/5/171109_blaumeise_folge_99_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171109_blaumeise_folge_99_maj/5/171109_blaumeise_folge_99_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171109_blaumeise_folge_99_maj/5/F1014648_hoh_deu_Die_Biene_Maja_Operation_Blaumeise.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1527379200,
  "time": 18300,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "sVNr6YKktLfbogwQMFxA6vVozLv",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Königin Maja - Folge 98",
  "timestamp": 1527396600,
  "duration": 735,
  "description": "Die Bienenkönigin muss für einen Tag den Stock verlassen und ernennt Maja in dieser Zeit zu ihrer Vertreterin. Richter Bienenwachs neidet Maja die Beförderung und schikaniert sie.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/koenigin-maja-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_koenigin_maja_folge98_maj/5/171107_koenigin_maja_folge98_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_koenigin_maja_folge98_maj/5/171107_koenigin_maja_folge98_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_koenigin_maja_folge98_maj/5/171107_koenigin_maja_folge98_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171107_koenigin_maja_folge98_maj/5/F1014583_hoh_deu_Die_Biene_Maja_Koenigin_Maja.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1527379200,
  "time": 17400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "gIWVtHzd2MN6nGMgvM3uSdu9lbn",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Piekser im Bienenstock - Folge 97",
  "timestamp": 1526875500,
  "duration": 732,
  "description": "Während eines Schulausflugs entdecken Maja und Willi den regungslosen Piekser auf der Wiese. Er ist ohnmächtig, wie es scheint. Maja setzt durch, dass Piekser mit in den Bienenstock kommt.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/piekser-im-bienenstock-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_piekser_bienestock_folge97_maj/6/171107_piekser_bienestock_folge97_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_piekser_bienestock_folge97_maj/6/171107_piekser_bienestock_folge97_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_piekser_bienestock_folge97_maj/6/171107_piekser_bienestock_folge97_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171107_piekser_bienestock_folge97_maj/6/F1014477_hoh_deu_Die_Biene_Maja_Piekser_im_Bienenstock.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1526860800,
  "time": 14700,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "86zCe51o8dhotBM87GDPxWHKjJL",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Kurt trifft der Schlag - Folge 96",
  "timestamp": 1526874900,
  "duration": 732,
  "description": "Die Bienenkönigin zieht in feierlicher Prozession über die Wiese und alle Insekten jubeln ihr zu. Nur das Wetter ist nicht freundlich gestimmt. Ein Gewitter braut sich am Himmel zusammen.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/kurt-trifft-der-schlag-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_kurt_schlag_folge96_maj/6/171107_kurt_schlag_folge96_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_kurt_schlag_folge96_maj/6/171107_kurt_schlag_folge96_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_kurt_schlag_folge96_maj/6/171107_kurt_schlag_folge96_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171107_kurt_schlag_folge96_maj/6/F1014476_hoh_deu_Die_Biene_Maja_Kurt_trifft_der_Schlag.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1526860800,
  "time": 14100,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "uiHCREO2fyAKY4XO8Nz8YUvoEG2",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Falsche Freunde - Folge 95",
  "timestamp": 1526791200,
  "duration": 734,
  "description": "Max ist enttäuscht. Seine geliebte Beatrix möchte trotz Langeweile nicht mit ihm und den anderen spielen. Sie fühlt sich zu erwachsen für die Spiele der kleinen Insekten.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/falsche-freunde-104.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_falsche_freunde_folge95_maj/5/171107_falsche_freunde_folge95_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_falsche_freunde_folge95_maj/5/171107_falsche_freunde_folge95_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_falsche_freunde_folge95_maj/5/171107_falsche_freunde_folge95_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171107_falsche_freunde_folge95_maj/5/F1014475_hoh_deu_Die_Biene_Maja_Falsche_Freunde.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1526774400,
  "time": 16800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "4Fa9aLZV8DoeFSyYKmd11cVmzHF",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "(K)ein gutes Team - Folge 94",
  "timestamp": 1526790300,
  "duration": 724,
  "description": "Beim Spielen geraten Maja und Willi in Streit. Sie wirft Willi vor, dass er zu ängstlich oder verträumt spielt und sie deshalb immer verlieren. Maja hat keine Lust mehr und fliegt davon.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/k-ein-gutes-team-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_gutes_team_folge94_maj/8/171107_gutes_team_folge94_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_gutes_team_folge94_maj/8/171107_gutes_team_folge94_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_gutes_team_folge94_maj/8/171107_gutes_team_folge94_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171107_gutes_team_folge94_maj/8/F1014474_hoh_deu_Die_Biene_Maja_Kein_gutes_Team.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1526774400,
  "time": 15900,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "zbnpVfgECqPtsATm0coWm8C7WgL",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Ein Richter ohne Gnade - Folge 93",
  "timestamp": 1526187900,
  "duration": 735,
  "description": "Bens Balli tanzt aus der Reihe und macht aus Versehen die ganze Nektar-Ernte der Bienen platt. Richter Bienenwachs gibt Maja die Schuld und schwärzt sie bei der Königin an.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/richter-ohne-gnade-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_richter_gnade_folge93_maj/5/171102_richter_gnade_folge93_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_richter_gnade_folge93_maj/5/171102_richter_gnade_folge93_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_richter_gnade_folge93_maj/5/171102_richter_gnade_folge93_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171102_richter_gnade_folge93_maj/5/F1014473_hoh_deu_Die_Biene_Maja_Richter_ohne_Gnade.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1526169600,
  "time": 18300,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "6jo2tl3OUbrB9mfB9YUCRNYZPrm",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Ein Salto für die Freundschaft - Folge 92",
  "timestamp": 1526187000,
  "duration": 739,
  "description": "Frau Kassandra verkündet, dass die Königin vom Sonnensteinstock zu Besuch kommt. Ihr zu Ehren sollen die Bienenschüler eine Aufführung einüben. Maja ist begeistert und will unbedingt mitmachen.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/salto-fuer-die-freundschaft-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_salto_freundschaft_folge92_maj/5/171107_salto_freundschaft_folge92_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_salto_freundschaft_folge92_maj/5/171107_salto_freundschaft_folge92_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_salto_freundschaft_folge92_maj/5/171107_salto_freundschaft_folge92_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171107_salto_freundschaft_folge92_maj/5/F1014472_hoh_deu_Die_Biene_Maja_Ein_Salto_fuer_die_Freundschaft.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1526169600,
  "time": 17400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "eMkt2yGXpbnKeKbyXsGTVpQ3RJN",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Der Honigmampf - Folge 91",
  "timestamp": 1525583100,
  "duration": 748,
  "description": "Willi stellt in einer Schulstunde mit Frau Kassandra – entgegen den Anweisungen - einen Honig nach eigenem Rezept her. Das Ergebnis sind auffallende, rote Pusteln in seinem Gesicht.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/der-honigmampf-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_honigmampf_folge91_maj/5/171102_honigmampf_folge91_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_honigmampf_folge91_maj/5/171102_honigmampf_folge91_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_honigmampf_folge91_maj/5/171102_honigmampf_folge91_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171102_honigmampf_folge91_maj/5/F1014471_hoh_deu_Die_Biene_Maja_Der_Honigmampf.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1525564800,
  "time": 18300,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "7m1Z8a8swt8amMeWvmkL9UQs86S",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Das Schattenmonster - Folge 90",
  "timestamp": 1525582200,
  "duration": 745,
  "description": "Das Sonnenbad der Königin wird durch einen seltsamen Umstand erschwert: Auf ihrer Terrasse gibt es an diesem Morgen keine Sonne. In den Zweigen über der Terrasse hängt etwas Großes, aber was nur?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/das-schattenmonster-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_schattenmonster_folge90_maj/5/171102_schattenmonster_folge90_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_schattenmonster_folge90_maj/5/171102_schattenmonster_folge90_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_schattenmonster_folge90_maj/5/171102_schattenmonster_folge90_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171102_schattenmonster_folge90_maj/5/F1014470_hoh_deu_Die_Biene_Maja_Das_Schattenmonster.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1525564800,
  "time": 17400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "deDaAu6Ab7c0uxNr60M7rKzNCRI",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Die Verschwörung - Folge 123",
  "timestamp": 1525165200,
  "duration": 736,
  "description": "Willi und Maja finden das Notizbuch von Richter Bienenwachs und entnehmen seinen Aufzeichnungen, dass er die Königin vom Thron stürzen und selbst die Macht im Bienenstock übernehmen will.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/die-verschwoerung-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171122_verschweoerung_folge123_maj/4/171122_verschweoerung_folge123_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171122_verschweoerung_folge123_maj/4/171122_verschweoerung_folge123_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171122_verschweoerung_folge123_maj/4/171122_verschweoerung_folge123_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171122_verschweoerung_folge123_maj/4/F1014696_hoh_deu_Die_Biene_Maja_Die_Verschwoerung.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1525132800,
  "time": 32400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "xzSjLKDsM6BSj7cCBjSjDybuMcK",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Kurt und Ben reicht es - Folge 122",
  "timestamp": 1525164600,
  "duration": 727,
  "description": "Der Höhleneingang von Max wird zum wiederholten Mal von einem Mistball versperrt. Er ist sauer und hat genug davon, nicht in seine Höhle hinein oder hinaus zu kommen.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/kurt-und-ben-reicht-es-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171122_reicht_es_folge122_maj/3/171122_reicht_es_folge122_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171122_reicht_es_folge122_maj/3/171122_reicht_es_folge122_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171122_reicht_es_folge122_maj/3/171122_reicht_es_folge122_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171122_reicht_es_folge122_maj/3/F1014695_hoh_deu_Die_Biene_Maja_Kurt_und_Ben_reicht_es.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1525132800,
  "time": 31800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "aso875HDpItnNLcSnDGZptHKXoj",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Die Bienen streiken - Folge 100",
  "timestamp": 1525164000,
  "duration": 734,
  "description": "Richter Bienenwachs verlangt von den Arbeitsbienen im Stock immer härtere und schnellere Arbeit, bis die erschöpften Bienen schließlich die Arbeit niederlegen und in den Streik treten.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/die-bienen-streiken-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171113_folge_100_streiken_maj/6/171113_folge_100_streiken_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171113_folge_100_streiken_maj/6/171113_folge_100_streiken_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171113_folge_100_streiken_maj/6/171113_folge_100_streiken_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171113_folge_100_streiken_maj/6/F1014699_hoh_deu_Die_Biene_Maja_Die_Bienen_streiken.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1525132800,
  "time": 31200,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "pnnEMmuQQCyyJIEAWI6v7v2CIZ8",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Die Austauschbiene - Folge 66",
  "timestamp": 1525163400,
  "duration": 725,
  "description": "Hannah, die neue Austauschschülerin in Frau Kassandras Klasse, möchte die Beste sein. Doch sie merkt, dass Maja sehr beliebt ist. Hannah wird neidisch auf Maja und spielt Maja gemeine Streiche. Ein Streich gerät außer Kontrolle.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/die-austauschbiene-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180427_folge_66_austausch_maj/2/180427_folge_66_austausch_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180427_folge_66_austausch_maj/2/180427_folge_66_austausch_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180427_folge_66_austausch_maj/2/180427_folge_66_austausch_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1525132800,
  "time": 30600,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "edmkYkJDw93ITojCq6RS7CpbHTW",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Willi der Spinnenjunge - Folge 89",
  "timestamp": 1524978300,
  "duration": 732,
  "description": "Willi fällt in Brombeeren, die seinen ganzen Körper lila färben. Als er sich anschließend auch noch in Theklas Netz verfängt, ist die lila Farbe jedoch sein Glück.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/willi-der-spinnenjunge-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_spinnenjunge_folge88_maj/5/171102_spinnenjunge_folge88_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_spinnenjunge_folge88_maj/5/171102_spinnenjunge_folge88_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_spinnenjunge_folge88_maj/5/171102_spinnenjunge_folge88_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171102_spinnenjunge_folge88_maj/5/F1014469_hoh_deu_Die_Biene_Maja_Willi_der_Spinnenjunge.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1524960000,
  "time": 18300,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "kEAuFtmG65gONy7uSBDCQAyL6aN",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Das süße Geheimnis - Folge 88",
  "timestamp": 1524977700,
  "duration": 725,
  "description": "Rufus sitzt auf einem Seerosenblatt im Teich und kommt nicht mehr an Land. Maja und Willi wollen ihn an Land fliegen, nur leider ist Rufus so schwer, dass sie ihn nicht heben können. Die Ameisen sollen helfen, doch die haben einen Schatz gefunden.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/das-suesse-geheimnis-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_geheimnis_folge_88_maj/5/171102_geheimnis_folge_88_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_geheimnis_folge_88_maj/5/171102_geheimnis_folge_88_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_geheimnis_folge_88_maj/5/171102_geheimnis_folge_88_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171102_geheimnis_folge_88_maj/5/F1014468_hoh_deu_Die_Biene_Maja_Das_Suesse_Geheimnis.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1524960000,
  "time": 17700,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "73ewxhlmFcPQ4ZMcxFSxk2VEjjr",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Theo - Folge 87",
  "timestamp": 1524373500,
  "duration": 732,
  "description": "Maja und Willi bekommen einen neuen Mitschüler, Theo. Sie freuen sich, vielleicht einen neuen Freund zu gewinnen. Doch Theo ist unfreundlich und abweisend.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/theo-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_theo_folge87_maj/5/171102_theo_folge87_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_theo_folge87_maj/5/171102_theo_folge87_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_theo_folge87_maj/5/171102_theo_folge87_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171102_theo_folge87_maj/5/F1014340_hoh_deu_Die_Biene_Maja_Theo.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1524355200,
  "time": 18300,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "qjBPLBr29KJ9fvRDJq3RgKhx30b",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Rosalie - Folge 86",
  "timestamp": 1524372600,
  "duration": 747,
  "description": "Walter hat ein Geheimnis. Er hat eine Kaulquappe aufgezogen, die zu einem großen Frosch namens Rosalie herangewachsen ist. Richter Bienenwachs will Rosalie loswerden.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/rosalie-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_rosalie_folge86_maj/5/171102_rosalie_folge86_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_rosalie_folge86_maj/5/171102_rosalie_folge86_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_rosalie_folge86_maj/5/171102_rosalie_folge86_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171102_rosalie_folge86_maj/5/F1014339_hoh_deu_Die_Biene_Maja_Rosalie.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1524355200,
  "time": 17400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "v1XhPhXAfTnOIus10N248WcERbC",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Die Ameisen sehen rot - Folge 85",
  "timestamp": 1523768700,
  "duration": 757,
  "description": "Kurt ist wütend, weil Paul und seine Männer vor lauter Tollpatschigkeit eine seiner schönen Mistkugeln zerstört haben.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/ameisen-sehen-rot-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_ameisen_rot_folge85_maj/5/171102_ameisen_rot_folge85_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_ameisen_rot_folge85_maj/5/171102_ameisen_rot_folge85_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_ameisen_rot_folge85_maj/5/171102_ameisen_rot_folge85_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171102_ameisen_rot_folge85_maj/5/F1014338_hoh_deu_Die_Biene_Maja_Die_Ameisen_sehen_rot.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1523750400,
  "time": 18300,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "qrJpfcw95duuxKQJF88buYB1sIi",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Die Wiesenfreunde - Folge 84",
  "timestamp": 1523767800,
  "duration": 746,
  "description": "Maja möchte mit ihren Freunden ein Theaterstück über Freundschaft zwischen Insekten aufführen. Doch die Aufführung droht zu platzen.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/die-wiesenfreunde-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_wiesenfreunde_folge84_maj/5/171102_wiesenfreunde_folge84_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_wiesenfreunde_folge84_maj/5/171102_wiesenfreunde_folge84_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_wiesenfreunde_folge84_maj/5/171102_wiesenfreunde_folge84_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171102_wiesenfreunde_folge84_maj/5/F1014337_hoh_deu_Die_Biene_Maja_Die_Wiesenfreunde.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1523750400,
  "time": 17400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "3NKkuuXYAt5cQKrNwa5Cu3ebR4H",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Die schönsten Sprüche der Klatschmohnwiese",
  "timestamp": 1523260320,
  "duration": 46,
  "description": "Maja, Willi, Flip und all die anderen Wiesenbewohner haben immer einen guten Rat. Welchen Spruch magst du am liebsten?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/schoenesten-sprueche-der-klatschmohnwiese-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/none/tivi/18/03/180321_sprueche_biene_maja_maj/1/180321_sprueche_biene_maja_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/none/tivi/18/03/180321_sprueche_biene_maja_maj/1/180321_sprueche_biene_maja_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/none/tivi/18/03/180321_sprueche_biene_maja_maj/1/180321_sprueche_biene_maja_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1523232000,
  "time": 28320,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "2nhR4rG3UlmPw5R6K133Ce5fAlM",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Flip will weg - Folge 83",
  "timestamp": 1523163900,
  "duration": 753,
  "description": "Flip ist traurig, weil der Sommer zu Ende geht. Das einzige, was gegen seine Trauer hilft, ist Geige spielen. Doch sein nächtliches Spiel lässt die Wiesenbewohner nicht schlafen.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/flip-will-weg-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_flip_weg_folge83_maj/5/171102_flip_weg_folge83_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_flip_weg_folge83_maj/5/171102_flip_weg_folge83_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_flip_weg_folge83_maj/5/171102_flip_weg_folge83_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171102_flip_weg_folge83_maj/5/F1014336_hoh_deu_Die_Biene_Maja_Flip_will_weg.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1523145600,
  "time": 18300,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "8heC9wULRIzVhSzzCYLSw1zDAZm",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Die Glücksblume - Folge 82",
  "timestamp": 1523163000,
  "duration": 739,
  "description": "Flip erzählt Maja und Willi von der Glücksblume. Das ist eine sehr seltene Blume, die nur alle hundert Jahre blüht und deren Nektar glücklich macht.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/die-gluecksblume-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_gluecksblume_folge82_maj/5/171102_gluecksblume_folge82_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_gluecksblume_folge82_maj/5/171102_gluecksblume_folge82_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_gluecksblume_folge82_maj/5/171102_gluecksblume_folge82_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171102_gluecksblume_folge82_maj/5/F1014335_hoh_deu_Die_Biene_Maja_Die_Gluecksblume.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1523145600,
  "time": 17400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "5oOYkSRsFp7j70gv6JT5QxFfgcM",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Rufus wachsen Flügel - Folge 38",
  "timestamp": 1522992600,
  "duration": 723,
  "description": "Schnecke Rufus will fliegen und Maja und Willi wollen ihm dabei helfen. Sie bauen verschiedene Fluggeräte, aber alles endet mit einer Bruchlandung. Bis ein besonderer Freund von Maja aufkreuzt.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/rufus-wachsen-fluegel-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_fluegel_folge38_maj/3/180404_fluegel_folge38_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_fluegel_folge38_maj/3/180404_fluegel_folge38_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_fluegel_folge38_maj/3/180404_fluegel_folge38_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522972800,
  "time": 19800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "aOlxPRklsdBiJ09S9O2mand81uW",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Der große Pollenklau - Folge 37",
  "timestamp": 1522992000,
  "duration": 728,
  "description": "Das große Pollenfest steht an. Die Bienen des Sonnensteinstocks bringen als Geschenk einen Kelch mit Seerosenpollen mit. Doch die Wespen wollen den Kelch klauen.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/der-grosse-pollenklau-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_pollenklau_folge37_maj/2/180404_pollenklau_folge37_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_pollenklau_folge37_maj/2/180404_pollenklau_folge37_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_pollenklau_folge37_maj/2/180404_pollenklau_folge37_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522972800,
  "time": 19200,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "6yqryG4WkI3B3PMtDHDgZGNXNL9",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Thekla ist verschnupft - Folge 36",
  "timestamp": 1522906200,
  "duration": 726,
  "description": "Spinne Thekla hat sich einen Spinnenschnupfen geholt. Nun keift sie besonders giftig über Maja und Willi. Maja beschließt, Thekla zu helfen. Aber was hilft gegen Spinnenschnupfen?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/thekla-ist-verschnupft-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_verschnupft_folge36_maj/2/180404_verschnupft_folge36_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_verschnupft_folge36_maj/2/180404_verschnupft_folge36_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_verschnupft_folge36_maj/2/180404_verschnupft_folge36_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522886400,
  "time": 19800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "s0q7s0Uib0w0ZPayc5wzBHEuQS9",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Willi, der Blattlauskönig - Folge 35",
  "timestamp": 1522905600,
  "duration": 732,
  "description": "Willi rettet kleine Blattläuse. Dafür verehren sie ihn. Was Willi nicht weiß: Paul und die Ameisen suchen nach den Blattläusen. Und Maja macht sich Sorgen um Willi.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/willi-der-blattlauskoenig-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_blattlauskoenig_folge35_maj/3/180404_blattlauskoenig_folge35_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_blattlauskoenig_folge35_maj/3/180404_blattlauskoenig_folge35_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_blattlauskoenig_folge35_maj/3/180404_blattlauskoenig_folge35_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522886400,
  "time": 19200,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "pXnBjZ0SEYtztYKGIXpYsCdmImD",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Max will schlafen - Folge 34",
  "timestamp": 1522819800,
  "duration": 732,
  "description": "Max kann nicht schlafen. In seinen Tunneln spukt es. Vielleicht ist es ein fremdes Tier? Oder ein Ungeheuer? Oder nur der Wind? Maja, Willi und Flip gehen auf die Suche in Max' unterirdischem Tunnelsystem.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/max-will-schlafen-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_schlafen_folge34_maj/3/180404_schlafen_folge34_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_schlafen_folge34_maj/3/180404_schlafen_folge34_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_schlafen_folge34_maj/3/180404_schlafen_folge34_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522800000,
  "time": 19800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "53rE63WuHueWueUM7Yiak48YQB3",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Der neue Schüler - Folge 33",
  "timestamp": 1522819200,
  "duration": 736,
  "description": "Die Wespe Jesper will Pollen-Sammeln lernen wie die Bienen. Denn Pollen zu klauen, macht ihm keinen Spaß. Maja stutzt. Kann das sein? Oder steckt dahinter ein Trick von Wespenboss Piekser.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/der-neue-schueler-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_schueler_folge33_maj/2/180404_schueler_folge33_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_schueler_folge33_maj/2/180404_schueler_folge33_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_schueler_folge33_maj/2/180404_schueler_folge33_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522800000,
  "time": 19200,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "m0BkDlPhd8FkOSf6NHLtEtp0lYr",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Die Raupenwanderung - Folge 32",
  "timestamp": 1522733400,
  "duration": 728,
  "description": "Dicke Raupen marschieren durch die Klatschmohnwiese. Ihr Ziel: eine Eiche. Aber sie gehen daran vorbei. Maja will ihnen den richtigen Weg zeigen. Doch die Raupen sind ganz schön stur.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/die-raupenwanderung-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_raupenwanderung_folge32_maj/2/180404_raupenwanderung_folge32_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_raupenwanderung_folge32_maj/2/180404_raupenwanderung_folge32_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_raupenwanderung_folge32_maj/2/180404_raupenwanderung_folge32_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522713600,
  "time": 19800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "o66dpRJDj7ADuzgUrci3cj6Rytm",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Der Schüttel-Rüttel-König - Folge 31",
  "timestamp": 1522732800,
  "duration": 738,
  "description": "Die Bienenkönigin gibt ein Konzert im Bienenstock. Grashüpfer Flip soll auf der Violine spielen und Gartenhummel Elvis soll dazu singen. Aber er weigert sich, mit Flip aufzutreten. Maja sucht nach einer Lösung.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/der-schuettel-ruettel-koenig-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_schuettel_folge31_maj/3/180404_schuettel_folge31_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_schuettel_folge31_maj/3/180404_schuettel_folge31_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_schuettel_folge31_maj/3/180404_schuettel_folge31_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522713600,
  "time": 19200,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "4ejmFV5EBaw1poudAm6niZZmPCe",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Willi muss aufpassen - Folge 81",
  "timestamp": 1522644600,
  "duration": 740,
  "description": "Willi hat keine Lust, für die drei kleinen Bienen Summsi, Brummel und Flitzi den Aufpasser zu spielen.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/willi-muss-aufpassen-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_willi_aufpassen_folge81_maj/5/171102_willi_aufpassen_folge81_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_willi_aufpassen_folge81_maj/5/171102_willi_aufpassen_folge81_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_willi_aufpassen_folge81_maj/5/171102_willi_aufpassen_folge81_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171102_willi_aufpassen_folge81_maj/5/F1014334_hoh_deu_Die_Biene_Maja_Willi_muss_aufpassen.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522627200,
  "time": 17400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "uQNCZcLVzDTMTl13uGsiIuP8f5m",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Richter Bienenwachs unter Verdacht - Folge 80",
  "timestamp": 1522644000,
  "duration": 758,
  "description": "Richter Bienenwachs wird bei einer Inspektion überfallen. Als er wieder aufwacht, finden sich Gelee-Reste an seinem Mund. Hat er das Gelee Royal gestohlen?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/richter-bienenwachs-unter-verdacht-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_bienenwachs_folge80_maj/5/171102_bienenwachs_folge80_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_bienenwachs_folge80_maj/5/171102_bienenwachs_folge80_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_bienenwachs_folge80_maj/5/171102_bienenwachs_folge80_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171102_bienenwachs_folge80_maj/5/F1014333_hoh_deu_Die_Biene_Maja_Richter_Bienenwachs_unter_Verdacht.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522627200,
  "time": 16800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "lbI2rNTfV1rPJd6owKN8GyU3KeZ",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Max und Balli stecken fest - Folge 79",
  "timestamp": 1522559100,
  "duration": 759,
  "description": "Bens Ball ist vor Max Höhle gerollt und steckt im Eingang  fest. Max ist in seiner Höhle gefangen, denn es gibt nur diesen einen Zugang.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/max-und-balli-stecken-fest-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_max_balli_folge79_neu_maj/5/171107_max_balli_folge79_neu_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_max_balli_folge79_neu_maj/5/171107_max_balli_folge79_neu_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171107_max_balli_folge79_neu_maj/5/171107_max_balli_folge79_neu_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171107_max_balli_folge79_neu_maj/5/F1014332_hoh_deu_Die_Biene_Maja_Max_und_Bali_stecken_fest_010418.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522540800,
  "time": 18300,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "wieg0GvHU8fDcMOqvti4e4zPZzK",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Die Ameisen machen Urlaub - Folge 79",
  "timestamp": 1522558200,
  "duration": 743,
  "description": "Maja überredet Ameisenoberst Paul, mit seinen Männern Ferien zu machen. \r\nDoch anfangs ist Ferien machen für die Ameisen gar nicht so einfach.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/ameisen-machen-urlaub-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_ameisen_urlaub_folge78_maj/5/171102_ameisen_urlaub_folge78_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_ameisen_urlaub_folge78_maj/5/171102_ameisen_urlaub_folge78_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171102_ameisen_urlaub_folge78_maj/5/171102_ameisen_urlaub_folge78_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171102_ameisen_urlaub_folge78_maj/5/F1014331_hoh_deu_Die_Biene_Maja_Die_Ameisen_machen_Urlaub.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522540800,
  "time": 17400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "2JQhZvAJD5HP2JAxlPlAWkbs4vf",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Willis beste Sprüche",
  "timestamp": 1522324800,
  "duration": 43,
  "description": "Willi ist Majas bester Freund und nie um einen guten Spruch verlegen.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/willis-beste-sprueche-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/none/tivi/18/03/180329_willis_beste_sprueche_maj/2/180329_willis_beste_sprueche_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/none/tivi/18/03/180329_willis_beste_sprueche_maj/2/180329_willis_beste_sprueche_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/none/tivi/18/03/180329_willis_beste_sprueche_maj/2/180329_willis_beste_sprueche_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522281600,
  "time": 43200,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "3qnn5WL15pMFguDb01CbwfiuvOa",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Majas Kuchenrezept - Folge 26",
  "timestamp": 1522301400,
  "duration": 723,
  "description": "Willi hat den Kuchen der Königin gegessen. Er war für das Eierfest. Aber ohne Kuchen keine Feier! Doch Maja hat eine Idee!",
  "website": "https://www.zdf.de/kinder/die-biene-maja/majas-kuchenrezept-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_kuchenrezept_folge26_maj/3/180404_kuchenrezept_folge26_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_kuchenrezept_folge26_maj/3/180404_kuchenrezept_folge26_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_kuchenrezept_folge26_maj/3/180404_kuchenrezept_folge26_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522281600,
  "time": 19800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "f15PtZgDp5ej9K6PXMiPBDZycF3",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Mutter Willi - Folge 25",
  "timestamp": 1522300800,
  "duration": 733,
  "description": "Willi hat alle Hände voll zu tun als Babysitter und Ersatzmama für Feuerkäfer-Babys. Und weil Maja hilft, werden die Kleinen auch alle satt.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/mutter-willi-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_mutter_willi_folge25_maj/2/180404_mutter_willi_folge25_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_mutter_willi_folge25_maj/2/180404_mutter_willi_folge25_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_mutter_willi_folge25_maj/2/180404_mutter_willi_folge25_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522281600,
  "time": 19200,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "j7mmJbQSNXomzdH2gFzYcxvXe8u",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Oswalt macht sich Freunde - Folge 24",
  "timestamp": 1522215000,
  "duration": 726,
  "description": "Mit seinen Scheren will Ohrenkneifer Oswalt für andere tolle Sachen basteln. Doch leider finden Maja, Willi und Ben seine Ideen gar nicht toll. Oswalt muss sich etwas Neues überlegen.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/oswalt-macht-sich-freunde-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_oswalt_freunde_folge24_maj/2/180404_oswalt_freunde_folge24_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_oswalt_freunde_folge24_maj/2/180404_oswalt_freunde_folge24_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_oswalt_freunde_folge24_maj/2/180404_oswalt_freunde_folge24_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522195200,
  "time": 19800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "eCWzRLYnAmvQPa0VJ5eqwtnbdhv",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Frau Rosi zieht um - Folge 23",
  "timestamp": 1522214400,
  "duration": 736,
  "description": "Maja möchte für die Käferdame Rosi eine neue Wohnung finden. Aber diese will ihre Hilfe nicht! Und Willi möchte lieber mit Maja spielen, als einer alten Dame beim Umzug zu helfen. Können sie so Rosis Freunde werden?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/frau-rosi-zieht-um-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_rosie_zieht_um_folge23_maj/2/180404_rosie_zieht_um_folge23_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_rosie_zieht_um_folge23_maj/2/180404_rosie_zieht_um_folge23_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_rosie_zieht_um_folge23_maj/2/180404_rosie_zieht_um_folge23_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522195200,
  "time": 19200,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "4SKkuE4TBpZzZ8fGuyJY3GRUSXp",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Die Lausebiene - Folge 21",
  "timestamp": 1522128000,
  "duration": 738,
  "description": "Maja hat Läuse! Wenig später kratzt sich der ganze Bienenstock. Der Juckreiz ist so groß, dass keine Biene mehr arbeiten kann. Wie werden die Bienen die Plage wieder los?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/die-lausebiene-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_lausebiene_folge21_maj/2/180404_lausebiene_folge21_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_lausebiene_folge21_maj/2/180404_lausebiene_folge21_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_lausebiene_folge21_maj/2/180404_lausebiene_folge21_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522108800,
  "time": 19200,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "cYoQjVJI0TOGI2L6AZsItcWCdyO",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Der verrückte Tag - Folge 20",
  "timestamp": 1522042200,
  "duration": 740,
  "description": "Flips Cousins tauchen auf der Klatschmohnwiese auf. Sie feiern den verrückten Grashüpfertag. Maja und Willi wollen mitfeiern, bis sie merken, dass wirklich alle verrückte Dinge tun und sogar böse Streiche spielen.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/der-verrueckte-tag-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_verrueckte_tag_folge20_maj/3/180404_verrueckte_tag_folge20_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_verrueckte_tag_folge20_maj/3/180404_verrueckte_tag_folge20_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_verrueckte_tag_folge20_maj/3/180404_verrueckte_tag_folge20_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522022400,
  "time": 19800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "1awsYSHe8DcohtkcCMvevMHwBDh",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Willi zieht aus - Folge 19",
  "timestamp": 1522041600,
  "duration": 734,
  "description": "Weil im Bienenstock zu viele Bienen leben, soll Willi mit anderen Bienen in einen neuen Stock umziehen. Das finden Maja und Willi gar nicht gut. Aber Maja hat eine Idee!",
  "website": "https://www.zdf.de/kinder/die-biene-maja/willi-zieht-aus-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_zieht_aus_folge19_maj/2/180404_zieht_aus_folge19_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_zieht_aus_folge19_maj/2/180404_zieht_aus_folge19_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_zieht_aus_folge19_maj/2/180404_zieht_aus_folge19_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1522022400,
  "time": 19200,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "64WTlqPLD3h1Dk3AWDw1OdQkPek",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Der Bienentanz - Folge 18",
  "timestamp": 1521786600,
  "duration": 725,
  "description": "Maja möchte den traditionellen Bienentanz lernen. Doch dann findet sie, das Tanzen nach genauen Regeln langweilig. Sie tanzt lieber, wie es ihr gefällt. Ob die anderen Bienen ihren Tanz verstehen?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/der-bienentanz-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_bienentanz_folge18_maj/3/180404_bienentanz_folge18_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_bienentanz_folge18_maj/3/180404_bienentanz_folge18_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_bienentanz_folge18_maj/3/180404_bienentanz_folge18_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1521763200,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "qzVitkVmxwxwJKTn2kZL9hdqjRn",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Ferdinand - Folge 17",
  "timestamp": 1521786000,
  "duration": 724,
  "description": "Maja und Willi schaukeln auf Äpfeln in einem Apfelbaum. Dabei fällt ein Apfel und heraus purzelt Apfelwurm Ferdinand. Nun braucht er ein neues Apfelhaus. Maja und Willi wollen ihm helfen. Aber Ferdinand hat hohe Ansprüche.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/ferdinand-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/10/141016_folge17_ferdinand_maj/17/141016_folge17_ferdinand_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/10/141016_folge17_ferdinand_maj/17/141016_folge17_ferdinand_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/14/10/141016_folge17_ferdinand_maj/17/ZDF-2013-06-30-07-06-20-307306.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1521763200,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "mRdm1GbAXKBzCp8pUe6xb57yBoO",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Der tiefe Schlaf - Folge 16",
  "timestamp": 1521700200,
  "duration": 731,
  "description": "Maja und Willi versetzen den Bienenstock in Tiefschlaf, weil sie aus Versehen Baldrianpollen gesammelt haben. Dabei müssten alle Bienen dringend die Ackerwindenblüten ernten. Maja will die Pollen trotzdem holen. Sie bittet ihre Freunde um Hilfe.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/der-tiefe-schlaf-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/10/141016_folge16_schlaf_maj/17/141016_folge16_schlaf_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/10/141016_folge16_schlaf_maj/17/141016_folge16_schlaf_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/14/10/141016_folge16_schlaf_maj/17/ZDF-2013-06-23-07-08-25-307283.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1521676800,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "vZl2s2doRUDBdZSQE8p6eKZ0pTn",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Momos Verwandlung - Folge 15",
  "timestamp": 1521699600,
  "duration": 738,
  "description": "Als sich Raupe Momo verpuppt, freuen sich Maja und Willi. Sie glauben, aus Momo wird ein Schmetterling. Doch bald darauf macht sich eine Motte im Bienenstock über die Vorräte her. Wer ist die Motte?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/momos-verwandlung-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/10/141016_folge15_momo_maj/17/141016_folge15_momo_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/10/141016_folge15_momo_maj/17/141016_folge15_momo_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/14/10/141016_folge15_momo_maj/17/ZDF-2013-06-16-07-05-53-307282.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1521676800,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "pRpIGOd50MLZNoGfeXMJCOYi6LD",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Der Schmetterlingsball - Folge 9",
  "timestamp": 1521440400,
  "duration": 725,
  "description": "Schmetterling Beatrix will zum Schmetterlingsball. Doch Maja macht aus Versehen Beatrix' Flügel nass. Als Maja sie trocknen will, reibt sie sogar die Glitzerfarbe ab! Was tun?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/der-schmetterlingsball-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_schmetterlingsball_folge9_maj/2/180404_schmetterlingsball_folge9_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_schmetterlingsball_folge9_maj/2/180404_schmetterlingsball_folge9_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_schmetterlingsball_folge9_maj/2/180404_schmetterlingsball_folge9_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1521417600,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "iWhbh01cCywhFp4IMY9Yv2woVBm",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Libellen-Luftpost - Folge 52",
  "timestamp": 1520836200,
  "duration": 727,
  "description": "Libellenmädchen Franzi soll ihr erstes Paket ausliefern. Absender ist die Bienenkönigin. Aber den Empfänger hat sich Franzi vergessen. Sie muss zurück zum Absender fliegen, um danach zu fragen. Ob das ihr erster und letzter Post-Auftrag bleiben wird?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/libellen-luftpost-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge52_luftpost_maj/9/130820_folge52_luftpost_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge52_luftpost_maj/9/130820_folge52_luftpost_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/13/08/130820_folge52_luftpost_maj/9/ZDF-2014-02-23-07-05-56-308252.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1520812800,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "pAqpVNs85cF5pp0Suahld8VPBzs",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Der große Streit - Folge 51",
  "timestamp": 1520835600,
  "duration": 731,
  "description": "Maja und Willi bereiten ein Picknick mit Waldtulpenpollen vor. Als dieser verschwindet, denkt Maja, Willi hätte ihn gefuttert. Beide streiten sich und Willi fliegt weg. Doch Maja findet den Pollen wieder. Sie will sich bei ihm entschuldigen.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/der-grosse-streit-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130828_folge51_grossestreit_maj/9/130828_folge51_grossestreit_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130828_folge51_grossestreit_maj/9/130828_folge51_grossestreit_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/13/08/130828_folge51_grossestreit_maj/9/ZDF-2014-02-16-07-06-56-308369.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1520812800,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "o5EpicQdFl62Q9EyAMC4FAdn7dL",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Der rote Rosso und seine Bande - Folge 50",
  "timestamp": 1520577000,
  "duration": 738,
  "description": "Eine Bande von roten Räuberameisen will den Ameisenhügel überfallen. Leider scheitert der Plan der Oberameise Paul, die feindlichen Ameisen wegzulocken. Kann Maja helfen?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/der-rote-rosso-und-seine-bande-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130828_folge50_roterosso_maj/9/130828_folge50_roterosso_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130828_folge50_roterosso_maj/9/130828_folge50_roterosso_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/13/08/130828_folge50_roterosso_maj/9/ZDF-2014-02-09-06-26-14-308290.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1520553600,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "zMORlOcXGXRl5PQqwckJ0pudor6",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Harmonie in der Wiese - Folge 49",
  "timestamp": 1520576400,
  "duration": 724,
  "description": "Auf Flips Geige reißt eine Saite. Zum Glück weiß Flip, wer ihm eine neue Geigensaite aufziehen kann: Der Käfer und Instrumentenbauer Stridularius kann's. Er braucht dafür aber Spinnenfäden aus Theklas Netz.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/harmonie-in-der-wiese-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_harmonie_folge49_maj/3/180404_harmonie_folge49_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_harmonie_folge49_maj/3/180404_harmonie_folge49_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_harmonie_folge49_maj/3/180404_harmonie_folge49_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1520553600,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "sotPjcCzLT7I4gvv6vR0RcBRS3p",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Majas Schatz - Folge 48",
  "timestamp": 1520490600,
  "duration": 725,
  "description": "Maja legt Vorräte an. Sie will die erste Biene sein, die auf der Wiese überwintert. Sie versteckt ihren Nektar in einem Erdloch und malt sich eine Karte, um ihn wiederzufinden. Dumm nur, dass Maja die Karte verliert.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/majas-schatz-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge48_majasschatz_maj/10/130820_folge48_majasschatz_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge48_majasschatz_maj/10/130820_folge48_majasschatz_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/13/08/130820_folge48_majasschatz_maj/10/ZDF-2014-01-26-07-07-00-308237.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1520467200,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "jIP052NO8dsDWM47lhAR8dTtuPO",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Walter hat den Durchblick - Folge 47",
  "timestamp": 1520490000,
  "duration": 738,
  "description": "Fliege Walter verliert seine Brille. Willi findet sie und schnappt sich Walters Brille. Auch Maja will wissen, was durch Walters Brille zu sehen ist. Doch die Brille fällt in ein Töpfchen mit Bienenharz. Wer schafft es, die Brille wieder zu säubern?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/walter-hat-den-durchblick-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge47_durchblick_maj/10/130820_folge47_durchblick_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge47_durchblick_maj/10/130820_folge47_durchblick_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/13/08/130820_folge47_durchblick_maj/10/ZDF-2014-01-19-07-06-32-308214.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1520467200,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "7Y8Fsjpj2Am53Q67azFEvkzqHMZ",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Die verwirrte Irma - Folge 46",
  "timestamp": 1520404200,
  "duration": 723,
  "description": "Durch einen Stoß auf den Kopf verliert Feldgrille Irma ihr Gedächtnis. Sie glaubt nun, sie sei eine Biene und sucht nach Nektar. Wie kann Maja Irma helfen?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/die-verwirrte-irma-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130828_folge46_verwirrteirma_maj/11/130828_folge46_verwirrteirma_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130828_folge46_verwirrteirma_maj/11/130828_folge46_verwirrteirma_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/13/08/130828_folge46_verwirrteirma_maj/11/ZDF-2014-01-12-07-07-02-308368.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1520380800,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "tCQK1JVi3PIujZrRIDvSYXxn8Kq",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Majas Blume - Folge 45",
  "timestamp": 1520403600,
  "duration": 728,
  "description": "Frau Kassandra erklärt Maja, dass Bienen Blüten bestäuben. Blumen pflanzen, tun Bienen nicht. Aber Maja will die erste Biene sein, die eine Blume pflanzt.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/majas-blume-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge45_majasblume_maj/12/130820_folge45_majasblume_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge45_majasblume_maj/12/130820_folge45_majasblume_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/13/08/130820_folge45_majasblume_maj/12/ZDF-2014-01-05-07-08-09-308251.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1520380800,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "k05UStBfwe5tp4ESYyqfqqjt9WY",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Ringkampf im Wald - Folge 44",
  "timestamp": 1520317800,
  "duration": 731,
  "description": "Hirschkäfer Freiherr von Schröter will von Flip für seinen ersten Ringkampf trainiert werden. Sein Gegner ist aber viel größer als er. Trainer Flip hat sich eine gute Taktik ausgedacht.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/ringkampf-im-wald-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge44_ringkampf_maj/11/130820_folge44_ringkampf_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge44_ringkampf_maj/11/130820_folge44_ringkampf_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/13/08/130820_folge44_ringkampf_maj/11/ZDF-2013-12-29-07-06-36-308250.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1520294400,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "zOmbzKPbdGSjCGFwvSm4Sp36yLO",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Die Sonnenfinsternis - Folge 43",
  "timestamp": 1520317200,
  "duration": 738,
  "description": "Durch eine Sonnenfinsternis verdunkelt sich die Wiese mitten am Tag. Eine Gruppe Sammelbienen findet deshalb nicht zurück zum Stock. Die Königin weiß, nur Maja kann helfen. Wird sie es schaffen?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/die-sonnenfinsternis-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge43_sonnenfinsternis_maj/11/130820_folge43_sonnenfinsternis_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge43_sonnenfinsternis_maj/11/130820_folge43_sonnenfinsternis_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/13/08/130820_folge43_sonnenfinsternis_maj/11/ZDF-2013-12-22-07-07-06-308238.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1520294400,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "hCNpApVPDas7hQK86hioFQiYUJC",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Pauls Himbeere - Folge 42",
  "timestamp": 1520231400,
  "duration": 739,
  "description": "Maja und Willi entdecken eine Himbeere. Sie gehört Paul und seinen Männern. Als die Himbeere verschwindet, gehen Maja und Willi sie suchen. Nur Marienkäfermädchen Lara scheint der Trubel um die Himbeere egal zu sein.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/pauls-himbeere-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge42_himbeere_maj/11/130820_folge42_himbeere_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge42_himbeere_maj/11/130820_folge42_himbeere_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/13/08/130820_folge42_himbeere_maj/11/ZDF-2013-12-15-07-06-37-308213.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1520208000,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "f86JYuY4d8glKdky148Sxuk7W2r",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Der meistgesuchte Mist - Folge 41",
  "timestamp": 1520230800,
  "duration": 732,
  "description": "Maja stößt aus Versehen gegen Bens Mistkugel. Die rollt weg, stößt im Rollen gegen Käfer Rolfs Mistball und beide Kugeln verschwinden auf der Wiese. Ben und Rolf sind richtig wütend.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/der-meistgesuchte-mist-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge41_meistgesucht_maj/11/130820_folge41_meistgesucht_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge41_meistgesucht_maj/11/130820_folge41_meistgesucht_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/13/08/130820_folge41_meistgesucht_maj/11/ZDF-2013-12-08-07-06-23-308239.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1520208000,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "hUlZAEVZuqkdAhCKJVfPQ4gFIJY",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Edgar, die Pechbiene - Folge 40",
  "timestamp": 1519972200,
  "duration": 724,
  "description": "Maja macht mit Pechbiene Edgar einen Ausflug. Dorch ständig passiert Edgar etwas. Doch dann geraten Maja und Willi in Gefahr. Edgar hilft ihnen und findet dabei sein Glück.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/edgar-die-pechbiene-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge40_pechbiene_maj/13/130820_folge40_pechbiene_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge40_pechbiene_maj/13/130820_folge40_pechbiene_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/13/08/130820_folge40_pechbiene_maj/13/ZDF-2013-12-01-07-07-02-308240.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1519948800,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "gleHR3BR9zQAFCSxaDkzFA61rpt",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Das Zepter der Königin - Folge 39",
  "timestamp": 1519971600,
  "duration": 730,
  "description": "Maja und Willi sollten auf das Zepter der Königin aufpassen. Aber jetzt ist es weg, denn die Mistkäfer Ben und Kurt haben die Wiese aufgeräumt. Nun ist es vielleicht in einer Mistkugeln. Aber in welcher?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/das-zepter-der-koenigin-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge39_zepter_maj/13/130820_folge39_zepter_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130820_folge39_zepter_maj/13/130820_folge39_zepter_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/13/08/130820_folge39_zepter_maj/13/ZDF-2013-11-24-07-06-03-308241.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1519948800,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "nYWxRkhPRFFwfg1OPHp1gsAL6ID",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Willi wird beschattet - Folge 30",
  "timestamp": 1519367400,
  "duration": 728,
  "description": "Willi hat von einem bösen Schatten geträumt. Nun fürchtet er sich vor jedem Schatten. Maja will Willi zeigen, dass Schatten harmlos sind. Doch die Wespen Motz und Rempel kommen ihr in die Quere.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/willi-wird-beschattet-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130828_folge30_willibeschattet_maj/17/130828_folge30_willibeschattet_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/13/08/130828_folge30_willibeschattet_maj/17/130828_folge30_willibeschattet_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/13/08/130828_folge30_willibeschattet_maj/17/ZDF-2013-09-29-07-07-06-307991.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1519344000,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "1TYrd5ETZuuzfNzSN3YQnap9mbt",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Lara lässt es regnen - Folge 29",
  "timestamp": 1519366800,
  "duration": 737,
  "description": "Marienkäfermädchen Lara lässt es regnen. Auf Kommando kann sie auch die Sonne scheinen lassen. Maja ist sich sicher: das muss ein Tricks sein. Aber welcher?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/lara-laesst-es-regnen-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_lara_regnen_folge29_maj/2/180404_lara_regnen_folge29_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_lara_regnen_folge29_maj/2/180404_lara_regnen_folge29_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_lara_regnen_folge29_maj/2/180404_lara_regnen_folge29_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1519344000,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "v1jpDRFWtuHUMnOFQwmOZlx4EMh",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Max wird mutig - Folge 28",
  "timestamp": 1519281000,
  "duration": 729,
  "description": "Regenwurm Max trifft Raupendame Ulla. Er will sie beeindrucken und beschließt, auf Bäume zu klettern. Oben angekommen, wird ihm aber mulmig zumute. Max tröstet sich damit, dass auch Ulla nicht immer mutig ist.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/max-wird-mutig-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_max_mutig_folge28_maj/2/180404_max_mutig_folge28_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_max_mutig_folge28_maj/2/180404_max_mutig_folge28_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_max_mutig_folge28_maj/2/180404_max_mutig_folge28_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1519257600,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "pvqnNyy0Lgc0Fhumb83yCkrteeB",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Die falsche Wespe - Folge 27",
  "timestamp": 1519280400,
  "duration": 724,
  "description": "Die Wespen Motz und Rempel stehlen einer Sammelbiene Nektar. Die Bienen glauben, dass Schwebfliege Mimi der Dieb war. Denn sie sieht fast wie eine Wespe aus. Maja glaubt, dass Mimi unschuldig ist. Gemeinsam legen die beiden den Wespen-Boss Piesker rein.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/die-falsche-wespe-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_wespe_folge27_maj/2/180404_wespe_folge27_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_wespe_folge27_maj/2/180404_wespe_folge27_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_wespe_folge27_maj/2/180404_wespe_folge27_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1519257600,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "9DxRlTYb99fnPEPk3QCu00ZkAEe",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Maja im Schilderwald - Folge 22",
  "timestamp": 1519021800,
  "duration": 725,
  "description": "Damit keine Biene falsch fliegt, stellt Richter Bienenwachs Verkehrsschilder auf. Er führt sogar eine Flugprüfung ein. Doch vor lauter Prüfungsstress können sich die Bienen nicht mehr um die Larven kümmern! Zum Glück hat Maja eine Idee.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/maja-im-schilderwald-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/10/141028_folge22_schilderwald_maj/19/141028_folge22_schilderwald_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/10/141028_folge22_schilderwald_maj/19/141028_folge22_schilderwald_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/14/10/141028_folge22_schilderwald_maj/19/ZDF-2013-08-04-07-07-51-307291.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1518998400,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "19iJU5qjVrLx2NInzLFoNZt1qoa",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Falscher Alarm - Folge 14",
  "timestamp": 1518503400,
  "duration": 730,
  "description": "Willi hat einen Bären gesehen! Maja glaubt, dass der Bär den Bienenhonig stehlen will. Sie warnt die Bienenkönigin und alle Bienen verlassen panisch den Bienenstock. Doch es stellt sich heraus: Willi hat nur einen Teddybären gesehen.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/falscher-alarm-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/10/141016_folge14_alarm_maj/17/141016_folge14_alarm_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/10/141016_folge14_alarm_maj/17/141016_folge14_alarm_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/14/10/141016_folge14_alarm_maj/17/ZDF-2013-06-09-07-07-13-307305.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1518480000,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "JsL0izbgQ5kS6E2od1hGUqVD1g",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Walter schleimt sich ein - Folge 13",
  "timestamp": 1518502800,
  "duration": 738,
  "description": "Nur die Stiele von Rufus' Lieblingspilzen sind übrig. Für Fliege Walter ist klar: Hier war ein Schleimmonster am Werk. Maja, Walter und die Ameisen warten auf die Rückkehr des Monsters.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/walter-schleimt-sich-ein-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/10/141016_folge13_walter_maj/17/141016_folge13_walter_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/10/141016_folge13_walter_maj/17/141016_folge13_walter_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/14/10/141016_folge13_walter_maj/17/ZDF-2013-06-02-07-06-53-307281.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1518480000,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "8IXA9zuUpqRHFkodGW8IuAYZQua",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Eine königliche Pause - Folge 12",
  "timestamp": 1518417000,
  "duration": 737,
  "description": "Maja möchte der Bienenkönigin fliegende Blumensamen auf der Wiese zeigen. Und die Königin verlässt tatsächlich den Bienenstock. Aber als die anderen Bienen merken, dass sie weg ist, bekommen sie Angst.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/eine-koenigliche-pause-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/10/141016_folge12_koenigliche_pause_maj/17/141016_folge12_koenigliche_pause_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/10/141016_folge12_koenigliche_pause_maj/17/141016_folge12_koenigliche_pause_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/14/10/141016_folge12_koenigliche_pause_maj/17/ZDF-2013-05-26-07-06-15-307300.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1518393600,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "7sd1leVkKZyBJ5v7Cs5Vtttax6P",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Kein Schlaf für Maja - Folge 11",
  "timestamp": 1518416400,
  "duration": 736,
  "description": "Grille Johnny macht jede Nacht Musik. Aber seine Musik hört sich an wie lauter Krach. Können Maja und Flip Johnny helfen, ein besserer Musiker zu werden?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/kein-schlaf-fuer-maja-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge11_kein_schlaf_maj/17/140923_folge11_kein_schlaf_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge11_kein_schlaf_maj/17/140923_folge11_kein_schlaf_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/14/09/140923_folge11_kein_schlaf_maj/17/ZDF-2013-05-19-07-06-02-307280.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1518393600,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "4qnmgThDE2zrWOjUBuMwocOZQvb",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Max und die Vogelhochzeit - Folge 10",
  "timestamp": 1518157800,
  "duration": 724,
  "description": "Eine Meise möchte heiraten und plant ein großes Hochzeitsessen. Doch auf der Speisekarte steht auch der Wurm Max. Maja, Willi und Flip starten eine Rettungsaktion. Und nicht nur Max wird gerettet.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/max-und-die-vogelhochzeit-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_vogelhochzeit_folge10_maj/2/180404_vogelhochzeit_folge10_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_vogelhochzeit_folge10_maj/2/180404_vogelhochzeit_folge10_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/18/04/180404_vogelhochzeit_folge10_maj/2/180404_vogelhochzeit_folge10_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1518134400,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "lkbafmYqSCRPoAFk2vnO7VNSeL1",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Knacks im Schneckenhaus - Folge 8",
  "timestamp": 1518071400,
  "duration": 727,
  "description": "Rufus' Schneckenhaus hat einen großen Riss. Maja möchte den Riss reparieren, aber ein Vogel schreckt alle auf.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/knacks-im-schneckenhaus-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge08_schneckenhaus_maj/15/140923_folge08_schneckenhaus_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge08_schneckenhaus_maj/15/140923_folge08_schneckenhaus_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/14/09/140923_folge08_schneckenhaus_maj/15/ZDF-2013-04-28-07-03-42-307408.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1518048000,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "u3cB7i4X59LSg8bOdyezHN5a1xv",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Richter Bienenwachs - Folge 7",
  "timestamp": 1518070800,
  "duration": 731,
  "description": "Richter Bienenwachs ärgert sich über Maja. Sie soll die Wiese verlassen. Als Maja und ihre Freunde mit ihm reden wollen, fühlt er sich bedroht und ruft die Wachen. Nun ist aber der Honig unbewacht. Das wollen Piekser und seine Wespenbande ausnutzen.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/richter-bienenwachs-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge07_bienenwachs_maj/15/140923_folge07_bienenwachs_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge07_bienenwachs_maj/15/140923_folge07_bienenwachs_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/14/09/140923_folge07_bienenwachs_maj/15/ZDF-2013-04-21-07-06-11-307325.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1518048000,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "nc5f6DcLcxpJARGnwtQP7Nh0lNn",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Der Mistkugelwettbewerb - Folge 6",
  "timestamp": 1517985000,
  "duration": 728,
  "description": "Mistkäfer Ben will mit seiner schönen Mistkugel den Mistkugel-Wettbewerb gewinnen. Doch die schwangere Fliege Lilly legt in der Kugel ihre Eier ab. Womit soll er nun beim Wettbewerb antreten?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/der-mistkugelwettbewerb-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge06_mistkugel_maj/19/140923_folge06_mistkugel_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge06_mistkugel_maj/19/140923_folge06_mistkugel_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/14/09/140923_folge06_mistkugel_maj/19/ZDF-2013-04-14-07-05-21-307302.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1517961600,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "im50AW1xhhCnioAlfNKWdEEn0kG",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Willis Flasche - Folge 5",
  "timestamp": 1517984400,
  "duration": 726,
  "description": "Neugierig untersuchen Maja, Willi und Mistkäfer Ben eine Flasche. Dabei kommt die Flasche ins Rollen. Dumm nur, dass in diesem Moment Willi in der Flasche ist. Die Freunde machen sich auf die Suche nach Willi.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/willis-flasche-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge05_flasche_maj/15/140923_folge05_flasche_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge05_flasche_maj/15/140923_folge05_flasche_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/14/09/140923_folge05_flasche_maj/15/ZDF-2013-04-07-07-05-37-307277.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1517961600,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "l4Dcdr12iGqk8FCr84niqJAEQsK",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Maja und die Mondblume - Folge 4",
  "timestamp": 1517898600,
  "duration": 721,
  "description": "Maja erfährt von einer Blume, die nur bei Mondschein blüht. Zusammen mit Willi will sie diese Blume finden! Doch als der Mond aufgeht, merkt Maja, dass sie sich im Wald verirrt hat.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/maja-und-die-mondblume-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge04_mondblume_maj/15/140923_folge04_mondblume_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge04_mondblume_maj/15/140923_folge04_mondblume_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/14/09/140923_folge04_mondblume_maj/15/ZDF-2013-03-31-07-04-12-307276.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1517875200,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "wjkCUZOTnNgdFHhu4mMTDCZfzzA",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Der Buschwindbote - Folge 3",
  "timestamp": 1517898000,
  "duration": 738,
  "description": "Maja schlägt einen Wettbewerb vor. Wer dem benachbarten Bienenstock zuerst die Nachricht vom neuen Nektarfeld überbringt, bekommt den Titel des \"Buschwindboten\". Marienkäfermädchen Lara möchte unbedingt gewinnen.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/der-buschwindbote-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge03_buschwindbote_maj/17/140923_folge03_buschwindbote_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge03_buschwindbote_maj/17/140923_folge03_buschwindbote_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/14/09/140923_folge03_buschwindbote_maj/17/ZDF-2013-03-29-08-59-51-307275.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1517875200,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "qV3M9cOFPTyarqYwysWs2g7JN3l",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Die große, weite Wiesenwelt - Folge 2",
  "timestamp": 1517812200,
  "duration": 738,
  "description": "Gleich in der ersten Nacht schleichen sich Maja und Willi heimlich aus dem Bienenstock. Sogar ein hungriger Frosch, der auf der Wiese lauert, kann sie nicht aufhalten. Finden sie sicher den Weg zurück?",
  "website": "https://www.zdf.de/kinder/die-biene-maja/die-grosse-weite-wiesenwelt-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge02_wiesenwelt_maj/15/140923_folge02_wiesenwelt_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge02_wiesenwelt_maj/15/140923_folge02_wiesenwelt_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/14/09/140923_folge02_wiesenwelt_maj/15/ZDF-2013-03-29-08-48-40-307273.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1517788800,
  "time": 23400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "v4RWQahG7eBpGzNBZ3ZD525tC21",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Majas Geburt - Folge 1",
  "timestamp": 1517811600,
  "duration": 725,
  "description": "wird geboren. Als sie das erste Mal über die Klatschmohnwiese fliegt, ist sie total begeistert. Sie entdeckt glitzernde Tautropfen, einen bunten Regenbogen und sie ahnt, dass sie viele Freunde finden wird.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/majas-geburt-102.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge01_geburt_maj/15/140923_folge01_geburt_maj_436k_p9v11.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/14/09/140923_folge01_geburt_maj/15/140923_folge01_geburt_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/14/09/140923_folge01_geburt_maj/15/ZDF-2013-03-29-08-36-46-307272.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1517788800,
  "time": 22800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "yCbx3uetAmf1WiP2rSX9E3xTMjr",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Die vergessliche Jägerin - Folge 106",
  "timestamp": 1510679700,
  "duration": 740,
  "description": "Frau Kassandra bespricht im Unterricht mit den Schülern, wie sie es vermeiden können, von der Spinne Thekla gefangen zu werden. Das ist nicht schwer, da sie ihr Netz immer am selben Ort baut.",
  "website": "https://www.zdf.de/kinder/die-biene-maja/die-vergessliche-jaegerin-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171115_jaegerin_folge106_maj/4/171115_jaegerin_folge106_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171115_jaegerin_folge106_maj/4/171115_jaegerin_folge106_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/dach/tivi/17/11/171115_jaegerin_folge106_maj/4/171115_jaegerin_folge106_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    },
    {
      "type": "subtitle",
      "url": "https://utstreaming.zdf.de/mtt/tivi/17/11/171115_jaegerin_folge106_maj/4/F1014651_hoh_deu_Die_Biene_Maja_Die_vergessliche_Jaegerin.xml",
      "size": null
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1510617600,
  "time": 62100,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "lLQl01uQuybTYkJGVo1Xk6eO2rD",
  "channel": "ZDF",
  "topic": "Die Biene Maja",
  "title": "Hallo, ich bin die Biene Maja!",
  "timestamp": 1502891400,
  "duration": 124,
  "description": "",
  "website": "https://www.zdf.de/kinder/die-biene-maja/bilderserie-maja-und-ihre-freunde-100.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/none/tivi/17/08/170816_bs_maja_freunde_maj/2/170816_bs_maja_freunde_maj_476k_p9v13.mp4",
      "size": null,
      "quality": 2
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/none/tivi/17/08/170816_bs_maja_freunde_maj/2/170816_bs_maja_freunde_maj_2328k_p35v13.mp4",
      "size": null,
      "quality": 3
    },
    {
      "type": "video",
      "url": "https://rodlzdf-a.akamaihd.net/none/tivi/17/08/170816_bs_maja_freunde_maj/2/170816_bs_maja_freunde_maj_3296k_p15v13.mp4",
      "size": null,
      "quality": 4
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1502841600,
  "time": 49800,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "nCK3BfO4qOklj6f9fmg6HLJmYBt",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Maja lernt tanzen",
  "timestamp": 1493915100,
  "duration": 177,
  "description": "Maja ist traurig. Sie kriegt den Bienentanz nicht hin. Doch Flip weiß Rat.",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/14/10/141016_folge18_ausschnitt_tanzen_maj/4/141016_folge18_ausschnitt_tanzen_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1493856000,
  "time": 59100,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "zATMrEM6vl2jkn7imKRDixTazqa",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Richter Bienenwachs ist wütend",
  "timestamp": 1493482500,
  "duration": 86,
  "description": "Richter Bienenwachs beschwert sich bei der Bienenkönigin über Maja. Wenn Maja sich weigert, im Bienenstock zu leben, soll sie die Wiese verlassen. Ob Maja einen Ausweg findet?",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/14/09/140923_folge07_ausschnitt_wuetend_maj/2/140923_folge07_ausschnitt_wuetend_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1493424000,
  "time": 58500,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "eotgyAiDpo6UStBaPbf5WtN0aC5",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Kraftprotz Willi",
  "timestamp": 1492586700,
  "duration": 147,
  "description": "Willi strotzt vor Kraft, weil er im Schlaf den Kuchen der Königin gegessen hat. Der Kuchen war für das Eierfest. Kein Kuchen, keine Feier! Was nun?",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/de/tivi/13/07/130722_folge26_ausschnitt_kuchen_maj/3/130722_folge26_ausschnitt_kuchen_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1492560000,
  "time": 26700,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "rzRL3fKQ7kiJsFj86Fu4dM0GXfd",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Motten-Alarm im Bienenstock",
  "timestamp": 1491984300,
  "duration": 178,
  "description": "Eine gefräßige Motte sorgt im Bienenstock für Chaos. Bis Maja ihren alten Freund Momo erkennt. Sie will helfen und hat schon eine Idee.",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/14/10/141016_folge15_ausschnitt_motte_maj/2/141016_folge15_ausschnitt_motte_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1491955200,
  "time": 29100,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "e9uhZb4A0KhS4ZFv4IVoZZBCo6l",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Panik im Bienenstock",
  "timestamp": 1491983700,
  "duration": 171,
  "description": "Die Bienenkönig lässt den Bienestock räumen. Es soll ein Bär in der Nähe sein. Maja und Willi nehmen ihren ganzen Mut zusammen und gehen ihn suchen!",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/14/10/141016_folge14_ausschnitt_panik_maj/2/141016_folge14_ausschnitt_panik_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1491955200,
  "time": 28500,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "4Nrax4LmjBAFsXlIsfvsVgUesn2",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Pilzfresser gesucht!",
  "timestamp": 1491983100,
  "duration": 175,
  "description": "Jemand hat in der Nacht die Lieblingspilze der Schnecke Rufus gefressen. Für Walter ist schnell klar: Hier war ein Schleimmonster am Werk.",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/14/10/141016_folge13_ausschnitt_monster_maj/2/141016_folge13_ausschnitt_monster_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1491955200,
  "time": 27900,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "xyCyqBRRJYYgM4X3hLvD5QCtxDo",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Wo ist die Bienenkönigin?",
  "timestamp": 1491982500,
  "duration": 159,
  "description": "Die Bienenkönigin ist verschwunden. Alle geraten in Panik und keiner will mehr arbeiten. Frau Kassandra schickt Willi, um sie zu suchen!",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/14/10/141021_folge12_ausschnitt_pause_maj/2/141021_folge12_ausschnitt_pause_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1491955200,
  "time": 27300,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "7A9NKjlEXziTbtLu98gN5fJ56OL",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Wir wollen schlafen!",
  "timestamp": 1491981900,
  "duration": 165,
  "description": "Alle Bienen sind müde. Sie können nachts nicht schlafen, weil Lärm sie stört. Aber woher kommt der Krach? Maja und Willi gehen auf Spurensuche!",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/14/09/140923_folge11_ausschnitt_laerm_maj/2/140923_folge11_ausschnitt_laerm_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1491955200,
  "time": 26700,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "737ZlGxLuO3RkJ5GXKFIxAkzUZO",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Max geht in die Luft",
  "timestamp": 1491897900,
  "duration": 133,
  "description": "Maja und Willi gönnen Regenwurm Max einen Ausflug zu den besten Früchten am Baum. Ob das gut geht?",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/14/09/140923_folge10_ausschnitt_maxflug_maj/2/140923_folge10_ausschnitt_maxflug_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1491868800,
  "time": 29100,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "aKu8uCuUl3fQdAw5aI4QlxfQDrI",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Beatrix' Schmetterlingstanz",
  "timestamp": 1491897300,
  "duration": 91,
  "description": "Maja will tanzen wie Beatrix. Doch aus Versehen schubst sie Beatrix dabei und die Schmetterlingsflügel werden nass.",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/14/09/140923_folge09_ausschnitt_tanz_maj/2/140923_folge09_ausschnitt_tanz_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1491868800,
  "time": 28500,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "6xUTSmxR2YsDvIAsZpjaFSwkL5n",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Wie repariert man ein Schneckenhaus?",
  "timestamp": 1491896700,
  "duration": 111,
  "description": "Beim Fußballspielen mit Rufus und Ben bekommt Rufus' Schneckenhaus einen Riss. Maja und Willi suchen nach Kleber.",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/14/09/140923_folge08_ausschnitt_schneckenhaus_maj/2/140923_folge08_ausschnitt_schneckenhaus_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1491868800,
  "time": 27900,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "vlCYmGVAr74EK4Qi9669X0xaUFj",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Mama gesucht!",
  "timestamp": 1475382600,
  "duration": 185,
  "description": "Die Feuerkäferbabys suchen ihre Mama und finden Willi mit einem prall gefüllt Honighörnchen. Sind ganz verrückt nach Willis Honig. Den will Willi aber selbst schlecken. Kann Willi seinen Honig verteidigen?",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/13/07/130722_folge25_ausschnitt_mutter_maj/3/130722_folge25_ausschnitt_mutter_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1475366400,
  "time": 16200,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "lmoUnRHFOCyTWknG3catv08P7Cg",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Oswalts Geschenk",
  "timestamp": 1474778700,
  "duration": 82,
  "description": "Ben sucht seinen Balli. Den hat Oswalt bearbeitet. Er wollte Ben eine Freude machen. Wie Ben wohl die Überraschung gefällt?",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/13/07/130722_folge24_ausschnitt_oswalt_maj/3/130722_folge24_ausschnitt_oswalt_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1474761600,
  "time": 17100,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "wgoePP4MnGEbP2IzoddlujoJCLq",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Willi in Gefahr",
  "timestamp": 1474777800,
  "duration": 177,
  "description": "Willi und Maja suchen für Frau Rosi ein neues zu Hause. Dabei kommt Willi einer gefährlichen Pflanze zu nahe. Maja und Frau Rosi eilen ihm zu Hilfe.",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/none/tivi/13/07/130722_folge23_ausschnitt_rosi_maj/3/130722_folge23_ausschnitt_rosi_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1474761600,
  "time": 16200,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "iKpMdYsSt4nSxzrYq6z2zDB8GDJ",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Putzalarm im Bienenstock",
  "timestamp": 1474173900,
  "duration": 152,
  "description": "Richter Bienenwachs kommt zur Putzkontrolle, doch Willi hat alles durcheinander gebracht. Was tun? Richter Bienenwachs verteilt Schilder, damit die Bienen wissen, wie sie fliegen sollen.",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/13/07/130722_folge22_ausschnitt_schild_maj/3/130722_folge22_ausschnitt_schild_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1474156800,
  "time": 17100,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "fCKMOEBrJot4qdKLv19TrGQEJcl",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Majas cleverer Plan",
  "timestamp": 1474173000,
  "duration": 81,
  "description": "Maja will den Bienenstock von der Läuseplage befreien. Sie weiß auch schon wie. Doch ihr Plan sorgt für Naserümpfen.",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/13/07/130722_folge21_ausschnitt_laus_maj/3/130722_folge21_ausschnitt_laus_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1474156800,
  "time": 16200,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "aKsqvdgEqvC4srXI2XOlpM99cKO",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Die Grashüpfer spielen verrückt",
  "timestamp": 1473569100,
  "duration": 176,
  "description": "Die Grashüpfer benehmen sich seltsam. Sie bringen die ganze Wiese durcheinander. Selbst Flip ist völlig durchgedreht. Da wird Maja sauer!",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/14/10/141028_folge20_ausschnitt_verrueckt_maj/2/141028_folge20_ausschnitt_verrueckt_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1473552000,
  "time": 17100,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "qdnznNxyHh6yRpPe3GlSCZ50RSd",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Willi sucht ein Zuhause",
  "timestamp": 1473568200,
  "duration": 127,
  "description": "Oh Schreck! Willi soll in einen anderen Bienenstock umziehen. Maja will das verhindern und hat schon einen Plan.",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/14/10/141016_folge19_ausschnitt_zuhause_maj/2/141016_folge19_ausschnitt_zuhause_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1473552000,
  "time": 16200,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "rR9CH7GFImTheNLwatjIVCAuzSg",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Pollen-Sammeln für Anfänger",
  "timestamp": 1472359500,
  "duration": 176,
  "description": "Weil die Bienen im Bienenstock fest schlafen, helfen Majas Freunde beim Pollen-Sammeln. Aber es klappt nicht so recht. Und dann gibt's sogar noch Streit. Doch Maja hat eine tolle Idee!",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/14/10/141016_folge16_ausschnitt_pollen_maj/2/141016_folge16_ausschnitt_pollen_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1472342400,
  "time": 17100,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "zetOx5EWnUmB06mp19vNvvU8ahG",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Ben will einen Preis gewinnen!",
  "timestamp": 1468686600,
  "duration": 63,
  "description": "Rund, weich und wunderschön. Das ist Bens Balli. Ob die Jury beim Mistkugelwettbwerb Bens Mistkugel auch preiswürdig findet?",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/14/09/140923_folge06_ausschnitt_mistkugel_maj/2/140923_folge06_ausschnitt_mistkugel_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1468627200,
  "time": 59400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "2sRshZ9XJZEVUP5i65OveyNnTLn",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Majas Stimme",
  "timestamp": 1468512900,
  "duration": 289,
  "description": "Zalina Sanchez leiht der Biene Maja ihre Stimme. Satz für Satz übersetzt sie so Majas englische Worte ins Deutsche. Bis 78 Folgen gesprochen sind, hat Zalina viel zu tun. Aber es macht ihr sehr viel Spaß.",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/none/tivi/14/12/141202_vj_zalina_synchro_maj/2/141202_vj_zalina_synchro_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1468454400,
  "time": 58500,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "5Hd0LqAfWY4mbjPnUAbzddkDYmv",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Maja-Sprecherin Zalina privat",
  "timestamp": 1468512900,
  "duration": 143,
  "description": "Zalina ist eine echte Quasselstrippe. Und sie liebt es zu klettern. Zalinas Berufswunsch? Sie will Meeresbiologin werden und vielleicht nebenbei Synchronsprecherin sein.",
  "website": "http://www.zdftivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/none/tivi/14/12/141202_vj_zalina_homestory_maj/3/141202_vj_zalina_homestory_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1468454400,
  "time": 58500,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "2WUzXbTMDZlhijXLvO4iGWCIvoo",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "So entstand die neue Biene Maja",
  "timestamp": 1468125000,
  "duration": 444,
  "description": "Schaut, wie aus der alten Zeichentrickbiene die digitale 3D-Biene wurde.",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/none/tivi/14/12/141208_making_of_maja_maj/3/141208_making_of_maja_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1468108800,
  "time": 16200,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "i2G8UnaIWzg575ZbRhDRNNtccuA",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Bienen-Wissen",
  "timestamp": 1458547800,
  "duration": 252,
  "description": "Was macht eine Arbeitsbiene? Wie lange leben Bienen? Und welche Aufgbabe hat die Königin? Erfahrt, wie echte Bienen leben und ob die Biene Maja und Willi auch so sind!",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/14/07/140716_biene_maja_vj_bienenwissen_maj/2/140716_biene_maja_vj_bienenwissen_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1458518400,
  "time": 29400,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
},
{
  "id": "h8QOWtX4DnqLDfNATCIhBfiaUQ2",
  "channel": "ZDF-tivi",
  "topic": "Die Biene Maja",
  "title": "Der Biene Maja-Song",
  "timestamp": 1443330000,
  "duration": 49,
  "description": "Kennt ihr das Lied der Biene Maja? Singt einfach mit!",
  "website": "http://www.tivi.de/fernsehen/diebienemaja/start/index.html",
  "lastSeen": 1529500560,
  "media": [
    {
      "type": "video",
      "url": "http://nrodl.zdf.de/dach/tivi/14/09/140923_biene_maja_titellied_maj/3/140923_biene_maja_titellied_maj_2328k_p35v11.mp4",
      "size": null,
      "quality": 3
    }
  ],
  "source": {
    "identifier": "filmlist",
    "data": {
      "timestamp": 1529500560,
      "hash": "d867ddf24c71f0b36b0a0d6e1d160122"
    }
  },
  "date": 1443312000,
  "time": 18000,
  "metadata": {
    "downloads": 1234,
    "plays": 1234,
    "comments": 0,
    "averageRating": 2.5,
    "secondsPlayed": 1234,
    "secondsPaused": 1234
  }
}
];

function pad(num: number, size: number) {
  var s = '00' + num;
  return s.substr(s.length - size);
}

const whatiwant = data
  .map((item) => {
    const date = new Date(item.timestamp * 1000);
    const url = item.media.filter((m) => m.type == 'video').sort((a, b) => (b.quality as number) - (a.quality as number))[0].url;

    const data = {
      url,
      filename: `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)} - ${item.topic} - ${item.title}.${url.slice(url.lastIndexOf('.') + 1)}`
    };

    return data;
  });

(async () => {
  let index = 0;
  for (const item of whatiwant) {
    console.log(++index + ' - downloading ' + item.filename);

    try {
      const file = FS.createWriteStream('./downloads/' + item.filename);

      await new Promise<void>((resolve, reject) => {
        if (item.url.toLowerCase().startsWith('https')) {
          HTTPS.get(item.url, (response) => response.pipe(file).on('finish', () => resolve()).on('error', (error) => reject(error)));
        }
        else {
          HTTP.get(item.url, (response) => response.pipe(file).on('finish', () => resolve()).on('error', (error) => reject(error)));
        }
      });

      file.close();

      console.log('downloaded ' + item.filename);
    }
    catch (error) {
      console.error('error on file ' + item.filename + ': ' + error);
    }
  }
})();
