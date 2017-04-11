#ifndef LINEREADERWORKER_H
#define LINEREADERWORKER_H

#include "concurrentqueue.h"

#include <QFile>
#include <QObject>
#include <QString>
#include <QTextStream>

class LineReaderWorker : public QObject {
    Q_OBJECT

    QFile fileStream;
    QTextStream textStream;

public:
    explicit LineReaderWorker(QObject* parent = 0);
    ~LineReaderWorker();

    void openFile(const QString file);
    void readFileLineByLine(const QString file, const QString pattern, ConcurrentQueue<QString> *outQueue);

signals:
    void done();

public slots:
    void readFile(const QString file, const QString pattern, ConcurrentQueue<QString> *outQueue);
};

#endif // LINEREADERWORKER_H
