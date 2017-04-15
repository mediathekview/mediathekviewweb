{
    "targets": [{
        "target_name": "filmliste-parser-native",
        "include_dirs": ["<!(node -e \"require('nan')\")", "/usr/include/qt", "/usr/include/qt/QtCore"],
        "link_settings": { 'libraries': ['-L/usr/lib/qt', '-lQt5Core'], },
        "sources": [
            "addon.cpp",
            "linereader.cpp",
            "linereaderworker.cpp",
            "filmlisteparser.cpp",
            "filmlisteparserworker.cpp",
            '<!(moc filmlisteparser.h -o moc_filmlisterparser.cpp && echo moc_filmlisterparser.cpp)',
            '<!(moc filmlisteparserworker.h -o moc_filmlisteparserworker.cpp && echo moc_filmlisteparserworker.cpp)',
            '<!(moc linereader.h -o moc_linereader.cpp && echo moc_linereader.cpp)',
            '<!(moc linereaderworker.h -o moc_linereaderworker.cpp && echo moc_linereaderworker.cpp)'
        ]
    }]
}
