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

    LineReader lineReader;
    ConcurrentQueue<QString> lineQueue;

public:
    explicit FilmlisteParser(QObject* parent = 0);
    virtual ~FilmlisteParser();

    void parseFile(QString file, QString splitPattern, ConcurrentQueue<Entry> *entryOutQueue);


signals:
    void parseLines(ConcurrentQueue<QString> *lineInQueue, ConcurrentQueue<Entry> *entryOutQueue);

public slots:
};

#endif // FILMLISTEPARSER_H
