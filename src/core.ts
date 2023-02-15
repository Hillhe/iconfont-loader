import axios from 'axios'
import AdmZip from 'adm-zip'
import { createWriteStream, PathLike, readdirSync } from 'fs'
import config from './config'
import path from 'path'

const TEMP = (dir: string): string => path.resolve(__dirname, config.tempDir + dir)

async function pipStream(data: any, path: PathLike) {
  return new Promise((resolve, reject) => {
    const stream = createWriteStream(path)
    stream.on('error', reject)
    stream.on('finish', resolve)
    data.pipe(stream)
  })
}

export async function downloadAndUnzip(token: string, pid: string, pName: string) {
  return new Promise<string>(async(resolve, reject) => {
    try {
      const { data } = await axios({
        url: 'https://www.iconfont.cn/api/project/download.zip',
        params: {
          pid
        },
        responseType: 'stream',
        headers: {
          cookie: `EGG_SESS_ICONFONT=${token}`
        }
      })
      const zipFile = path.resolve(TEMP(pName), './download.zip')
      await pipStream(data, zipFile)
    
      const az = new AdmZip(zipFile)
      az.extractAllTo(TEMP(pName), true)
      const dirs = readdirSync(TEMP(pName), { withFileTypes: true }).filter(o => o.isDirectory() && /^font_/.test(o.name))
      if (!dirs.length) return reject(new Error('文件格式错误'))

      resolve(path.resolve(TEMP(pName), dirs[0].name))
    } catch (err) {
      reject(err)
    }
  })
}
