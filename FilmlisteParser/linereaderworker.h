#ifndef LINEREADERWORKER_H
#define LINEREADERWORKER_H

#include <QFile>
#include <QMutex>
#include <QObject>
#include <QQueue>
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
    void readFileLineByLine(const QString file, const QString pattern, QQueue<QString>* outQueue, QMutex* queueMutex);

signals:
    void done();

public slots:
    void readFile(const QString file, const QString pattern, QQueue<QString>* outQueue, QMutex* queueMutex);
};

#endif // LINEREADERWORKER_H
