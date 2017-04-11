#ifndef FILMLISTEPARSER_H
#define FILMLISTEPARSER_H

#include <node/node.h>
#include <node/v8.h>

#include <QObject>
#include <QString>

class FilmlisteParser : public QObject {

    Q_OBJECT
public:
    explicit FilmlisteParser(QObject* parent = 0);
    QString parseFile(QString file);

signals:

public slots:
};

#endif // FILMLISTEPARSER_H
