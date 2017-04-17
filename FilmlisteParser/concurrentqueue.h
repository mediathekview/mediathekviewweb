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

    inline bool enqueue(T item, bool isLast = false) {
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

    inline bool dequeue(T &item, bool &isLast) {
        bool success = false;

        mutex.lock();

        if (!queue.isEmpty()) {
            item = queue.dequeue();
            success = true;
            isLast = closed && queue.isEmpty();
        } else {
            isLast = closed;
        }

        mutex.unlock();

        return success;
    }

    inline bool dequeue(T &item, bool &isLast, bool &isClosed) {
        bool success = false;

        mutex.lock();

        if (!queue.isEmpty()) {
            item = queue.dequeue();
            success = true;
            isLast = closed && queue.isEmpty();
        } else {
            isLast = closed;
        }

        isClosed = closed;

        mutex.unlock();

        return success;
    }

    inline bool isOpen() {
        bool isOpen;

        mutex.lock();
        isOpen = !closed;
        mutex.unlock();

        return isOpen;
    }

    inline int length() {
        mutex.lock();
        int length = queue.length();
        mutex.unlock();

        return length;
    }

    inline bool isEmpty() {
        mutex.lock();
        bool isEmpty = queue.isEmpty();
        mutex.unlock();

        return isEmpty;
    }

    inline bool isFinished() {
        mutex.lock();
        bool isFinished = closed && queue.isEmpty();
        mutex.unlock();

        return isFinished;
    }
};

#endif // CONCURRENTQUEUE_H
