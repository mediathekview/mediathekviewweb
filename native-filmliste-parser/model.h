#ifndef MODEL_H
#define MODEL_H

#include <QString>
#include <QList>

enum class Quality {
    UltraLow = 0,
    VeryLow = 1,
    Low = 2,
    Medium = 3,
    High = 4,
    VeryHigh = 5
};

enum class MediaType {
    Video = 0,
    Audio = 1,
    Subtitle = 2
};

struct IMedia {
    MediaType type;
    QString url;
    int size;

    IMedia(MediaType type, QString url, int size = -1) {
        this->type = type;
        this->url = url;
        this->size = size;
    }

    virtual ~IMedia() {}
};

struct Video : IMedia {
    Quality quality;

    Video(QString url, Quality quality, int size = -1) : IMedia(MediaType::Video, url, size) {
        this->quality = quality;
    }

    virtual ~Video() {}
};

struct Audio : IMedia {
    Quality quality;

    Audio(QString url, Quality quality, int size = -1) : IMedia(MediaType::Audio, url, size) {
        this->quality = quality;
    }

    virtual ~Audio() {}
};

struct Subtitle : IMedia {
    Subtitle(QString url, int size = -1) : IMedia(MediaType::Subtitle, url, size) {
    }

    ~Subtitle() {}
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
    QList<IMedia> media;
};

#endif // MODEL_H
