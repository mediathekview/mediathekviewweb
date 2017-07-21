"use strict";
exports.__esModule = true;
var Query = (function () {
    function Query() {
        this._matches = [];
        this._sorts = [];
        this._skip = null;
        this._limit = null;
    }
    Query.prototype.match = function (occurrence, match) {
        this._matches.push({ occurrence: occurrence, match: match });
        return this;
    };
    Query.prototype.index = function (index) {
        this._index = index;
        return this;
    };
    Query.prototype.type = function (type) {
        this._type = type;
        return this;
    };
    Query.prototype.sort = function (field, order, mode) {
        if (order === void 0) { order = SortOrder.Ascending; }
        if (mode === void 0) { mode = null; }
        this._sorts.push({ field: field, order: order, mode: mode });
        return this;
    };
    Query.prototype.skip = function (count) {
        this._skip = count;
        return this;
    };
    Query.prototype.limit = function (count) {
        this._limit = count;
        return this;
    };
    Query.prototype.getSerializedObj = function () {
        var serializedObj = { matches: [], sorts: this._sorts, index: this._index, type: this._type, skip: this._skip, limit: this._limit };
        serializedObj.matches = this._matches.map(function (match) {
            return { occurrence: match.occurrence, serializedMatch: match.match.getSerializedObj() };
        });
        return serializedObj;
    };
    Query.prototype.deserialize = function (obj) {
        this._matches = obj.matches.map(function (serializedMatch) {
            var matchObj = { occurrence: serializedMatch.occurrence, match: null };
            var match;
            if ('all' in serializedMatch.serializedMatch) {
                match = new AllMatch();
            }
            else if ('multi' in serializedMatch.serializedMatch) {
                match = new MultiMatch();
            }
            else if ('range' in serializedMatch.serializedMatch) {
                match = new RangeMatch();
            }
            else {
                throw new Error('type of match not supported: ' + serializedMatch);
            }
            match.deserialize(serializedMatch.serializedMatch);
            matchObj.match = match;
            return matchObj;
        });
        this._index = obj.index;
        this._type = obj.type;
        this._sorts = obj.sorts;
        this._skip = obj.skip;
        this._limit = obj.limit;
        return this;
    };
    Query.prototype.buildQuery = function () {
        var queryObj = {
            index: this._index,
            type: this._type,
            from: this._skip,
            size: this._limit,
            body: {
                query: {
                    bool: {
                        must: [],
                        filter: [],
                        must_not: [],
                        should: []
                    }
                }
            }
        };
        if (this._skip == null) {
            delete queryObj['from'];
        }
        if (this._limit == null) {
            delete queryObj['size'];
        }
        if (this.sort.length > 0) {
            queryObj['sort'] = [];
            this._sorts.forEach(function (sort) {
                var sortEntry = {};
                sortEntry[sort.field] = { order: (sort.order == SortOrder.Ascending) ? 'asc' : 'desc', ignore_unmapped: true };
                if (sort.mode != null) {
                    var mode = void 0;
                    switch (sort.mode) {
                        case SortMode.Min:
                            mode = 'min';
                            break;
                        case SortMode.Max:
                            mode = 'max';
                            break;
                        case SortMode.Sum:
                            mode = 'sum';
                            break;
                        case SortMode.Average:
                            mode = 'avg';
                            break;
                        case SortMode.Median:
                            mode = 'median';
                            break;
                    }
                    sortEntry[sort.field]['mode'] = mode;
                }
                queryObj['sort'].push(sortEntry);
            });
        }
        this._matches.forEach(function (match) {
            switch (match.occurrence) {
                case Occurrence.Must:
                    queryObj.body.query.bool.must.push(match.match.buildQuery());
                    break;
                case Occurrence.Should:
                    queryObj.body.query.bool.should.push(match.match.buildQuery());
                    break;
                case Occurrence.MustNot:
                    queryObj.body.query.bool.must_not.push(match.match.buildQuery());
                    break;
                case Occurrence.Filter:
                    queryObj.body.query.bool.filter.push(match.match.buildQuery());
                    break;
            }
        });
        for (var key in queryObj.body.query.bool) {
            if (Array.isArray(queryObj.body.query.bool[key]) && queryObj.body.query.bool[key].length == 0) {
                delete queryObj.body.query.bool[key];
            }
        }
        return queryObj;
    };
    return Query;
}());
exports.Query = Query;
var AllMatch = (function () {
    function AllMatch() {
    }
    AllMatch.prototype.getSerializedObj = function () {
        return { all: {} };
    };
    AllMatch.prototype.canDeserialize = function (obj) {
        return !!obj.hasOwnProperty('all');
    };
    AllMatch.prototype.deserialize = function (obj) {
        return this;
    };
    AllMatch.prototype.buildQuery = function () {
        return { match_all: {} };
    };
    return AllMatch;
}());
exports.AllMatch = AllMatch;
var MultiMatch = (function () {
    function MultiMatch(query, fields, options) {
        this.query = query;
        this.fields = fields;
        this.options = options;
    }
    MultiMatch.prototype.getSerializedObj = function () {
        return { multi: { query: this.query, fields: this.fields, options: this.options } };
    };
    MultiMatch.prototype.canDeserialize = function (obj) {
        return !!obj.hasOwnProperty('multi');
    };
    MultiMatch.prototype.deserialize = function (obj) {
        this.query = obj.multi.query;
        this.fields = obj.multi.fields;
        this.options = obj.multi.options;
        return this;
    };
    MultiMatch.prototype.buildQuery = function () {
        var queryObj = {
            multi_match: {
                query: this.query,
                type: "cross_fields",
                fields: this.fields,
                operator: (this.options && this.options.operator == Operator.Or) ? 'or' : 'and'
            }
        };
        if (!this.options) {
            return queryObj;
        }
        if (this.options.fuzzy) {
            queryObj.multi_match['fuzziness'] = 'auto';
        }
        if (this.options.minimumShouldMatch && this.options.minimumShouldMatchPercentage) {
            queryObj.multi_match['minimum_should_match'] = this.options.minimumShouldMatch.toString() + '<' + this.options.minimumShouldMatchPercentage.toString() + '%';
        }
        else if (this.options.minimumShouldMatch) {
            queryObj.multi_match['minimum_should_match'] = this.options.minimumShouldMatch;
        }
        else if (this.options.minimumShouldMatchPercentage) {
            queryObj.multi_match['minimum_should_match'] = this.options.minimumShouldMatchPercentage.toString() + '%';
        }
        return queryObj;
    };
    return MultiMatch;
}());
exports.MultiMatch = MultiMatch;
var RangeMatch = (function () {
    function RangeMatch(field, range) {
        this.field = field;
        this.range = range;
    }
    RangeMatch.prototype.getSerializedObj = function () {
        return { range: { field: this.field, range: this.range } };
    };
    RangeMatch.prototype.canDeserialize = function (obj) {
        return !!obj.hasOwnProperty('multi_match');
    };
    RangeMatch.prototype.deserialize = function (obj) {
        this.field = obj.range.field;
        this.range = obj.range.range;
        return this;
    };
    RangeMatch.prototype.buildQuery = function () {
        var queryObj = { range: {} };
        queryObj.range[this.field] = {};
        for (var key in this.range) {
            queryObj.range[this.field][key] = this.range[key];
        }
        return queryObj;
    };
    return RangeMatch;
}());
exports.RangeMatch = RangeMatch;
var Operator;
(function (Operator) {
    Operator[Operator["And"] = 0] = "And";
    Operator[Operator["Or"] = 1] = "Or";
})(Operator = exports.Operator || (exports.Operator = {}));
var Occurrence;
(function (Occurrence) {
    Occurrence[Occurrence["Must"] = 0] = "Must";
    Occurrence[Occurrence["Should"] = 1] = "Should";
    Occurrence[Occurrence["MustNot"] = 2] = "MustNot";
    Occurrence[Occurrence["Filter"] = 3] = "Filter";
})(Occurrence = exports.Occurrence || (exports.Occurrence = {}));
var SortOrder;
(function (SortOrder) {
    SortOrder[SortOrder["Ascending"] = 0] = "Ascending";
    SortOrder[SortOrder["Descending"] = 1] = "Descending";
})(SortOrder = exports.SortOrder || (exports.SortOrder = {}));
var SortMode;
(function (SortMode) {
    SortMode[SortMode["Min"] = 0] = "Min";
    SortMode[SortMode["Max"] = 1] = "Max";
    SortMode[SortMode["Sum"] = 2] = "Sum";
    SortMode[SortMode["Average"] = 3] = "Average";
    SortMode[SortMode["Median"] = 4] = "Median";
})(SortMode = exports.SortMode || (exports.SortMode = {}));
var Field = (function () {
    function Field() {
    }
    Field.Channel = 'channel';
    Field.Topic = 'topic';
    Field.Title = 'title';
    Field.Timestamp = 'timestamp';
    Field.Duration = 'duration';
    Field.Size = 'size';
    Field.Description = 'description';
    Field.Website = 'website';
    return Field;
}());
exports.Field = Field;
;
