#include "linereader.h"
#include "sleeper.h"
#include <QCoreApplication>
#include <QMutex>
#include <QString>
#include <QQueue>
#include <QThread>

QTextStream &write()
{
    static QTextStream ts(stdout);
    return ts;
}

int main(int argc, char *argv[])
{
    QCoreApplication a(argc, argv);

    QMutex queueMutex;
    QQueue<QString> queue;

    LineReader lineReader;

    lineReader.readFile("/home/patrick/filmliste", "({|,)?\\\"(Filmliste|X)\\\":", &queue, &queueMutex);

    while(true) {
        queueMutex.lock();
            write() << queue.length() << endl << endl;
        queueMutex.unlock();
        Sleeper::msleep(100);
    }

    return a.exec();
}

