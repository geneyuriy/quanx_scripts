const chavy = init()
const cookieName = 'PTERCLUB'
const KEY_homeurl = 'chavy_home_url_pterclub'
const KEY_homeheader = 'chavy_home_header_pterclub'

const signinfo = {signweb: ''}
let VAL_homeurl = chavy.getdata(KEY_homeurl)
let VAL_homeheader = chavy.getdata(KEY_homeheader)

;(exec = async () => {
  chavy.log(`🔔 ${cookieName} 开始签到`)
  if(!!VAL_homeheader === false) {
    chavy.log(`❌ 请先在浏览器登录获取cookie`)
  } else {
    await signin()
  }
  showmsg()
})()
.catch((e) => chavy.log(`❌ ${cookieName} 签到失败: ${e}`))
.finally(() => chavy.done())

function signin() {
  return new Promise((resolve, reject) => {
    const url = { url: `https://pterclub.com/attendance-ajax.php`, headers: JSON.parse(VAL_homeheader) }
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.headers['Accept-Language'] = 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,zh-TW;q=0.6'
    url.body = VAL_homeurl.split('?')[1]
    chavy.get(url, (error, response, data) => {
      try {
        signinfo.signweb = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `签到结果: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} signapp - 签到失败: ${e}`)
        chavy.log(`❌ ${cookieName} signapp - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}


function showmsg() {
  let subTitle, detail
  if (signinfo.signweb.status === '1') {
    subTitle = signinfo.signweb.message.replace(/<\/?[p|b]>/g, '')
  }
  else {
    subTitle = signinfo.signweb.message
  }
  chavy.msg(cookieName, subTitle, detail)
}

function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body)
    if (isQuanX()) $notify(title, subtitle, body)
  }
  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}