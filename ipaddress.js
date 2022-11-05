const fs = require('fs')
const path = require('path')
const https = require('https');

const filePath = 'C:/Windows/System32/drivers/etc/HOSTS' // hosts路径
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
  try { a = await getHostIp(host) } catch (err) {
    return err
  }


  let data = hosts.split('\n')

  data.push(`${a} ${host}`)

  console.log(`域名： ${host}  更新为  ${a}`)
  return data.join('\n')
}

// 匹配元素
const reg = /<ul class="comma-separated">([\s\S]+?)<\/ul>/
const regHost = /<li>([\s\S]+?)<\/li>/



const getHostIp = (url) => {
  return new Promise((resolve, reject) => {
    https.get(`https://www.ipaddress.com/site/${url}`, function (res) {
      var html = ''
      res.on('data', function (data) {
        html += data
      })
      res.on('end', function () {
        if (!html.match(reg)) {
          return reject(' [403] www.ipaddress.com')
        }
        const out = html.match(reg)[1].match(regHost)[1]
        resolve(out)
      })
    }).on('error', function (err) {
      return reject('无法连接至 ipaddress.com')
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

  console.log('\n\n经常更新失败的话，请尝试一下手动更新，或手动进ipaddress.com\n\n')
}

start()
