#include "linereader.h"
#include "sleeper.h"
#include "concurrentqueue.h"
#include <QCoreApplication>
#include <QTextStream>
#include <QString>
#include <QThread>
#include <QJsonDocument>
#include <QJsonArray>

QTextStream &write()
{
    static QTextStream ts(stdout);
    return ts;
}

int main(int argc, char *argv[])
{
    QCoreApplication a(argc, argv);

    ConcurrentQueue<QString> queue;

    LineReader lineReader;

    lineReader.readFile("/home/patrick/filmliste", "({|,)?\\\"(Filmliste|X)\\\":", &queue);

    int processed = 0;

    while(true) {
        write() << queue.length() << endl;

        QString line;
        bool success = queue.dequeue(&line);

        if(!success || line.length() == 0)
            continue;

        QJsonDocument jsonDocument = QJsonDocument::fromJson(line.toUtf8());

        QJsonArray jsonArray = jsonDocument.array();
        processed++;

        if(processed % 10000 == 0)
            write() << processed << endl;

        //Sleeper::msleep(100);
    }

    return a.exec();
}

