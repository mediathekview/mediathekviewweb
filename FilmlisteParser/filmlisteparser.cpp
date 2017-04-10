#include "filmlisteparser.h"

#include <QFile>
#include <QIODevice>
#include <QString>
#include <QTextStream>

FilmlisteParser::FilmlisteParser(QObject *parent) : QObject(parent)
{

}

QString FilmlisteParser::parseFile(QString file) {
    return "";
}
