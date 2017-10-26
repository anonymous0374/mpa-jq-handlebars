import './index.less';
import 'utils/a.js';

alert('demo/index');

let set = new Set([1,2,3]);

let aa = [1,2,3,4]

let b = [6, ...aa]

let obj = {
    a: 'qa'
    // a: 'asas' 
}

var aaa = 'aaaa'
console.log(aaa, obj);

// alert('aaaa')
console.log('bbbbb');

console.log(b);
console.log('name1112311111123323', set);

setTimeout(() => {
    console.log(jQuery);

    $.ajax({
        url: '/tmsMI/a',
        complete: function() {
            console.log('complete');
        }
    })
}, 3000)