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
    volatile bool closed = false;

public:
    explicit ConcurrentQueue() {}

    bool enqueue(T item, bool isLast = false) {
        bool success = false;

        mutex.lock();

        if (!closed) {
            queue.enqueue(item);
            success = true;
        }

        if (isLast) {
            closed = true;
        }

        mutex.unlock();

        return success;
    }

    bool dequeue(T &item, bool &isLast) {
        bool success = false;

        mutex.lock();

        if (!queue.isEmpty()) {
            item = queue.dequeue();
            success = true;
            isLast = closed && queue.isEmpty();
        }

        mutex.unlock();

        return success;
    }

    bool isOpen() {
        bool isOpen;

        mutex.lock();
        isOpen = !closed;
        mutex.unlock();

        return isOpen;
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
