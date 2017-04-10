#include "linereaderworker.h"
#include "sleeper.h"
#include <QString>
#include <QMutex>
#include <QQueue>
#include <QFile>
#include <QTextStream>
#include <QRegularExpression>
#include <QRegularExpressionMatch>

LineReaderWorker::LineReaderWorker(QObject *parent) : QObject(parent) {}

LineReaderWorker::~LineReaderWorker() { fileStream.close(); }

void LineReaderWorker::openFile(const QString file) {
    fileStream.setFileName(file);
    fileStream.open(QIODevice::ReadOnly);
    textStream.setDevice(&fileStream);
}

void LineReaderWorker::readFileLineByLine(const QString file, const QString pattern, QQueue<QString> *outQueue, QMutex *queueMutex) {
    openFile(file);

    QRegularExpression regex(pattern);
    if (regex.isValid() == false){
        throw "Regex not Valid!";
    }

    regex.optimize();

    QString buffer;

    while (textStream.atEnd() == false) {
        queueMutex->lock();
        if (outQueue->length() >= 1000) {
            queueMutex->unlock();
            Sleeper::msleep(10);
            continue;
        }
        queueMutex->unlock();

        QString readData = textStream.read(1024);
        buffer.append(readData);

        QRegularExpressionMatch match;
        while ((match = regex.match(buffer)).capturedStart() != -1) {
            int matchLength = match.capturedLength();

            QString line = buffer.left(match.capturedStart());
            buffer = buffer.mid(match.capturedStart() + matchLength);

            queueMutex->lock();
            outQueue->append(line);
            queueMutex->unlock();
        }
    }

    if (buffer.length() > 0) {
        queueMutex->lock();
        outQueue->append(buffer);
        queueMutex->unlock();
    }

    fileStream.close();

    emit done();
}

void LineReaderWorker::readFile(const QString file, const QString pattern, QQueue<QString> *outQueue, QMutex *queueMutex) {
    readFileLineByLine(file, pattern, outQueue, queueMutex);
}
