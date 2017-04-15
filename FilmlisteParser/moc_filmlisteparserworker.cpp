/****************************************************************************
** Meta object code from reading C++ file 'filmlisteparserworker.h'
**
** Created by: The Qt Meta Object Compiler version 67 (Qt 5.8.0)
**
** WARNING! All changes made in this file will be lost!
*****************************************************************************/

#include "filmlisteparserworker.h"
#include <QtCore/qbytearray.h>
#include <QtCore/qmetatype.h>
#if !defined(Q_MOC_OUTPUT_REVISION)
#error "The header file 'filmlisteparserworker.h' doesn't include <QObject>."
#elif Q_MOC_OUTPUT_REVISION != 67
#error "This file was generated using the moc from 5.8.0. It"
#error "cannot be used with the include files from this version of Qt."
#error "(The moc has changed too much.)"
#endif

QT_BEGIN_MOC_NAMESPACE
QT_WARNING_PUSH
QT_WARNING_DISABLE_DEPRECATED
struct qt_meta_stringdata_FilmlisteParserWorker_t {
    QByteArrayData data[9];
    char stringdata0[127];
};
#define QT_MOC_LITERAL(idx, ofs, len) \
    Q_STATIC_BYTE_ARRAY_DATA_HEADER_INITIALIZER_WITH_OFFSET(len, \
    qptrdiff(offsetof(qt_meta_stringdata_FilmlisteParserWorker_t, stringdata0) + ofs \
        - idx * sizeof(QByteArrayData)) \
    )
static const qt_meta_stringdata_FilmlisteParserWorker_t qt_meta_stringdata_FilmlisteParserWorker = {
    {
QT_MOC_LITERAL(0, 0, 21), // "FilmlisteParserWorker"
QT_MOC_LITERAL(1, 22, 4), // "done"
QT_MOC_LITERAL(2, 27, 0), // ""
QT_MOC_LITERAL(3, 28, 10), // "parseLines"
QT_MOC_LITERAL(4, 39, 25), // "ConcurrentQueue<QString>*"
QT_MOC_LITERAL(5, 65, 11), // "lineInQueue"
QT_MOC_LITERAL(6, 77, 23), // "ConcurrentQueue<Entry>*"
QT_MOC_LITERAL(7, 101, 13), // "entryOutQueue"
QT_MOC_LITERAL(8, 115, 11) // "noMoreLines"

    },
    "FilmlisteParserWorker\0done\0\0parseLines\0"
    "ConcurrentQueue<QString>*\0lineInQueue\0"
    "ConcurrentQueue<Entry>*\0entryOutQueue\0"
    "noMoreLines"
};
#undef QT_MOC_LITERAL

static const uint qt_meta_data_FilmlisteParserWorker[] = {

 // content:
       7,       // revision
       0,       // classname
       0,    0, // classinfo
       3,   14, // methods
       0,    0, // properties
       0,    0, // enums/sets
       0,    0, // constructors
       0,       // flags
       1,       // signalCount

 // signals: name, argc, parameters, tag, flags
       1,    0,   29,    2, 0x06 /* Public */,

 // slots: name, argc, parameters, tag, flags
       3,    2,   30,    2, 0x0a /* Public */,
       8,    0,   35,    2, 0x0a /* Public */,

 // signals: parameters
    QMetaType::Void,

 // slots: parameters
    QMetaType::Void, 0x80000000 | 4, 0x80000000 | 6,    5,    7,
    QMetaType::Void,

       0        // eod
};

void FilmlisteParserWorker::qt_static_metacall(QObject *_o, QMetaObject::Call _c, int _id, void **_a)
{
    if (_c == QMetaObject::InvokeMetaMethod) {
        FilmlisteParserWorker *_t = static_cast<FilmlisteParserWorker *>(_o);
        Q_UNUSED(_t)
        switch (_id) {
        case 0: _t->done(); break;
        case 1: _t->parseLines((*reinterpret_cast< ConcurrentQueue<QString>*(*)>(_a[1])),(*reinterpret_cast< ConcurrentQueue<Entry>*(*)>(_a[2]))); break;
        case 2: _t->noMoreLines(); break;
        default: ;
        }
    } else if (_c == QMetaObject::IndexOfMethod) {
        int *result = reinterpret_cast<int *>(_a[0]);
        void **func = reinterpret_cast<void **>(_a[1]);
        {
            typedef void (FilmlisteParserWorker::*_t)();
            if (*reinterpret_cast<_t *>(func) == static_cast<_t>(&FilmlisteParserWorker::done)) {
                *result = 0;
                return;
            }
        }
    }
}

const QMetaObject FilmlisteParserWorker::staticMetaObject = {
    { &QObject::staticMetaObject, qt_meta_stringdata_FilmlisteParserWorker.data,
      qt_meta_data_FilmlisteParserWorker,  qt_static_metacall, Q_NULLPTR, Q_NULLPTR}
};


const QMetaObject *FilmlisteParserWorker::metaObject() const
{
    return QObject::d_ptr->metaObject ? QObject::d_ptr->dynamicMetaObject() : &staticMetaObject;
}

void *FilmlisteParserWorker::qt_metacast(const char *_clname)
{
    if (!_clname) return Q_NULLPTR;
    if (!strcmp(_clname, qt_meta_stringdata_FilmlisteParserWorker.stringdata0))
        return static_cast<void*>(const_cast< FilmlisteParserWorker*>(this));
    return QObject::qt_metacast(_clname);
}

int FilmlisteParserWorker::qt_metacall(QMetaObject::Call _c, int _id, void **_a)
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
void FilmlisteParserWorker::done()
{
    QMetaObject::activate(this, &staticMetaObject, 0, Q_NULLPTR);
}
QT_WARNING_POP
QT_END_MOC_NAMESPACE
