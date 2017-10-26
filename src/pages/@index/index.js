import './index.less';

// import {Router} from 'utils/router'
// console.log(Router);
var Router = new JQSPA.Router({
    mode: 'history', 
    // componentRoot: 'demo',
    // pathRoot: 'demo', // 会自动补全前后 /
});

Router
    .routes([
        {path: 'demo/index1', component: 'demo/index1.html'},
        {
            path: 'demo/index2', 
            title: '页面2',
            component: 'demo/index2.html', 
            loaded: function() {
                console.log('page2-----loaded');
                console.log(Router.getQueryStr());
            },
            unload: function() {
                console.log('unload');
            }
        },
        {
            path: /demo\/index3\/(.*)/, 
            title: '页面33333',
            component: 'demo/index3.html', 
            loaded: function() { 
                console.log('page3---', arguments);
                console.log(Router.getQueryStr());
            }
        }
    ])

    .start('#js_router_view', '#wrapper')

    /*.beforeJumpTo(function(config) {
        var path = config.path;

        // 如果是page2页面，离开时不能跳转
        if (path && path.indexOf('page2') > -1) {
            // alert('哈哈哈');
            // return false;
        }
    })*/

setTimeout(function() {
    // Router.jumpTo('http://www.baidu.com')
}, 2000)