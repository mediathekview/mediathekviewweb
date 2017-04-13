/****************************************************************************
** Meta object code from reading C++ file 'linereaderworker.h'
**
** Created by: The Qt Meta Object Compiler version 67 (Qt 5.8.0)
**
** WARNING! All changes made in this file will be lost!
*****************************************************************************/

#include "linereaderworker.h"
#include <QtCore/qbytearray.h>
#include <QtCore/qmetatype.h>
#if !defined(Q_MOC_OUTPUT_REVISION)
#error "The header file 'linereaderworker.h' doesn't include <QObject>."
#elif Q_MOC_OUTPUT_REVISION != 67
#error "This file was generated using the moc from 5.8.0. It"
#error "cannot be used with the include files from this version of Qt."
#error "(The moc has changed too much.)"
#endif

QT_BEGIN_MOC_NAMESPACE
QT_WARNING_PUSH
QT_WARNING_DISABLE_DEPRECATED
struct qt_meta_stringdata_LineReaderWorker_t {
    QByteArrayData data[8];
    char stringdata0[85];
};
#define QT_MOC_LITERAL(idx, ofs, len) \
    Q_STATIC_BYTE_ARRAY_DATA_HEADER_INITIALIZER_WITH_OFFSET(len, \
    qptrdiff(offsetof(qt_meta_stringdata_LineReaderWorker_t, stringdata0) + ofs \
        - idx * sizeof(QByteArrayData)) \
    )
static const qt_meta_stringdata_LineReaderWorker_t qt_meta_stringdata_LineReaderWorker = {
    {
QT_MOC_LITERAL(0, 0, 16), // "LineReaderWorker"
QT_MOC_LITERAL(1, 17, 4), // "done"
QT_MOC_LITERAL(2, 22, 0), // ""
QT_MOC_LITERAL(3, 23, 8), // "readFile"
QT_MOC_LITERAL(4, 32, 4), // "file"
QT_MOC_LITERAL(5, 37, 12), // "splitPattern"
QT_MOC_LITERAL(6, 50, 25), // "ConcurrentQueue<QString>*"
QT_MOC_LITERAL(7, 76, 8) // "outQueue"

    },
    "LineReaderWorker\0done\0\0readFile\0file\0"
    "splitPattern\0ConcurrentQueue<QString>*\0"
    "outQueue"
};
#undef QT_MOC_LITERAL

static const uint qt_meta_data_LineReaderWorker[] = {

 // content:
       7,       // revision
       0,       // classname
       0,    0, // classinfo
       2,   14, // methods
       0,    0, // properties
       0,    0, // enums/sets
       0,    0, // constructors
       0,       // flags
       1,       // signalCount

 // signals: name, argc, parameters, tag, flags
       1,    0,   24,    2, 0x06 /* Public */,

 // slots: name, argc, parameters, tag, flags
       3,    3,   25,    2, 0x0a /* Public */,

 // signals: parameters
    QMetaType::Void,

 // slots: parameters
    QMetaType::Void, QMetaType::QString, QMetaType::QString, 0x80000000 | 6,    4,    5,    7,

       0        // eod
};

void LineReaderWorker::qt_static_metacall(QObject *_o, QMetaObject::Call _c, int _id, void **_a)
{
    if (_c == QMetaObject::InvokeMetaMethod) {
        LineReaderWorker *_t = static_cast<LineReaderWorker *>(_o);
        Q_UNUSED(_t)
        switch (_id) {
        case 0: _t->done(); break;
        case 1: _t->readFile((*reinterpret_cast< const QString(*)>(_a[1])),(*reinterpret_cast< const QString(*)>(_a[2])),(*reinterpret_cast< ConcurrentQueue<QString>*(*)>(_a[3]))); break;
        default: ;
        }
    } else if (_c == QMetaObject::IndexOfMethod) {
        int *result = reinterpret_cast<int *>(_a[0]);
        void **func = reinterpret_cast<void **>(_a[1]);
        {
            typedef void (LineReaderWorker::*_t)();
            if (*reinterpret_cast<_t *>(func) == static_cast<_t>(&LineReaderWorker::done)) {
                *result = 0;
                return;
            }
        }
    }
}

const QMetaObject LineReaderWorker::staticMetaObject = {
    { &QObject::staticMetaObject, qt_meta_stringdata_LineReaderWorker.data,
      qt_meta_data_LineReaderWorker,  qt_static_metacall, Q_NULLPTR, Q_NULLPTR}
};


const QMetaObject *LineReaderWorker::metaObject() const
{
    return QObject::d_ptr->metaObject ? QObject::d_ptr->dynamicMetaObject() : &staticMetaObject;
}

void *LineReaderWorker::qt_metacast(const char *_clname)
{
    if (!_clname) return Q_NULLPTR;
    if (!strcmp(_clname, qt_meta_stringdata_LineReaderWorker.stringdata0))
        return static_cast<void*>(const_cast< LineReaderWorker*>(this));
    return QObject::qt_metacast(_clname);
}

int LineReaderWorker::qt_metacall(QMetaObject::Call _c, int _id, void **_a)
{
    _id = QObject::qt_metacall(_c, _id, _a);
    if (_id < 0)
        return _id;
    if (_c == QMetaObject::InvokeMetaMethod) {
        if (_id < 2)
            qt_static_metacall(this, _c, _id, _a);
        _id -= 2;
    } else if (_c == QMetaObject::RegisterMethodArgumentMetaType) {
        if (_id < 2)
            *reinterpret_cast<int*>(_a[0]) = -1;
        _id -= 2;
    }
    return _id;
}

// SIGNAL 0
void LineReaderWorker::done()
{
    QMetaObject::activate(this, &staticMetaObject, 0, Q_NULLPTR);
}
QT_WARNING_POP
QT_END_MOC_NAMESPACE
