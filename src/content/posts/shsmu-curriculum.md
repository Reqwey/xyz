---
title: 一张 Cookie 就能获得上交医学院课程表？今天它来了
date: 2025-12-29
summary: 这是介绍一个通过反代技术爬取上海交通大学医学院教务系统内的课程表信息的项目。
category: 项目
tags: [教务, Node.js, 网络爬虫]
---

## 食用介绍

- 你是否为需要反复登录医学院教务系统，只为获取今日课表而苦恼？
- 你是否为身在校外，WebVPN 登录复杂重重而苦恼？

基于此，我开发了这个工具，只需要获取一张网络饼干，就能持久地获取本日/周/月的课表！

### 准备工作

1. 请先确保不处于医学院校园网环境：\
   如果您在校内使用手机，请关闭 Wi-Fi，使用移动数据上网。\
   如果您在宿舍内使用电脑，请断开网线，使用手机热点上网。\
   如果您不在校内，请忽略该步骤。
2. 确保您拥有查看网页 Cookie 的能力：\
   Cookie 是网站识别用户的特别身份证。\
   如果您在使用安卓手机，请下载 [Kiwi Browser](https://pan.sjtu.edu.cn/web/share/34797e27c78a91d9ce1e97b0b75f5d38), 提取码: 1ujz。\
   如果您在使用 iPhone，请下载 [适用于 Safari 的 Web Inspector 扩展](https://apps.apple.com/cn/app/web-inspector/id1584825745) \
   如果您在使用电脑，请确保使用主流浏览器。

### 获取 Cookie

访问 <https://auth2.shsmu.edu.cn/cas/login?service=https%3a%2f%2fjwstu.shsmu.edu.cn%2fLogin%2fauthLogin> 并登录。

打开浏览器开发者工具：这里以 macOS 上的 Zen Browser 和 Android 上的 Kiwi Browser 为例：

![Zen Browser DevTool](/shsmu-curriculum/zen-devtool.png)
![Kiwi Browser DevTool](/shsmu-curriculum/kiwi-devtool.jpg)

如图，切换到 存储 / 应用 界面，找到 Cookie 中的 `wengin_vpn_ticketwebvpn2_shsmu_edu_cn` 这一项内容，将其值全选复制。

### 开始使用课程表

访问 [SHSMU 课程表](/courses) 并将刚获取到的 Cookie 填入，点击查询课程。

点击 日 / 周 / 月 切换时间范围和视图。

### 注释

1. 点击查询课程按钮后，会将您的 Cookie 内容存储在您的浏览器中保存，本网站不会获取您的任何信息。
2. Cookie 可能在若干小时后就会过期（我也暂时不清楚时限），届时网页会呈现 `500 Internal Server Error` 报错。此时，需要重复以上步骤获取 Cookie。

## 原理

我使用了服务端反代来实现爬取。我的后端 API 地址是：`https://reqwey.xyz/api/curriculum?start=${dateRange.start}&end=${dateRange.end}&cookie=${cookie}`。

后端 Node.js 服务脚本如下：

```js
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3001

// 启用CORS，允许所有来源
app.use(cors())

// 解析URL参数
app.use(express.json())

// 代理路由
app.get('/api/curriculum', async (req, res) => {
  try {
    const { start, end, cookie } = req.query

    if (!start || !end || !cookie) {
      return res.status(400).json({
        error: '缺少参数',
        details: '需要 start, end 和 cookie 参数',
      })
    }

    const url = `https://webvpn2.shsmu.edu.cn/https/77726476706e69737468656265737421fae05288327e7b586d059ce29d51367b9aac/Home/GetCurriculumTable?vpn-12-o2-jwstu.shsmu.edu.cn=&Start=${start}&End=${end}`

    console.log(`[PROXY] 转发请求到: ${url}`)
    console.log(
      `[PROXY] Cookie: wengine_vpn_ticketwebvpn2_shsmu_edu_cn=${cookie.substring(0, 10)}...`,
    )

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/javascript, */*; q=0.01',
        Cookie: `wengine_vpn_ticketwebvpn2_shsmu_edu_cn=${cookie}`,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Referer:
          'https://webvpn2.shsmu.edu.cn/https/77726476706e69737468656265737421fae05288327e7b586d059ce29d51367b9aac/Home/Timetable',
      },
    })

    if (!response.ok) {
      console.log(response.status)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`[PROXY] 返回数据成功，共 ${data.List?.length || 0} 条课程`)

    res.json(data)
  } catch (error) {
    console.error('[PROXY] 错误:', error.stack)
    res.status(500).json({
      error: '代理请求失败',
      details: error.stack,
    })
  }
})

app.listen(PORT, () => {
  console.log('='.repeat(60))
  console.log('课程表代理服务器已启动')
  console.log('='.repeat(60))
  console.log(`服务地址: http://localhost:${PORT}`)
  console.log(`API地址: http://localhost:${PORT}/api/curriculum`)
  console.log(`使用方法: 1. 运行此脚本`)
  console.log(`          2. 在前端设置 USE_PROXY = true`)
  console.log(`          3. 正常查询课程`)
  console.log('='.repeat(60))
})
```

## 致谢

本项目灵感来自[【水源社区】写了个轮子，导出医学院课程表到你的日历软件](https://shuiyuan.sjtu.edu.cn/t/topic/300586)，另外感谢 Felix 同学的技术支持。
