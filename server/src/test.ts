let str = `
<html>
<head><title>Index of /2017/</title></head>
<body bgcolor="white">
<h1>Index of /2017/</h1><hr><pre><a href="../">../</a>
<a href="01/">01/</a>                                                10-Apr-2017 19:48       -
<a href="02/">02/</a>                                                10-Apr-2017 19:49       -
<a href="03/">03/</a>                                                10-Apr-2017 19:50       -
<a href="04/">04/</a>                                                30-Apr-2017 13:50       -
<a href="05/">05/</a>                                                19-May-2017 13:50       -
</pre><hr></body>
</html>
`;


let pattern = /^<a href="(.*?)">(.*?)<\/a>\s*(\S+)\s+(\S+)/gm;

let matches: RegExpExecArray[] = [];

let match: RegExpExecArray;
while ((match = pattern.exec(str)) !== null) {
  matches.push(match);
}

for(let i = 0; i < matches.length; i++) {
  console.log(matches[i]);
    console.log('\n\n\n\n\n');
}
