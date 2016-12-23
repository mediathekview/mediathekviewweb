var pg = require('pg');
var pgPool;

var initialized = false;

function init(config) {
    if (initialized) {
        return false;
    }

    pgPool = new pg.Pool(config);
    pgPool.on('error', function(err, client) {
        console.error(err);
    });

    initialized = true;

    return true;
}


function createQueriesTable(callback) {
    let queryString = `CREATE TABLE IF NOT EXISTS queries (
  _id serial NOT NULL,
  query text NOT NULL,
  duration real NOT NULL,
  timestamp integer NOT NULL
);`

    sqlQuery(queryString, [], callback);
}

function dropQueriesTable(callback) {
    let queryString = 'DROP TABLE queries';

    sqlQuery(queryString, [], callback);
}

function addQueryRow(query, duration, timestamp = Math.floor(Date.now() / 1000), callback) {
    let queryString = 'INSERT INTO queries (query, duration, timestamp) VALUES ($1, $2, $3)';

    sqlQuery(queryString, [query, duration, timestamp], callback);
}

function sqlQuery(query, param, callback) {
    pgPool.connect(function(err, client, done) {
        if (err) {
            console.error('error fetching client from pool', err);

            if (isFunction(callback)) {
                callback(null, err);
            }

            return;
        }

        client.query(query, param, function(err, result) {
            done(); //release the client back to the pool

            if (err) {
                console.error(err);
                if (isFunction(callback)) {
                    callback(null, err);
                }
            } else {
                if (isFunction(callback)) {
                    callback(result, null);
                }
            }
        });
    });
}

function isFunction(possibleFunction) {
    return typeof(possibleFunction) === typeof(Function);
}

module.exports = {
    init: init,
    createQueriesTable: createQueriesTable,
    addQueryRow: addQueryRow
};
