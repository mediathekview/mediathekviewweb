#ifndef LINEREADERWORKER_H
#define LINEREADERWORKER_H

#include "concurrentqueue.h"

#include <QObject>
#include <QFile>
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

signals:
    void done();

public slots:
    void readFile(const QString file, const QString splitPattern, ConcurrentQueue<QString> *outQueue);
};

#endif // LINEREADERWORKER_H
