import $ from 'jquery';

var DOT_RE = /\/\.\//g;
var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;

export function Router(config) {
    if (this instanceof Router) {
        this._routes = [];
        this._pathRoot = '/'; // url地址前缀
        this._mode = null; // history和hash模式
        this._componentRoot = '/'; // 加载的页面前缀
        this._jsRoot = ''; // js路径前缀，如果该参数不为空，js路径为：jsRoot + 每个配置项中的js，否则为：相对于当前页面的路径查找
        this._jsVersion = ''; // js版本控制，防止JS缓存
        this._isDebug = false; // 是否开发模式，开发模式时，JS版本会实时刷新

        this.config(config);
    } else {
        return new Router(config);
    }
}

Router.prototype = {
    constructor: Router,

    // 一些配置
    config: function(options) {
        options = options || {};
        this._mode = options.mode && options.mode === 'history' && !!(history.pushState) ? 'history' : 'hash';
        this._pathRoot = options.pathRoot ? '/' + this._clearSlashes(options.pathRoot) + '/' : '/';
        this._componentRoot = options.componentRoot ? '/' + this._clearSlashes(options.componentRoot) + '/' : '/';
        this._jsRoot = options.jsRoot ? '/' + this._clearSlashes(options.jsRoot) + '/' : '';
        this._jsVersion = options.jsVersion || '';
        this._isDebug = options.isDebug || false;

        return this;
    },
    // 取得当前路径
    getCurPath: function() {
        var path = '';
        var loc = location;

        if (this._mode === 'history') {
            path = this._clearSlashes(decodeURI(loc.pathname + loc.search));
            // path = path.replace(/\?(.*)$/, '');
            path = this._pathRoot != '/' ? path.replace(this._pathRoot, '') : path;
        } else {
            var match = location.href.match(/#(.*)$/);
            path = match ? (this._pathRoot != '/' ? match[1].replace(this._pathRoot, '') : match[1]) : '';
        }

        return this._clearSlashes(path);
    },
    // 去除路径首尾斜杠
    _clearSlashes: function(path) {
        return path.toString().replace(/\/$/, '').replace(/^\//, '');
    },
    // 获取路由的相关配置
    getPathConfig: function(path) {
        var obj = {};
        var index = this.indexOf(path);

        if (index > -1) {
            obj = this._routes[index];
        }

        return obj;
    },
    // 查找路由位置
    indexOf: function(path) {
        for (var i = 0, r; i < this._routes.length, r = this._routes[i]; i++) {
            if (this.isPathEqual(r.path, path)) {
                return i;
            }
        }

        return -1;
    },
    // 路由是否已经存在
    exist: function(path) {
        if (this.indexOf(path) > -1) return true;

        return false;
    },
    // 添加一个路由
    add: function(args) {
        if (this.exist(args.path)) return;

        this._routes.push({
            path: args.path || '',
            js: args.js || '',
            title: args.title || '',
            component: args.component,
            loaded: args.loaded,
            unload: args.unload
        });

        return this;
    },
    // 移除一个路由
    remove: function(path) {
        var index = this.indexOf(path);

        if (index > -1) {
            this._routes.splice(index, 1);
        }

        return this;
    },
    // 重置
    reset: function() {
        this._routes = [];
        this._mode = null;
        this._componentRoot = '/';
        this._pathRoot = '/';
        this._jsRoot = '';
        this._jsVersion = '';
        this._isDebug = false;

        this._handleBeforeJumpTo = null;

        return this;
    },
    // 2个路径是否表示一致，因为可能加了前缀
    isPathEqual: function(p1, p2) {
        var result = false,
            t1 = typeof p1,
            t2 = typeof p2,
            root = this._pathRoot;

        if (t1 === t2) {
            // 正则
            if (t1 === 'object') {
                result = p1.toString() === p2.toString();
            } else { // 字符串
                p1 = p1.replace(/^\//, '').replace(/\?.*$/, '');
                p2 = p2.replace(/^\//, '').replace(/\?.*$/, '');
                console.log('****',p1,p2);
                result = p1 === p2;
            }
        }

        return result;
    },
    // 加载JS
    _loadScript(url, callback) {
        var script = document.createElement('script');

        script.type = 'text/javascript';
        script.onload = script.onerror = function(evt) {
            script.onload = script.onerror = null;
            script = null;
            callback && callback(evt.type === 'error' ? 'fail:js' : '');
        };
        script.src = url;
        
        this.$container[0].appendChild(script);
    },
    _resolve(path) {
        // /a/b/./c/./d ==> /a/b/c/d
        path = path.replace(DOT_RE, "/");

        // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
        while (path.match(DOUBLE_DOT_RE)) {
            path = path.replace(DOUBLE_DOT_RE, "/");
        }

        return path;
    },
    
    // 只是获取查询参数，这里不做处理，交给外部
    getQueryStr() {
        var path = this.getCurPath();
        return path.split('?')[1] || '';
    },

    // 载入
    load: function(path) {
        path = path || this.getCurPath();

        var self = this;
        var container = this.$container;

        for (var i = 0; i < this._routes.length; i++) {
            var temp = this._routes[i];
            var match = null;

            if (typeof temp.path === 'string') {
                match = self.isPathEqual(path, temp.path) ? [] : null;console.log(path,temp.path, match);
            } else {
                match = path.match(temp.path);
            }

            if (match) {
                // 页面路径
                var componentPath = this._componentRoot
                    + this._clearSlashes(temp.component);
                
                // JS路径
                var jsPath = temp.js,
                    ver = this._jsVersion,
                    isDebug = this._isDebug;

                if (jsPath) {
                    jsPath = this._clearSlashes(jsPath);
                    jsPath = this._jsRoot ? (this._jsRoot + jsPath) :
                        this._resolve(componentPath.replace(/\/[^\/]*$/, '/') + jsPath);
                    
                    ver = isDebug ? + new Date() : ver;
                    jsPath = jsPath + ( ver ? '?v=' + ver : '' );
                }
                
                // 载入后的回调
                var callback = function(type) {
                    type = type || 'success';
                    temp.loaded && temp.loaded.call(self, match, type);
                }

                match.shift();

                $.ajax({
                    url: componentPath,
                    complete: function(xhr, ts) {
                        if (xhr.status === 200) {
                            container.html(xhr.responseText);
                            document.title = temp.title;
                            
                            jsPath ? 
                                self._loadScript(jsPath, callback) : 
                                callback();
                        } else {
                            callback('fail:page');
                        }
                    }
                });

                return this;
            }
        }

        return this;
    },
    // 开始监听
    start: function(selector, wrapperSelector) {
        var self = this;
        var hostname = location.hostname;
        self.$container = $(selector);
        self.$wrapper = $(wrapperSelector);

        // 拦截a元素的链接地址
        self.$wrapper.on('click', 'a', function(e) {
            var target = e.target;
            // 只拦截当前hostname下的页面
            if(target.href && target.hostname === hostname) {
                e.preventDefault();
                self.jumpTo(target.getAttribute('href'));
            }
        });
    
        // 刚载入页面，bind中传入空，是因为事件原本的第一个参数是event对象
        $(window).on('load', self.load.bind(this, ''));
        
        // 监听
        if (this._mode === 'history') {
            $(window).on('popstate', this.load.bind(this, ''));
        } else {
            $(window).on('hashchange', this.load.bind(this, ''));
        }

        return this;
    },
    _isCurHostname: function(path) {
        var a = document.createElement('a');
        a.href = path;
        return a.hostname === location.hostname;
    },
    
    _handleBeforeJumpTo: function() {
        var parent = $('body')[0],
            nodes = [].slice.call(parent.children, 0),
            wrapper = this.$wrapper[0];

        nodes.filter(function(v) {
            return v !== wrapper;
        }).map(function(v) {
            parent.removeChild(v);
        });
    },

    // 跳转之前需要的操作，比如销毁弹出层(因为一般弹出层都是直接挂载在body下面)，还可以整体配置什么情况下不跳转(fn()返回false时)
    beforeJumpTo: function(fn) {
        if (fn) this._handleBeforeJumpTo = fn;
        fn = fn || this._handleBeforeJumpTo;

        var curConfig = this.getPathConfig(this.getCurPath());
        var result = fn && fn.call(this, curConfig);
        // fn未传入 或 fn()执行未返回值，都设置为true
        var mark = result === undefined ? true : result;

        // fn未传入则有个默认操作
        if (fn === undefined && this.$wrapper) {
            this._handleBeforeJumpTo();
        }

        if (curConfig.unload) {
            result = curConfig.unload.call(this, curConfig);
            if (mark) mark = result === undefined ? true : result;
        }

        return mark;
    },

    // 跳转
    jumpTo: function(path) {
        if (!this.beforeJumpTo()) return;

        // 不是当前站点页面
        if(/^http(s)?:\/\//.test(path) && !this._isCurHostname(path)) {
            location.href = path;
            return this;
        }

        path = this._pathRoot + this._clearSlashes(path || '');

        if (this._mode === 'history') {
            history.pushState(null, null, path);
            this.load(path);
        } else {
            location.hash = '#' + path;
        }

        return this;
    },
    // 配置路由
    routes: function(config) {
        this._routes = config;
        return this;
    }
};