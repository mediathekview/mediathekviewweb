#ifndef MODEL_H
#define MODEL_H

#include <QString>
#include <QList>

enum class Quality {
    UltraLow = 0,
    VeryLow = 1,
    Low = 2,
    Medium = 3,
    High = 4
};

struct Video {
    QString url;
    Quality quality;
    int size;

    Video(QString url, Quality quality, int size = -1) {
        this->url = url;
        this->quality = quality;
        this->size = size;
    }
};

struct Entry {
    QString id;
    QString channel;
    QString topic;
    QString title;
    int timestamp;
    int duration;
    QString description;
    QString website;
    QList<Video> videos;
};

#endif // MODEL_H
