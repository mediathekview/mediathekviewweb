#include "filmlisteparser.h"

#include <nan.h>
#include <QString>
#include <QEventLoop>
#include <QObject>

using namespace v8;

void parseFilmliste(const FunctionCallbackInfo<Value>& info) {

    Nan::Utf8String arg0(info[0]);

    QString filename = QString::fromUtf8(*arg0, arg0.length());


    Nan::Callback *callback = new  Nan::Callback(info[1].As<v8::Function>());



    FilmlisteParser parser;

    QObject::connect(parser, batchReady(TypVomBatch), this,[](TypVomBatch batch) {



        //batch to v8 jsonarray

        v8::Local<v8::Value> argv[] = {
            Nan::New<v8::String>(filename.to).ToLocalChecked()
        };

        callback->Call(sizeof(argv)/sizeof(v8::Local<v8::Value>), argv);




    });







    QEventLoop ev;

    QObject::connect(filmlisteparser, finished, ev, quit);

    parser.spawnThreads(); //muss sofort returnen

    ev.exec();










}
/*
void IsPalindrome(const FunctionCallbackInfo<Value>& info) {
    Nan::Utf8String arg0(info[0]);
    char *str = *arg0;
    size_t len = arg0.length();
    int half = len / 2;
    int start = 0;
    int end = len - 1;
    int space = 32;
    int comma = 44;
    bool isPal = true;
    bool startSpace;
    bool endSpace;

    while (half > 0 && isPal) {
        startSpace = str[start] == space || str[start] == comma;
        endSpace = str[end] == space || str[end] == comma;

        if (str[start] == str[end]) {
            start++;
            end--;
        } else if (startSpace || endSpace) {
            startSpace && start++;
            endSpace && end--;
        } else {
            isPal = false;
        }

        half--;
    }

    info.GetReturnValue().Set(isPal);
}*/

void Init(Local<Object> exports, Local<Object> module) {
    NODE_SET_METHOD(module, "exports", parseFilmliste);
}

NODE_MODULE(addon, Init)
