/****************************************************************************
** Meta object code from reading C++ file 'filmlisteparser.h'
**
** Created by: The Qt Meta Object Compiler version 67 (Qt 5.8.0)
**
** WARNING! All changes made in this file will be lost!
*****************************************************************************/

#include "filmlisteparser.h"
#include <QtCore/qbytearray.h>
#include <QtCore/qmetatype.h>
#if !defined(Q_MOC_OUTPUT_REVISION)
#error "The header file 'filmlisteparser.h' doesn't include <QObject>."
#elif Q_MOC_OUTPUT_REVISION != 67
#error "This file was generated using the moc from 5.8.0. It"
#error "cannot be used with the include files from this version of Qt."
#error "(The moc has changed too much.)"
#endif

QT_BEGIN_MOC_NAMESPACE
QT_WARNING_PUSH
QT_WARNING_DISABLE_DEPRECATED
struct qt_meta_stringdata_FilmlisteParser_t {
    QByteArrayData data[7];
    char stringdata0[104];
};
#define QT_MOC_LITERAL(idx, ofs, len) \
    Q_STATIC_BYTE_ARRAY_DATA_HEADER_INITIALIZER_WITH_OFFSET(len, \
    qptrdiff(offsetof(qt_meta_stringdata_FilmlisteParser_t, stringdata0) + ofs \
        - idx * sizeof(QByteArrayData)) \
    )
static const qt_meta_stringdata_FilmlisteParser_t qt_meta_stringdata_FilmlisteParser = {
    {
QT_MOC_LITERAL(0, 0, 15), // "FilmlisteParser"
QT_MOC_LITERAL(1, 16, 10), // "parseLines"
QT_MOC_LITERAL(2, 27, 0), // ""
QT_MOC_LITERAL(3, 28, 25), // "ConcurrentQueue<QString>*"
QT_MOC_LITERAL(4, 54, 11), // "lineInQueue"
QT_MOC_LITERAL(5, 66, 23), // "ConcurrentQueue<Entry>*"
QT_MOC_LITERAL(6, 90, 13) // "entryOutQueue"

    },
    "FilmlisteParser\0parseLines\0\0"
    "ConcurrentQueue<QString>*\0lineInQueue\0"
    "ConcurrentQueue<Entry>*\0entryOutQueue"
};
#undef QT_MOC_LITERAL

static const uint qt_meta_data_FilmlisteParser[] = {

 // content:
       7,       // revision
       0,       // classname
       0,    0, // classinfo
       1,   14, // methods
       0,    0, // properties
       0,    0, // enums/sets
       0,    0, // constructors
       0,       // flags
       1,       // signalCount

 // signals: name, argc, parameters, tag, flags
       1,    2,   19,    2, 0x06 /* Public */,

 // signals: parameters
    QMetaType::Void, 0x80000000 | 3, 0x80000000 | 5,    4,    6,

       0        // eod
};

void FilmlisteParser::qt_static_metacall(QObject *_o, QMetaObject::Call _c, int _id, void **_a)
{
    if (_c == QMetaObject::InvokeMetaMethod) {
        FilmlisteParser *_t = static_cast<FilmlisteParser *>(_o);
        Q_UNUSED(_t)
        switch (_id) {
        case 0: _t->parseLines((*reinterpret_cast< ConcurrentQueue<QString>*(*)>(_a[1])),(*reinterpret_cast< ConcurrentQueue<Entry>*(*)>(_a[2]))); break;
        default: ;
        }
    } else if (_c == QMetaObject::IndexOfMethod) {
        int *result = reinterpret_cast<int *>(_a[0]);
        void **func = reinterpret_cast<void **>(_a[1]);
        {
            typedef void (FilmlisteParser::*_t)(ConcurrentQueue<QString> * , ConcurrentQueue<Entry> * );
            if (*reinterpret_cast<_t *>(func) == static_cast<_t>(&FilmlisteParser::parseLines)) {
                *result = 0;
                return;
            }
        }
    }
}

const QMetaObject FilmlisteParser::staticMetaObject = {
    { &QObject::staticMetaObject, qt_meta_stringdata_FilmlisteParser.data,
      qt_meta_data_FilmlisteParser,  qt_static_metacall, Q_NULLPTR, Q_NULLPTR}
};


const QMetaObject *FilmlisteParser::metaObject() const
{
    return QObject::d_ptr->metaObject ? QObject::d_ptr->dynamicMetaObject() : &staticMetaObject;
}

void *FilmlisteParser::qt_metacast(const char *_clname)
{
    if (!_clname) return Q_NULLPTR;
    if (!strcmp(_clname, qt_meta_stringdata_FilmlisteParser.stringdata0))
        return static_cast<void*>(const_cast< FilmlisteParser*>(this));
    return QObject::qt_metacast(_clname);
}

int FilmlisteParser::qt_metacall(QMetaObject::Call _c, int _id, void **_a)
{
    _id = QObject::qt_metacall(_c, _id, _a);
    if (_id < 0)
        return _id;
    if (_c == QMetaObject::InvokeMetaMethod) {
        if (_id < 1)
            qt_static_metacall(this, _c, _id, _a);
        _id -= 1;
    } else if (_c == QMetaObject::RegisterMethodArgumentMetaType) {
        if (_id < 1)
            *reinterpret_cast<int*>(_a[0]) = -1;
        _id -= 1;
    }
    return _id;
}

// SIGNAL 0
void FilmlisteParser::parseLines(ConcurrentQueue<QString> * _t1, ConcurrentQueue<Entry> * _t2)
{
    void *_a[] = { Q_NULLPTR, const_cast<void*>(reinterpret_cast<const void*>(&_t1)), const_cast<void*>(reinterpret_cast<const void*>(&_t2)) };
    QMetaObject::activate(this, &staticMetaObject, 0, _a);
}
QT_WARNING_POP
QT_END_MOC_NAMESPACE
