#include "filmlisteparserworker.h"
#include "model.h"
#include "sleeper.h"
#include <QJsonDocument>
#include <QJsonArray>
#include <QJsonValue>
#include <QStringList>


FilmlisteParserWorker::FilmlisteParserWorker(QObject *parent) : QObject(parent)
{

}

void FilmlisteParserWorker::noMoreLines() {
    endWhenEmpty = true;
}


void FilmlisteParserWorker::parseLines(ConcurrentQueue<QString> *lineInQueue, ConcurrentQueue<Entry> *entryOutQueue) {
    while(lineInQueue->length() > 0 || endWhenEmpty == false) {
        if (entryOutQueue->length() >= 1000) {
            Sleeper::msleep(1);
            continue;
        }

        QString line;
        bool success = lineInQueue->dequeue(&line);

        if (!success) {
            Sleeper::msleep(1);
            continue;
        }

        if(line.length() == 0)
            continue;

        Entry entry = parseLine(line);

        entryOutQueue->enqueue(entry);
    }

    emit done();
}


Entry FilmlisteParserWorker::parseLine(QString line) {
    QJsonDocument jsonDocument = QJsonDocument::fromJson(line.toUtf8());

    //["Sender", "Thema", "Titel", "Datum", "Zeit", "Dauer", "Größe [MB]", "Beschreibung", "Url", "Website", "Url Untertitel", "Url RTMP", "Url Klein", "Url RTMP Klein", "Url HD", "Url RTMP HD", "DatumL", "Url History", "Geo", "neu"]
    QJsonArray parsed = jsonDocument.array();

    QString channel = parsed[0].toString();
    if (channel.length() > 0) {
        currentChannel = channel;
    }

    QString topic = parsed[1].toString();
    if (topic.length() > 0) {
        currentTopic = topic;
    }

    QStringList durationSplit = parsed[5].toString().split(":");
    int duration = (durationSplit[0].toInt() * 60 * 60) + (durationSplit[1].toInt() * 60) + durationSplit[2].toInt();

    QList<Video> videos;

    QString url_video = parsed[8].toString();
    QString url_video_low = createUrlFromBase(url_video, parsed[12].toString());
    QString url_video_hd = createUrlFromBase(url_video, parsed[14].toString());

    if (url_video.length() > 0) {
        videos.append(Video(url_video, Quality::Medium));
    }
    if (url_video_low.length() > 0) {
        videos.append(Video(url_video_low, Quality::Low));
    }
    if (url_video_hd.length() > 0) {
        videos.append(Video(url_video_hd, Quality::High));
    }


    Entry entry;
    entry.channel = currentChannel;
    entry.topic = currentTopic;
    entry.title = parsed[2].toString();
    entry.description = parsed[7].toString();
    entry.timestamp = parsed[16].toInt(-1);
    entry.duration = duration;
    entry.videos = videos;
    entry.website = parsed[9].toString();

    return entry;
}

QString FilmlisteParserWorker::createUrlFromBase(QString base, QString appendix) {
    QStringList appendixSplit = appendix.split("|");
    if (appendix.length() == 2) {
        return base.mid(0, appendixSplit[0].toInt()) + appendixSplit[1];
    } else {
        return "";
    }
}
