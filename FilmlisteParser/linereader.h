#ifndef LINEREADER_H
#define LINEREADER_H

#include <QFile>
#include <QMutex>
#include <QObject>
#include <QQueue>
#include <QString>
#include <QTextStream>
#include <QThread>

class LineReader : public QObject {
    Q_OBJECT

    QThread workerThread;

public:
    explicit LineReader(QObject* parent = 0);
    ~LineReader();

signals:
    void readFile(const QString file, const QString pattern, QQueue<QString>* outQueue, QMutex* queueMutex);
    void done();

public slots:
};

#endif // LINEREADER_H
