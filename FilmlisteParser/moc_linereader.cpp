/****************************************************************************
** Meta object code from reading C++ file 'linereader.h'
**
** Created by: The Qt Meta Object Compiler version 67 (Qt 5.8.0)
**
** WARNING! All changes made in this file will be lost!
*****************************************************************************/

#include "linereader.h"
#include <QtCore/qbytearray.h>
#include <QtCore/qmetatype.h>
#if !defined(Q_MOC_OUTPUT_REVISION)
#error "The header file 'linereader.h' doesn't include <QObject>."
#elif Q_MOC_OUTPUT_REVISION != 67
#error "This file was generated using the moc from 5.8.0. It"
#error "cannot be used with the include files from this version of Qt."
#error "(The moc has changed too much.)"
#endif

QT_BEGIN_MOC_NAMESPACE
QT_WARNING_PUSH
QT_WARNING_DISABLE_DEPRECATED
struct qt_meta_stringdata_LineReader_t {
    QByteArrayData data[8];
    char stringdata0[79];
};
#define QT_MOC_LITERAL(idx, ofs, len) \
    Q_STATIC_BYTE_ARRAY_DATA_HEADER_INITIALIZER_WITH_OFFSET(len, \
    qptrdiff(offsetof(qt_meta_stringdata_LineReader_t, stringdata0) + ofs \
        - idx * sizeof(QByteArrayData)) \
    )
static const qt_meta_stringdata_LineReader_t qt_meta_stringdata_LineReader = {
    {
QT_MOC_LITERAL(0, 0, 10), // "LineReader"
QT_MOC_LITERAL(1, 11, 8), // "readFile"
QT_MOC_LITERAL(2, 20, 0), // ""
QT_MOC_LITERAL(3, 21, 4), // "file"
QT_MOC_LITERAL(4, 26, 12), // "splitPattern"
QT_MOC_LITERAL(5, 39, 25), // "ConcurrentQueue<QString>*"
QT_MOC_LITERAL(6, 65, 8), // "outQueue"
QT_MOC_LITERAL(7, 74, 4) // "done"

    },
    "LineReader\0readFile\0\0file\0splitPattern\0"
    "ConcurrentQueue<QString>*\0outQueue\0"
    "done"
};
#undef QT_MOC_LITERAL

static const uint qt_meta_data_LineReader[] = {

 // content:
       7,       // revision
       0,       // classname
       0,    0, // classinfo
       2,   14, // methods
       0,    0, // properties
       0,    0, // enums/sets
       0,    0, // constructors
       0,       // flags
       2,       // signalCount

 // signals: name, argc, parameters, tag, flags
       1,    3,   24,    2, 0x06 /* Public */,
       7,    0,   31,    2, 0x06 /* Public */,

 // signals: parameters
    QMetaType::Void, QMetaType::QString, QMetaType::QString, 0x80000000 | 5,    3,    4,    6,
    QMetaType::Void,

       0        // eod
};

void LineReader::qt_static_metacall(QObject *_o, QMetaObject::Call _c, int _id, void **_a)
{
    if (_c == QMetaObject::InvokeMetaMethod) {
        LineReader *_t = static_cast<LineReader *>(_o);
        Q_UNUSED(_t)
        switch (_id) {
        case 0: _t->readFile((*reinterpret_cast< const QString(*)>(_a[1])),(*reinterpret_cast< const QString(*)>(_a[2])),(*reinterpret_cast< ConcurrentQueue<QString>*(*)>(_a[3]))); break;
        case 1: _t->done(); break;
        default: ;
        }
    } else if (_c == QMetaObject::IndexOfMethod) {
        int *result = reinterpret_cast<int *>(_a[0]);
        void **func = reinterpret_cast<void **>(_a[1]);
        {
            typedef void (LineReader::*_t)(const QString , const QString , ConcurrentQueue<QString> * );
            if (*reinterpret_cast<_t *>(func) == static_cast<_t>(&LineReader::readFile)) {
                *result = 0;
                return;
            }
        }
        {
            typedef void (LineReader::*_t)();
            if (*reinterpret_cast<_t *>(func) == static_cast<_t>(&LineReader::done)) {
                *result = 1;
                return;
            }
        }
    }
}

const QMetaObject LineReader::staticMetaObject = {
    { &QObject::staticMetaObject, qt_meta_stringdata_LineReader.data,
      qt_meta_data_LineReader,  qt_static_metacall, Q_NULLPTR, Q_NULLPTR}
};


const QMetaObject *LineReader::metaObject() const
{
    return QObject::d_ptr->metaObject ? QObject::d_ptr->dynamicMetaObject() : &staticMetaObject;
}

void *LineReader::qt_metacast(const char *_clname)
{
    if (!_clname) return Q_NULLPTR;
    if (!strcmp(_clname, qt_meta_stringdata_LineReader.stringdata0))
        return static_cast<void*>(const_cast< LineReader*>(this));
    return QObject::qt_metacast(_clname);
}

int LineReader::qt_metacall(QMetaObject::Call _c, int _id, void **_a)
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
void LineReader::readFile(const QString _t1, const QString _t2, ConcurrentQueue<QString> * _t3)
{
    void *_a[] = { Q_NULLPTR, const_cast<void*>(reinterpret_cast<const void*>(&_t1)), const_cast<void*>(reinterpret_cast<const void*>(&_t2)), const_cast<void*>(reinterpret_cast<const void*>(&_t3)) };
    QMetaObject::activate(this, &staticMetaObject, 0, _a);
}

// SIGNAL 1
void LineReader::done()
{
    QMetaObject::activate(this, &staticMetaObject, 1, Q_NULLPTR);
}
QT_WARNING_POP
QT_END_MOC_NAMESPACE
