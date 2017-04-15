#include "filmlisteparser.h"
#include "concurrentqueue.h"
#include "model.h"

#include <nan.h>
#include <QString>
#include <QEventLoop>
#include <QObject>

using namespace v8;
using namespace Nan;


class NativeFilmlisteParser : public AsyncWorker {
    Callback *callback;

public:
    NativeFilmlisteParser(Callback *callback, int points) : AsyncWorker(callback) {
        this->callback = callback;
    }



    ~NativeFilmlisteParser() {}
};


void parseFilmliste(const v8::FunctionCallbackInfo<Value>& info) {
    Utf8String arg0(info[0]);
    Utf8String arg1(info[1]);
    Callback *callback = new Callback(info[2].As<Function>());

    QString filename = QString::fromUtf8(*arg0, arg0.length());
    QString splitPattern = QString::fromUtf8(*arg1, arg1.length());





    ConcurrentQueue<Entry> entryQueue;

    FilmlisteParser parser;
    parser.parseFile(filename, splitPattern, &entryQueue);


    // QObject::connect(parser, batchReady(TypVomBatch), this,[](TypVomBatch batch) {

    //batch to v8 jsonarray

    Local<Value> argv[] = {
        New<String>(filename.toStdString()).ToLocalChecked()
    };

    callback->Call(sizeof(argv)/sizeof(Local<Value>), argv);
    callback->Call(sizeof(argv)/sizeof(Local<Value>), argv);




    //});







    /*QEventLoop ev;

   QObject::connect(filmlisteparser, finished, ev, quit);

   parser.spawnThreads(); //muss sofort returnen

   ev.exec();*/

}



void Init(Local<Object> exports, Local<Object> module) {
    NODE_SET_METHOD(module, "exports", parseFilmliste);
}

NODE_MODULE(addon, Init)
