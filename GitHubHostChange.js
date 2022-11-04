const fs = require('fs')
const path = require('path')
const https = require('https');

const filePath = 'C:/Windows/System32/drivers/etc/HOSTS'
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
const changeIp = async(host) => {
  const a = await getHostIp(host)

  let data = hosts.split('\n')
  for (let i = 0; i < data.length; i++) {
    if (data[i].includes(host)) {
      data[i] = `${a} ${host}`

      break
    }
  }

  return data.join('\n')
}

// 新建github的ip
const newIp = async (host) => {
  const a = await getHostIp(host)

  let data = hosts.split('\n')

  data.push(`${a} ${host}`)

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
        console.log(html)
        console.log(html.match(reg)[1])
        const out = html.match(reg)[1].match(regHost)[1]
        resolve(out)
      })
    }).on('error', function (err) {
      reject(err)
    })
  })
}

const start = () => {
  config.forEach(async element => {

    if (hosts.includes(element)) {
      hosts = await changeIp(element)
    } else {
      hosts = await newIp(element)
    }

    fs.writeFileSync(filePath, hosts)
  })
}

start()