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
    QByteArrayData data[12];
    char stringdata0[147];
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
QT_MOC_LITERAL(6, 90, 13), // "entryOutQueue"
QT_MOC_LITERAL(7, 104, 4), // "done"
QT_MOC_LITERAL(8, 109, 9), // "parseFile"
QT_MOC_LITERAL(9, 119, 4), // "file"
QT_MOC_LITERAL(10, 124, 12), // "splitPattern"
QT_MOC_LITERAL(11, 137, 9) // "chunkSize"

    },
    "FilmlisteParser\0parseLines\0\0"
    "ConcurrentQueue<QString>*\0lineInQueue\0"
    "ConcurrentQueue<Entry>*\0entryOutQueue\0"
    "done\0parseFile\0file\0splitPattern\0"
    "chunkSize"
};
#undef QT_MOC_LITERAL

static const uint qt_meta_data_FilmlisteParser[] = {

 // content:
       7,       // revision
       0,       // classname
       0,    0, // classinfo
       3,   14, // methods
       0,    0, // properties
       0,    0, // enums/sets
       0,    0, // constructors
       0,       // flags
       2,       // signalCount

 // signals: name, argc, parameters, tag, flags
       1,    2,   29,    2, 0x06 /* Public */,
       7,    0,   34,    2, 0x06 /* Public */,

 // slots: name, argc, parameters, tag, flags
       8,    3,   35,    2, 0x0a /* Public */,

 // signals: parameters
    QMetaType::Void, 0x80000000 | 3, 0x80000000 | 5,    4,    6,
    QMetaType::Void,

 // slots: parameters
    QMetaType::Void, QMetaType::QString, QMetaType::QString, QMetaType::Int,    9,   10,   11,

       0        // eod
};

void FilmlisteParser::qt_static_metacall(QObject *_o, QMetaObject::Call _c, int _id, void **_a)
{
    if (_c == QMetaObject::InvokeMetaMethod) {
        FilmlisteParser *_t = static_cast<FilmlisteParser *>(_o);
        Q_UNUSED(_t)
        switch (_id) {
        case 0: _t->parseLines((*reinterpret_cast< ConcurrentQueue<QString>*(*)>(_a[1])),(*reinterpret_cast< ConcurrentQueue<Entry>*(*)>(_a[2]))); break;
        case 1: _t->done(); break;
        case 2: _t->parseFile((*reinterpret_cast< QString(*)>(_a[1])),(*reinterpret_cast< QString(*)>(_a[2])),(*reinterpret_cast< int(*)>(_a[3]))); break;
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
        {
            typedef void (FilmlisteParser::*_t)();
            if (*reinterpret_cast<_t *>(func) == static_cast<_t>(&FilmlisteParser::done)) {
                *result = 1;
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
        if (_id < 3)
            qt_static_metacall(this, _c, _id, _a);
        _id -= 3;
    } else if (_c == QMetaObject::RegisterMethodArgumentMetaType) {
        if (_id < 3)
            *reinterpret_cast<int*>(_a[0]) = -1;
        _id -= 3;
    }
    return _id;
}

// SIGNAL 0
void FilmlisteParser::parseLines(ConcurrentQueue<QString> * _t1, ConcurrentQueue<Entry> * _t2)
{
    void *_a[] = { Q_NULLPTR, const_cast<void*>(reinterpret_cast<const void*>(&_t1)), const_cast<void*>(reinterpret_cast<const void*>(&_t2)) };
    QMetaObject::activate(this, &staticMetaObject, 0, _a);
}

// SIGNAL 1
void FilmlisteParser::done()
{
    QMetaObject::activate(this, &staticMetaObject, 1, Q_NULLPTR);
}
QT_WARNING_POP
QT_END_MOC_NAMESPACE
