#ifndef FILMLISTEPARSER_H
#define FILMLISTEPARSER_H

#include <QFile>
#include <QObject>
#include <QString>
#include <QTextStream>

class FilmlisteParser : public QObject {

    Q_OBJECT
public:
    explicit FilmlisteParser(QObject* parent = 0);
    QString parseFile(QString file);

signals:

public slots:
};

#endif // FILMLISTEPARSER_H
