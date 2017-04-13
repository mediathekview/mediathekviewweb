#include "linereaderworker.h"
#include "concurrentqueue.h"
#include "sleeper.h"
#include <QString>
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

void LineReaderWorker::readFile(const QString file, const QString splitPattern, ConcurrentQueue<QString> *outQueue) {
    openFile(file);

    QRegularExpression regex(splitPattern);
    regex.optimize();

    QString buffer;

    while (textStream.atEnd() == false) {
        if (outQueue->length() >= 1000) {
            Sleeper::msleep(10);
            continue;
        }

        QString readData = textStream.read(1024);
        buffer.append(readData);

        QRegularExpressionMatch match;
        while ((match = regex.match(buffer)).capturedStart() != -1) {
            int matchLength = match.capturedLength();

            QString line = buffer.left(match.capturedStart());
            buffer = buffer.mid(match.capturedStart() + matchLength);

            outQueue->enqueue(line);
        }
    }

    if (buffer.length() > 0) {
        outQueue->enqueue(buffer);
    }

    fileStream.close();

    emit done();
}
