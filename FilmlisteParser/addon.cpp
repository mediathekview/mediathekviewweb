#include "filmlisteparser.h"

#include <nan.h>
#include <QString>
#include <QEventLoop>
#include <QObject>

using namespace v8;

void parseFilmliste(const FunctionCallbackInfo<Value>& info) {

    Nan::Utf8String arg0(info[0]);

    QString filename = "You passed: " + QString::fromUtf8(*arg0, arg0.length());


    Nan::Callback *callback = new  Nan::Callback(info[1].As<v8::Function>());


    FilmlisteParser parser;

   // QObject::connect(parser, batchReady(TypVomBatch), this,[](TypVomBatch batch) {

        //batch to v8 jsonarray

        v8::Local<v8::Value> argv[] = {
            Nan::New<v8::String>(filename.toStdString()).ToLocalChecked()
        };

        callback->Call(sizeof(argv)/sizeof(v8::Local<v8::Value>), argv);
        callback->Call(sizeof(argv)/sizeof(v8::Local<v8::Value>), argv);




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
