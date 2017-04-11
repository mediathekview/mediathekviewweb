#include "filmlisteparser.h"

#include <node/node.h>
#include <node/v8.h>

#include <QString>

FilmlisteParser::FilmlisteParser(QObject *parent) : QObject(parent)
{

}

QString FilmlisteParser::parseFile(QString file) {
    return "";
}
