#include "filmlisteparser.h"
#include "concurrentqueue.h"
#include "model.h"
#include "sleeper.h"

#include <QCoreApplication>
#include <nan.h>
#include <QString>
#include <QEventLoop>
#include <QObject>
#include <QList>
#include <QDebug>

using namespace v8;
using namespace Nan;

#define BATCH_SIZE 100

struct EntryBatch {
    int length;
    Entry entries[BATCH_SIZE];
};


class NativeFilmlisteParser : public AsyncProgressWorkerBase<EntryBatch> {
    Callback *progressCallback;
    Callback *endCallback;
    QString file;
    QString splitPattern;
    int batchSize;

public:
    NativeFilmlisteParser(Callback *progressCallback, Callback *endCallback, QString file, QString splitPattern, int batchSize) : AsyncProgressWorkerBase<EntryBatch>(callback) {
        this->progressCallback = progressCallback;
        this->endCallback = endCallback;
        this->file = file;
        this->splitPattern = splitPattern;
        this->batchSize = batchSize;
    }

    ~NativeFilmlisteParser() {}

    void Execute(const Nan::AsyncProgressWorkerBase<EntryBatch>::ExecutionProgress &progress) {
        int argc;
        char *argv;

        QCoreApplication a(argc, &argv);

        ConcurrentQueue<Entry> entryQueue;
        FilmlisteParser parser;
        parser.parseFile(file, splitPattern, &entryQueue);

        bool isLast = false;
        while(!isLast) {
            EntryBatch entryBatch;

            while (!isLast && entryBatch.length < BATCH_SIZE) {
                Entry entry;
                bool success = entryQueue.dequeue(entry, isLast);

                if (!success) {
                    Sleeper::msleep(1);
                    continue;
                }

                entryBatch.entries[entryBatch.length++] = entry;
            }

            qDebug() << "lets see...";
            progress.Send(&entryBatch, sizeof(EntryBatch));
            qDebug() << "works";
        }

        a.exec();
    }

    void HandleProgressCallback(const EntryBatch *entryBatch, size_t size) {
        //TODO:
        //Check using debugger if data points to entry (line 38). if so. make entry line38 a pointer, and free it here.
        //kapiert? ja -> weil sonst das memory bereits wieder überschrieben würde... (in der while oben)

        qDebug() << 1;
        Nan::HandleScope scope;

        /*int count = entryBatch->length();

        v8::Local<v8::Array> results = Nan::New<v8::Array>(count);

        for (int i = 0; i < count; i++) {
            Entry entry = entryBatch->at(i);

            Local<Object> obj = Nan::New<Object>();
            Nan::Set(obj, Nan::New("id").ToLocalChecked(), New<v8::String>(entry.id.toStdString()).ToLocalChecked());

            Nan::Set(results, i, obj);
        }*/

        v8::Local<v8::Value> argv[] = {
            Nan::New<v8::String>("entryBatch").ToLocalChecked()
        };

        callback->Call(sizeof(argv)/sizeof(v8::Local<v8::Value>), argv);

        qDebug() << 2;
        /*v8::Local<v8::Boolean> results = Nan::New<v8::Boolean>(entryBatch).ToLocalChecked();

        qDebug() << 3;
        Local<Value> argv[] = { results };

        qDebug() << 4;
        callback->Call(1, argv);
        qDebug() << 5;*/
    }

    void WorkComplete() {

    }

    void HandleOKCallback() {
        endCallback->Call(0, 0);
    }

    void HandleErrorCallback() {

    }

    void Destroy() {

    }
};

NAN_METHOD(DoProgress) {
    Callback *progress = new Callback(info[2].As<v8::Function>());
    Callback *callback = new Callback(info[3].As<v8::Function>());

    Utf8String arg0(info[0]);
    Utf8String arg1(info[1]);

    QString file = QString::fromUtf8(*arg0, arg0.length());
    QString splitPattern = QString::fromUtf8(*arg1, arg1.length());

    AsyncQueueWorker(new NativeFilmlisteParser(progress, callback, file, splitPattern, 100));
}

NAN_MODULE_INIT(Init) {
    Nan::Set(target
             , New<v8::String>("a").ToLocalChecked()
             , New<v8::FunctionTemplate>(DoProgress)->GetFunction());
}

NODE_MODULE(asyncprogressworker, Init)


/*
    void parseFilmliste(const v8::FunctionCallbackInfo<Value>& info) {
    Utf8String arg0(info[0]);
    Utf8String arg1(info[1]);
    Callback *callback = new Callback(info[2].As<Function>());

    QString filename = QString::fromUtf8(*arg0, arg0.length());
    QString splitPattern = QString::fromUtf8(*arg1, arg1.length());
}

void Init(Local<Object> exports, Local<Object> module) {
    NODE_SET_METHOD(module, "exports", parseFilmliste);
}

NODE_MODULE(addon, Init)
*/
