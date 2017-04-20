#include "filmlisteparser.h"
#include "sleeper.h"
#include "concurrentqueue.h"
#include "model.h"
#include <QCoreApplication>
#include <QString>
#include <QDebug>
#include <QElapsedTimer>

int main(int argc, char *argv[])
{
    QCoreApplication a(argc, argv);

    while(true) {
        QElapsedTimer timer;
        timer.start();

        ConcurrentQueue<Entry> entryQueue;

        FilmlisteParser parser;
        parser.parseFile("/home/patrick/filmliste", "({|,)?\\\"(Filmliste|X)\\\":", &entryQueue);

        int currentLine = 0;

        bool isLast = false;
        while(!isLast) {
            Entry entry;
            bool success = entryQueue.dequeue(entry, isLast);

            if (!success) {
                Sleeper::msleep(1);
                continue;
            }

            // qDebug() << ++currentLine << entry.id;
        }

        qDebug() << timer.elapsed();
    }

    return a.exec();
}

