# iconfont-loader

iconfont图标包下载工具

## 安装

```bash
pnpm i iconfont-loader
# yarn add iconfont-loader
# npm i iconfont-loader
```

## 使用

**下载字体包**

```ts
import { download } from 'iconfont-loader'

download({
  pid: '123456',
  token: 'abc123',
  destDir: './fonts',
  cssFileName: 'iconfont-loader.css'
})
```

**参数**

- `token(string)`: iconfont的token，登录iconfont后，打开F12控制台，名为`EGG_SESS_ICONFONT`的cookie即为该token
- `pid(string)`: 项目id
- `destDir(string)`: 下载的文件存放的目录
- `cssFileName(string)`: 下载的css文件名称

***

**下载SVG包**

```ts
import { downloadSvgs } from 'iconfont-loader'

downloadSvgs({
  pid: '123456',
  token: 'abc123',
  destDir: './svgs'
})
```

**参数**

- `token(string)`: iconfont登录token
- `pid(string)`: 项目ID
- `destDir(string)`: 目标目录
- `filename((iconName: string) => string)`: svg文件名重写
- `cssFileName(string)`: 下载的css文件名称
