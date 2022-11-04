const fs = require('fs')
const path = require('path')
const https = require('https');

const filePath = 'C:/Windows/System32/drivers/etc/HOSTS' //hosts路径
// const filePath = './HOSTS'
let hosts = fs.readFileSync(filePath, 'utf-8')

const config = [
  'github.com',
  'www.github.com',
  'codeload.github.com',
  'github.global.ssl.fastly.net',
  'gits.github.com'
]

// 更新github的ip
const changeIp = async (host) => {
  let a
  try { a = await getHostIp(host) } catch (err) { return err }

  let data = hosts.split('\n')
  for (let i = 0; i < data.length; i++) {
    if (data[i].includes(host)) {
      data[i] = `${a} ${host}`

      break
    }
  }

  console.log(`域名： ${host}  更新为  ${a}`)
  return data.join('\n')
}

// 新建github的ip
const newIp = async (host) => {
  let a
  try { a = await getHostIp(host) } catch (err) { return err }

  let data = hosts.split('\n')

  data.push(`${a} ${host}`)

  console.log(`域名： ${host}  更新为  ${a}`)
  return data.join('\n')
}





const getHostIp = (url) => {
  return new Promise((resolve, reject) => {
    https.get(`https://myssl.com/api/v1/tools/dns_query?qtype=1&host=${url}&qmode=-1`, function (res) {
      var html = ''
      res.on('data', function (data) {
        html += data
      })
      res.on('end', function () {
        const obj = JSON.parse(html)
        const keys = Object.keys(obj.data)

        let time = [114514, 114514]  // [最低时间，最低时间的ip]
        for (let i = 0; i < keys.length; i++) {
          const now = obj.data[keys[i]][0]


          if (now.error) { continue }

          const consumeTime = Number(now.answer.time_consume)



          if (time[0] > consumeTime) {
            time[0] = consumeTime
            time[1] = now.answer.records[0].value
          }
        }
        if (time[1] == 114514) { return reject('查询失败') }
        resolve(time[1])
      })
    }).on('error', function (err) {
      return reject('查询接口失效')
    })
  })
}

const start = () => {
  config.forEach(async element => {

    if (hosts.includes(element)) {
      const hostCache = await changeIp(element)

      if (hostCache !== ' [403] www.ipaddress.com' && hostCache !== '未知错误') {
        hosts = hostCache
      } else { console.log(`域名： ${element}  更新失败  ---> ${hostCache}`) }

    } else {
      const hostCache = await newIp(element)

      if (hostCache !== ' [403] www.ipaddress.com' && hostCache !== '未知错误') {
        hosts = hostCache
      } else { console.log(`域名： ${element}  更新失败  ---> ${hostCache}`) }
    }

    fs.writeFileSync(filePath, hosts)
  })

}

start()