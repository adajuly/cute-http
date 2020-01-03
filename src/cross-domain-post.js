/**
* CrossDomainPost 跨域 post请求
* 原理：http://www.alloyteam.com/2012/08/lightweight-solution-for-an-iframe-cross-domain-communication/  
*   
* 使用方法
* --CODE: 
        const params = {
            data: { of: 'jsonjs', 'Filedata': files[0] },
            url,
            domain: 'webdev.com',
            postMessage: true,
            timeout: 300000
        };

        CrossDomainPost.send(params);
* @langversion es6
* @tiptext
*
*/

/**
 * 降级为es5写法，方便不经过babel编译，直接可以发布
 */

module.exports = {
  send(params) {
    const post = new Post();
    post.send(params);
  },
  createFileForm() {
    const form = createForm();
    form.enctype = 'multipart/form-data';

    const input = createElement(`<input class="ifp-file" type="file" accept="image/*;"/>`);
    form.appendChild(input);
    return form;
  }
}


function Post(){

  this.form = null;
  this.params = null;
  this.iframe = null;
  this.iframeId = null;
  this.id = 0;

  this.send = function(params) {
    this.initParams(params);
    this.addPostMessage(params);
    this.addWindowCallback();
    this.addIframe();
    this.addForm();

    setTimeout(() => {
      this.params.error && this.params.error();
      this.destory();
    }, this.params.timeout);
  }

  // 初始化 params
  this.initParams = function (params) {
    this.params = params || this.params;
    this.params.domain = params.domain || "qq.com";
    this.params.enctype = params.enctype || "";
    this.params.removeIframe = params.removeIframe === undefined ? true : params.removeIframe;
    this.params.removeDom = params.removeDom === undefined ? true : params.removeDom;
    this.params.timeout = params.timeout || TIMEOUT;

    this.params.callbackName = params.callbackName || `ifp_callback_${randomNum()}`;
    this.params.callbackErrorName = params.callbackErrorName || `ifp_err_callback_${randomNum()}`;

    this.params.data = params.data || {};
    this.params.data.format = 'script';

    if (this.params.form) {
      this.params.removeDom = false;
    }
  }

  // 添加 PostMessage
  this.addPostMessage = function(params) {
    if (this.params.postMessage) {
      this.params.data.callback = `(function(val){window.onload=function(){window.parent.postMessage(val,'*')}})`;
      window.addEventListener('message', this.messageHandler, false);
    } else {
      this.params.data.callback = `parent.${this.params.callbackName}`;
    }
  }

  this.messageHandler = function(e){
    this.params.success && this.params.success(e.data);
    this.destory();
  }

  // 添加 window 回调
  this.addWindowCallback = function() {
    window[this.params.callbackName] = function (data) {
      this.params.success && this.params.success(data);
      this.destory();
    };

    window[this.params.callbackErrorName] = function (data) {
      this.params.error && this.params.error(data);
      this.destory();
    };
  }

  //添加iframe
  this.addIframe = function() {
    this.iframeId = `ifp_target_iframe_${randomNum()}`;
    this.iframe = createElement(`<iframe id="${this.iframeId}" name="${this.iframeId}"></iframe>`);
    this.iframe.style.display = "none";

    document.body.appendChild(this.iframe);
    insertScript(getIframeDoc(this.iframe), `try{ document.domain="${this.params.domain}"; }catch(e){}`);
  }

  //添加Form
  this.addForm = function() {
    this.form = this.params.form ? this.params.form : createForm();
    this.form.target = this.iframeId;
    this.form.action = this.params.url;
    if (this.params.enctype) this.form.enctype = `enctype="${this.params.enctype}"`;

    for (let key in this.params.data) {
      let input = createElement(`<input name="${key}" type="hidden" value="" />`);
      input['value'] = this.params.data[key];
      this.form.appendChild(input);
    }

    this.form.submit();
  }

  // delete callback
  this.destory = function() {
    try {
      delete window[this.params.callbackName];
      delete window[this.params.callbackErrorName];

      clearTimeout(this.id);
      if (this.params.removeIframe && this.iframe.parentNode) {
        this.iframe.parentNode.removeChild(this.iframe);
      }

      if (this.params.removeDom) {
        empty(this.form);
        this.iframe.parentNode && this.iframe.parentNode.removeChild(this.iframe);
        this.form.parentNode && this.form.parentNode.removeChild(this.form);
      }

      window.removeEventListener('message', this.messageHandler, false);
    } catch (e) { }
  }

  this.send = this.send.bind(this);
  this.initParams = this.initParams.bind(this);
  this.addPostMessage = this.addPostMessage.bind(this);
  this.messageHandler = this.messageHandler.bind(this);
  this.addWindowCallback = this.addWindowCallback.bind(this);
  this.addIframe = this.addIframe.bind(this);
  this.addForm = this.addForm.bind(this);
  this.destory = this.destory.bind(this);
}

//////////////////////////////////////////////////////////////////////
//
//      创建dom
//
//////////////////////////////////////////////////////////////////////
function createElement(node) {
  const div = document.createElement('div');
  div.innerHTML = node;
  return div.firstChild;
}

//////////////////////////////////////////////////////////////////////
//
//      创建form
//
//////////////////////////////////////////////////////////////////////
function createForm() {
  const id = `ifp_form_${randomNum()}`;
  const form = createElement(`<form method="post" id="${id}"></form>`);
  form.style.display = "none";
  document.body.appendChild(form);

  return form;
}

//////////////////////////////////////////////////////////////////////
//
//      插入script标签
//
//////////////////////////////////////////////////////////////////////
function insertScript(doc, text) {
  const head = doc.getElementsByTagName("head")[0] || doc.documentElement;
  const script = doc.createElement("script");
  script.type = "text/javascript";

  try {
    script.appendChild(doc.createTextNode(text));
  } catch (e) {
    script.text = text;
  }

  head.insertBefore(script, head.firstChild);
}

//////////////////////////////////////////////////////////////////////
//
//      获取iframe document
//
//////////////////////////////////////////////////////////////////////
function getIframeDoc(iframe) {
  return iframe.contentWindow.document || iframe.contentDocument;
}

//////////////////////////////////////////////////////////////////////
//
//      清空
//
//////////////////////////////////////////////////////////////////////
function empty(ele) {
  ele.innerHTML = '';
  return ele;
}

function randomNum() {
  return Math.floor(Math.random() * Math.pow(10, 8));
}