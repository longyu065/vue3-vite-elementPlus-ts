export class WebOption {
  /**
   *
   * @type {string}
   */
  url:string = '';
  /**
   *
   * @type {number}
   */
  pingTimeout:number = 15000;
  /**
   *
   * @type {number}
   */
  pongTimeout:number = 10000;
  /**
   *
   * @type {number}
   */
  reconnectTimeout:number = 2000;
  /**
   *
   * @type {string}
   */
  pingMsg:string = 'heartbeat';
  /**
   * 重连的次数
   * @type {number}
   */
  repeatLimit:number = 5;
  onclose: () => void = () => {};
  onerror: () => void = () => {};
  onopen: () => void = () => {};
  onmessage: (event:MessageEvent) => void = (event:MessageEvent) => {};
  onreconnect: () => void = () => {};
}
/**
 * `WebsocketHeartbeatJs` constructor.
 *
 * @param {Object} opts
 * {
 *  url                  websocket链接地址
 *  pingTimeout 未收到消息多少秒之后发送ping请求，默认15000毫秒
    pongTimeout  发送ping之后，未收到消息超时时间，默认10000毫秒
    reconnectTimeout
    pingMsg
 * }
 * @api public
 */
export class  WebsocketHeartbeatJs{
  private opts: WebOption = new WebOption();
  private ws: WebSocket|null = null;
  private repeat: number = 0;
  private lockReconnect: Boolean = true;
  private forbidReconnect: Boolean = true;
  private pingTimeoutId: NodeJS.Timeout;
  private pongTimeoutId: NodeJS.Timeout;
  constructor(webOption:WebOption) {
    this.initBaseVar(webOption);
  }

  initBaseVar(webOption:WebOption) {
    this.opts = webOption;
    //override hook function
    this.createWebSocket();
  }
  createWebSocket (){
    try {
      this.ws = new WebSocket(this.opts.url);
      this.initEventHandle();
    } catch (e) {
      this.reconnect();
      throw e;
    }
  };

  initEventHandle (){
    // @ts-ignore
    this.ws.onclose = () => {
      this.opts.onclose();
    };
    // @ts-ignore
    this.ws.onerror = () => {
      this.opts.onerror();
      this.reconnect();
    };
    // @ts-ignore
    this.ws.onopen = () => {
      this.repeat = 0;
      this.opts.onopen();
      //心跳检测重置
      this.heartCheck();
    };
    // @ts-ignore
    this.ws.onmessage = (event:MessageEvent) => {
      this.opts.onmessage(event);
      //如果获取到消息，心跳检测重置
      //拿到任何消息都说明当前连接是正常的
      this.heartCheck();
    };
  };

  reconnect (){
    if(this.opts.repeatLimit>0 && this.opts.repeatLimit <= this.repeat) return;//limit repeat the number
    if(this.lockReconnect || this.forbidReconnect) return;
    this.lockReconnect = true;
    this.repeat++;//必须在lockReconnect之后，避免进行无效计数
    this.opts.onreconnect();
    //没连接上会一直重连，设置延迟避免请求过多
    setTimeout(() => {
      this.createWebSocket();
      this.lockReconnect = false;
    }, this.opts.reconnectTimeout);
  };
  send(msg: string | ArrayBufferLike | Blob | ArrayBufferView){
    // @ts-ignore
    this.ws.send(msg);
  };
//心跳检测
  heartCheck (){
    this.heartReset();
    this.heartStart();
  };
  heartStart (){
    if(this.forbidReconnect) return;//不再重连就不再执行心跳
    this.pingTimeoutId = setTimeout(() => {
      //这里发送一个心跳，后端收到后，返回一个心跳消息，
      //onmessage拿到返回的心跳就说明连接正常
      // @ts-ignore
      this.ws.send(this.opts.pingMsg);
      //如果超过一定时间还没重置，说明后端主动断开了
      this.pongTimeoutId = setTimeout(() => {
        //如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
        // @ts-ignore
        this.ws.close();
      }, this.opts.pongTimeout);
    }, this.opts.pingTimeout);
  };
  heartReset (){
    clearTimeout(this.pingTimeoutId);
    clearTimeout(this.pongTimeoutId);
  };
  close (){
    //如果手动关闭连接，不再重连
    this.forbidReconnect = true;
    this.heartReset();
    // @ts-ignore
    this.ws.close();
  };
}


