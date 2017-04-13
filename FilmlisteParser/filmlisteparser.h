#ifndef FILMLISTEPARSER_H
#define FILMLISTEPARSER_H

#include "concurrentqueue.h"
#include "filmlisteparserworker.h"
#include "linereader.h"
#include "model.h"
#include <QObject>
#include <QString>
#include <QThread>

class FilmlisteParser : public QObject {
    Q_OBJECT

    QThread workerThread;
    FilmlisteParserWorker *worker = new FilmlisteParserWorker();

    bool workerIsDone = false;

    LineReader lineReader;
    ConcurrentQueue<QString> lineQueue;
    ConcurrentQueue<Entry> entryQueue;

public:
    explicit FilmlisteParser(QObject* parent = 0);
    virtual ~FilmlisteParser();


signals:
    void parseLines(ConcurrentQueue<QString> *lineInQueue, ConcurrentQueue<Entry> *entryOutQueue);
    void done();

public slots:
    void parseFile(QString file, QString splitPattern);
};

#endif // FILMLISTEPARSER_H
