import * as Mapper from './mapper';

let intMapper = new Mapper.IntMapper({ source: '', maxDigits: 8 });

let result:any = intMapper.map(50);
console.log(result, result == '00000050')


result = intMapper.reverse('00000050');
console.log(result, result == 50);
