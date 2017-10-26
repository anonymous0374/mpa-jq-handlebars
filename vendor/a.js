var a = 'aaaaa';

console.log(this, this === window);

// this.a = a;
// console.log(a);

module.exports = {
    a: 'aaaa',
    aa: function() {
        console.log('aaaaaaaaa');
    }
}