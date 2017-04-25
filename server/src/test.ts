let i = 0;
let begin;

function loop() {
  setTimeout(() => loop(), -1);

  if(++i == 1000) {
    console.log((Date.now() - begin) / 1000);
  }
}

begin = Date.now();
loop();
