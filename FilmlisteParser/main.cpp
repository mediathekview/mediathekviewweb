#include "filmlisteparser.h"
#include "sleeper.h"
#include "concurrentqueue.h"
#include "model.h"
#include <QCoreApplication>
#include <QString>
#include <QDebug>

int main(int argc, char *argv[])
{
    QCoreApplication a(argc, argv);

    qDebug() << "main" << QThread::currentThreadId();

    ConcurrentQueue<Entry> entryQueue;

    FilmlisteParser parser;
    parser.parseFile("/home/patrick/filmliste", "({|,)?\\\"(Filmliste|X)\\\":", &entryQueue);

    bool isLast = false;
    while(!isLast) {
        Entry entry;
        bool success = entryQueue.dequeue(entry, isLast);

        if (!success) {
            Sleeper::msleep(1);
            continue;
        }
    }

    return a.exec();
}

