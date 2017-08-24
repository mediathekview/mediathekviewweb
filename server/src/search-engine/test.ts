import { BoolQueryBuilder, RangeQueryBuilder, TextQueryBuilder, TimeQueryValueBuilder, TimeUnit } from './query';

const durationQueryBuilder = new RangeQueryBuilder().field('duration').gte(60).lt(600);
const dateQueryBuilder = new RangeQueryBuilder().field('timestamp').gt(new TimeQueryValueBuilder().time('now', 'hour').plus(5, 'minutes'));
const topicTitleQueryBuilder = new TextQueryBuilder().fields('topic', 'title').text('sturm der liebe');
const channelAQueryBuilder = new TextQueryBuilder().fields('channel').text('ndr');
const channelBQueryBuilder = new TextQueryBuilder().fields('channel').text('ndr');
const channelQueryBuilder = new BoolQueryBuilder().should(channelAQueryBuilder, channelBQueryBuilder);


const boolQueryBuilder = new BoolQueryBuilder().must(dateQueryBuilder, topicTitleQueryBuilder, channelQueryBuilder).filter(durationQueryBuilder);


console.log(JSON.stringify(boolQueryBuilder.build(), null, 2));
