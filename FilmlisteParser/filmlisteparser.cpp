#include "filmlisteparser.h"
#include "filmlisteparserworker.h"
#include "linereader.h"
#include "sleeper.h"
#include "concurrentqueue.h"

#include <QString>

FilmlisteParser::FilmlisteParser(QObject *parent) : QObject(parent) {
}

FilmlisteParser::~FilmlisteParser() {
    workerThread.quit();
    workerThread.wait();
}

void FilmlisteParser::parseFile(QString file, QString splitPattern) {
    lineReader.readFile(file, splitPattern, &lineQueue);

    worker->moveToThread(&workerThread);
    connect(&workerThread, &QThread::finished, worker, &QObject::deleteLater);

    connect(this, &FilmlisteParser::parseLines, worker, &FilmlisteParserWorker::parseLines);
    connect(worker, &FilmlisteParserWorker::done, this, &FilmlisteParser::done);

    workerThread.start();

    emit parseLines(&lineQueue, &entryQueue);
}
