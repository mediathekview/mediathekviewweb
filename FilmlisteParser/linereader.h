#ifndef LINEREADER_H
#define LINEREADER_H

#include "concurrentqueue.h"
#include <QObject>
#include <QString>
#include <QThread>

class LineReader : public QObject {
    Q_OBJECT

    QThread workerThread;

public:
    explicit LineReader(QObject* parent = 0);
    virtual ~LineReader();

signals:
    void readFile(const QString file, const QString splitPattern, ConcurrentQueue<QString> *outQueue);
    void done();

public slots:
};

#endif // LINEREADER_H
