
function newWebsocket(url,moduleName,option){

    var websocket = null;
    //"ws://127.0.0.1:8088/websocket/testname"
    if(!url || !url.startsWith("ws:")){
        return null;
    }

    if('WebSocket' in window){
        websocket = new WebSocket(url);
    }
    let defaultOptions = {
        onMessage:null,
        onOpen:null,
        onClose:null,
        onError:null
    };
    this.currentOption =  $.extend(true, defaultOptions, option);
    this.currentOption.moduleName = moduleName;
    websocket.onopen = function(){
        console.log("连接成功");
        if(this.currentOption.onOpen && this.currentOption.onOpen instanceof Function){
            this.currentOption.onOpen(websocket);
        }
    }

    websocket.onclose = function(){
        console.log("退出连接");
        this.close();
        if(this.currentOption.onClose && this.currentOption.onClose instanceof Function){
            this.currentOption.onClose();
        }
    }

    websocket.onmessage = function (event){
        console.log("收到消息"+event.data);
        if(this.currentOption.onMessage && this.currentOption.onMessage instanceof Function){
            this.currentOption.onMessage(event.data);
        }
    }

    websocket.onerror = function(){
        console.log("连接出错");
        if(this.currentOption.onError && this.currentOption.onError instanceof Function){
            this.currentOption.onError();
        }
    }

    window.onbeforeunload = function () {
        websocket.close();
    }
    this.reconnect = function(){
        if(this.opts.repeatLimit>0 && this.opts.repeatLimit <= this.repeat) return;//limit repeat the number
        if(this.lockReconnect || this.forbidReconnect) return;
        this.lockReconnect = true;
        this.repeat++;//必须在lockReconnect之后，避免进行无效计数
        this.onreconnect();
        //没连接上会一直重连，设置延迟避免请求过多
        setTimeout(() => {
            this.createWebSocket();
            this.lockReconnect = false;
        }, this.opts.reconnectTimeout);
    };
    this.heartCheck = function(){
        this.heartReset();
        this.heartStart();
    };
    this.heartStart = function(){
        if(this.forbidReconnect) return;//不再重连就不再执行心跳
        this.pingTimeoutId = setTimeout(() => {
            //这里发送一个心跳，后端收到后，返回一个心跳消息，
            //onmessage拿到返回的心跳就说明连接正常
            this.ws.send(this.opts.pingMsg);
            //如果超过一定时间还没重置，说明后端主动断开了
            this.pongTimeoutId = setTimeout(() => {
                //如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                this.ws.close();
            }, this.opts.pongTimeout);
        }, this.opts.pingTimeout);
    };
    this.heartReset = function(){
        clearTimeout(this.pingTimeoutId);
        clearTimeout(this.pongTimeoutId);
    };
    this.close = function(){
        //如果手动关闭连接，不再重连
        this.forbidReconnect = true;
        this.heartReset();
    };
    return websocket;

}

