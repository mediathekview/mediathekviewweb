#ifndef CONCURRENTQUEUE_H
#define CONCURRENTQUEUE_H

#include <QQueue>
#include <QMutex>
#include <QString>

template <typename T>
class ConcurrentQueue
{
    QMutex mutex;
    QQueue<T> queue;

public:
    explicit ConcurrentQueue() {}

    void enqueue(T item) {
        mutex.lock();
        queue.enqueue(item);
        mutex.unlock();
    }

    bool dequeue(T *item) {
        mutex.lock();

        if (!queue.isEmpty()) {
            T item = queue.dequeue();
            mutex.unlock();
            return true;
        } else {
            mutex.unlock();
            return false;
        }
    }

    int length() {
        mutex.lock();
        int length = queue.length();
        mutex.unlock();

        return length;
    }

    bool isEmpty() {
        mutex.lock();
        bool isEmpty = queue.isEmpty();
        mutex.unlock();

        return isEmpty;
    }
};

#endif // CONCURRENTQUEUE_H
