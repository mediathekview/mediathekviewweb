#include "concurrentqueue.h"
#include "filmlisteparser.h"
#include "model.h"
#include "sleeper.h"

#include <QCoreApplication>
#include <QDebug>
#include <QEventLoop>
#include <QList>
#include <QObject>
#include <QString>
#include <QTimer>
#include <nan.h>
#include <uv.h>

using namespace v8;
using namespace Nan;

typedef QList<Entry>* EntryBatch;

class NativeFilmlisteParser {
    Callback* progressCallback;
    Callback* endCallback;
    QString file;
    QString splitPattern;
    int batchSize;

    QMutex batchMutex;
    ConcurrentQueue<QList<Entry>> batchQueue; //must be guarded by batchmutex
    //QList<Entry> entryBatch;
    // bool shouldTerminate;  //must be guarded by batchmutex

    uv_async_t* async;
    uv_work_t request;

public:
    //Called in threadpool
    static void AsyncExecute(uv_work_t* req)
    {
        NativeFilmlisteParser* worker = static_cast<NativeFilmlisteParser*>(req->data);
        worker->Execute();
    }

    //Called when in v8 main thread, after a signal has been reveived
    static NAUV_WORK_CB(AsyncProgress)
    {
        NativeFilmlisteParser* worker = static_cast<NativeFilmlisteParser*>(async->data);
        worker->WorkProgress();
    }

    //called when Execute() is done (threadpool)
    static void AsyncExecuteComplete(uv_work_t* req)
    {
        //NativeFilmlisteParser* worker = static_cast<NativeFilmlisteParser*>(req->data);
    }

    //Called when async stuff is done (triggerd by uv_close)
    inline static void AsyncClose(uv_handle_t* handle)
    {
        NativeFilmlisteParser* worker = static_cast<NativeFilmlisteParser*>(handle->data);

        Nan::HandleScope scope;
        worker->endCallback->Call(0, NULL);

        delete reinterpret_cast<uv_async_t*>(handle);
        delete worker;
    }

    NativeFilmlisteParser(Callback* progressCallback, Callback* endCallback, QString file, QString splitPattern, int batchSize)
    {
        this->progressCallback = progressCallback;
        this->endCallback = endCallback;
        this->file = file;
        this->splitPattern = splitPattern;
        this->batchSize = batchSize;

        //Create async => AsyncProgress will be called whenever nodejs has time for it (in the v8 thread)
        async = new uv_async_t;
        uv_async_init(
            uv_default_loop(), async, NativeFilmlisteParser::AsyncProgress);
        async->data = this;

        //Create a Thread with v8 => AsyncExecute will be called once, and AsyncExecuteComplete afterwards
        request.data = this;

        uv_queue_work(
            uv_default_loop(), &request, NativeFilmlisteParser::AsyncExecute, reinterpret_cast<uv_after_work_cb>(NativeFilmlisteParser::AsyncExecuteComplete));
    }

    ~NativeFilmlisteParser() {}

    void Destroy()
    {
        uv_close(reinterpret_cast<uv_handle_t*>(async), NativeFilmlisteParser::AsyncClose);
    }

    void WorkProgress()
    {
        //in v8 thread

        QList<Entry> batch;
        bool isLast, isClosed;
        bool success = batchQueue.dequeue(batch, isLast, isClosed);

        if (!success) {
            return;
        }

        Nan::HandleScope scope;
        v8::Local<v8::Value> argv[] = { convertToV8Batch(batch) };

        progressCallback->Call(sizeof(argv) / sizeof(v8::Local<v8::Value>), argv);

        if (isLast) {
            Destroy();
        } else if (isClosed) {
            uv_async_send(async);
        }
    }

    inline v8::Local<v8::Array> convertToV8Batch(QList<Entry> batch)
    {
        int count = batch.length();

        v8::Local<v8::Array> v8Batch = Nan::New<v8::Array>(count);

        for (int i = 0; i < count; i++) {
            Entry entry = batch[i];

            Local<Object> entryObj = Nan::New<Object>();
            Nan::Set(entryObj, Nan::New("id").ToLocalChecked(), New<v8::String>(entry.id.toStdString()).ToLocalChecked());
            Nan::Set(entryObj, Nan::New("channel").ToLocalChecked(), New<v8::String>(entry.channel.toStdString()).ToLocalChecked());
            Nan::Set(entryObj, Nan::New("topic").ToLocalChecked(), New<v8::String>(entry.topic.toStdString()).ToLocalChecked());
            Nan::Set(entryObj, Nan::New("title").ToLocalChecked(), New<v8::String>(entry.title.toStdString()).ToLocalChecked());
            Nan::Set(entryObj, Nan::New("timestamp").ToLocalChecked(), New<v8::Int32>(entry.timestamp));
            Nan::Set(entryObj, Nan::New("duration").ToLocalChecked(), New<v8::Int32>(entry.duration));
            Nan::Set(entryObj, Nan::New("description").ToLocalChecked(), New<v8::String>(entry.description.toStdString()).ToLocalChecked());
            Nan::Set(entryObj, Nan::New("website").ToLocalChecked(), New<v8::String>(entry.website.toStdString()).ToLocalChecked());

            int mediaCount = entry.media.length();
            v8::Local<v8::Array> mediaArray = Nan::New<v8::Array>(mediaCount);
            for (int j = 0; j < mediaCount; j++) {
                IMedia media = entry.media.at(j);
                IMedia* mediaPtr = &media;

                Local<Object> mediaObj = Nan::New<Object>();
                Nan::Set(mediaObj, Nan::New("url").ToLocalChecked(), New<v8::String>(media.url.toStdString()).ToLocalChecked());
                Nan::Set(mediaObj, Nan::New("size").ToLocalChecked(), New<v8::Int32>(media.size));


                Video* video = NULL;
                Audio* audio = NULL;

                switch (media.type) {
                case MediaType::Video:
                    video = dynamic_cast<Video*>(mediaPtr);
                    Nan::Set(mediaObj, Nan::New("quality").ToLocalChecked(), New<v8::Int32>(static_cast<int>(video->quality)));
                    break;

                case MediaType::Audio:
                    audio = dynamic_cast<Audio*>(mediaPtr);
                    Nan::Set(mediaObj, Nan::New("quality").ToLocalChecked(), New<v8::Int32>(static_cast<int>(audio->quality)));
                    break;

                    break;

                case MediaType::Subtitle:
                    //no additional fields
                    break;
                }

                Nan::Set(mediaArray, j, mediaObj);
            }
            Nan::Set(entryObj, Nan::New("videos").ToLocalChecked(), mediaArray);

            Nan::Set(v8Batch, i, entryObj);
        }

        return v8Batch;
    }

    void Execute()
    {
        int argc = 0;
        char* argv;

        QCoreApplication app(argc, &argv);

        QTimer::singleShot(0, [&]() {
            ConcurrentQueue<Entry> entryQueue;
            FilmlisteParser parser;
            parser.parseFile(file, splitPattern, &entryQueue); //async? ja geht dann direkt zum näcghsten

            bool isLast = false;
            while (!isLast) {
                QList<Entry> batch;

                while (!isLast && batch.length() < this->batchSize) {
                    Entry entry;
                    bool success = entryQueue.dequeue(entry, isLast);

                    if (!success) {
                        Sleeper::msleep(1);
                        continue;
                    }

                    batch.append(entry);
                }

                batchQueue.enqueue(batch, isLast);

                uv_async_send(async); //Queue async callback to be called
            }

            app.quit();
        });

        app.exec();
    }
};

NAN_METHOD(ParseFilmliste)
{
    Utf8String arg0(info[0]);
    Utf8String arg1(info[1]);

    quint32 batchSize = info[2]->Uint32Value();

    Callback* progressCallback = new Callback(info[3].As<v8::Function>());
    Callback* endCallback = new Callback(info[4].As<v8::Function>());

    QString file = QString::fromUtf8(*arg0, arg0.length());
    QString splitPattern = QString::fromUtf8(*arg1, arg1.length());

    new NativeFilmlisteParser(progressCallback, endCallback, file, splitPattern, batchSize);
}

NAN_MODULE_INIT(Init)
{
    Nan::Set(target, New<v8::String>("parseFilmliste").ToLocalChecked(), New<v8::FunctionTemplate>(ParseFilmliste)->GetFunction());
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
