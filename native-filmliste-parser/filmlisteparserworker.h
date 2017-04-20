#ifndef FILMLISTEPARSERWORKER_H
#define FILMLISTEPARSERWORKER_H

#include "concurrentqueue.h"
#include "model.h"
#include <QObject>
#include <QString>

class FilmlisteParserWorker : public QObject
{
    Q_OBJECT

    QString currentChannel;
    QString currentTopic;
    int currentLine = 0;

private:
    Entry parseLine(const QString &line);
    QString createUrlFromBase(QString base, QString appendix);

public:
    explicit FilmlisteParserWorker(QObject *parent = 0);

signals:

public slots:
    void parseLines(ConcurrentQueue<QString> *lineInQueue, ConcurrentQueue<Entry> *entryOutQueue);
};

#endif // FILMLISTEPARSERWORKER_H
