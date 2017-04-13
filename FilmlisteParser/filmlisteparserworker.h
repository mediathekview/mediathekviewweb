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

    bool endWhenEmpty = false;

private:
    Entry parseLine(QString line);
    QString createUrlFromBase(QString base, QString appendix);

public:
    explicit FilmlisteParserWorker(QObject *parent = 0);

signals:
    void done();

public slots:
    void parseLines(ConcurrentQueue<QString> *lineInQueue, ConcurrentQueue<Entry> *entryOutQueue);
    void noMoreLines();
};

#endif // FILMLISTEPARSERWORKER_H
