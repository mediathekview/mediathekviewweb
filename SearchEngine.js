class SearchEngine {
    constructor() {
        this.counter = 0;
        this.indexData = {};
        this.searchindex = new Map();
    }

    add(ident, data) {
        let c = this.counter++;
        this.indexData[c] = data;

        var splits = ident.trim().toLowerCase().split(' ');
        //console.log(splits);

        for (let i in splits) {
            let split = splits[i];

            for (let begin = 0; begin <= split.length - 4; begin++) {
                for (let end = begin + 4; end <= split.length; end++) {

                    let key = split.slice(begin, end);

                    if (!this.searchindex.has(key)) {
                        this.searchindex.set(key, new Set());
                    }

                    this.searchindex.get(key).add(c);
                }
            }
        }

        if(c % 1000 == 0) console.log('indexed ' + c + ' entries, containing ' + this.searchindex.size + ' mapkeys');
    }

    search(query) {
        var splits = query.trim().toLowerCase().split(' ');

        var totalMatches = [];

        for (let i in splits) {
            let split = splits[i];

            let matches = this.searchindex.get(split);
            if (matches == undefined){
              continue;
            }

            for (var dataIndex of matches) {

                if (totalMatches[dataIndex] == undefined) {
                    totalMatches[dataIndex] = 0;
                }

                totalMatches[dataIndex]++;
            }
        }

        var result = [];

        for (var i in totalMatches) {
            result.push({
                data: this.indexData[i],
                relevance: totalMatches[i]
            });
        }

        return result;
    }
}

module.exports = SearchEngine;
