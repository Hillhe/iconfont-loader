import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import path from 'path'
import fs from 'fs-extra'
import config from './config'
import { parseAttrs } from './parser'
import { downloadAndUnzip } from './core'

const TEMP = (dir: string): string => path.resolve(__dirname, config.tempDir + dir)

interface BaseOptions {
  token: string,
  pid: string,
  pName: string
}

interface DownloadOptions extends BaseOptions {
  destDir: string,
  cssFileName: string,
  includes?: Array<string>
}

interface DownloadSvgsOptions extends BaseOptions {
  filename: (iconName: string) => string,
  destDir: string,
}

interface SvgParsed {
  id: string,
  content: string,
}

function isUsefulFile(filename: string, includes?: Array<string>) {
  return includes || ['.css', '.woff', '.woff2', '.ttf', '.js'].indexOf(path.extname(filename)) >= 0 && /^iconfont/.test(filename)
}

export async function download(options: DownloadOptions) {
  rmSync(TEMP(options.pName), { force: true, recursive: true })
  mkdirSync(TEMP(options.pName))
  const dir = await downloadAndUnzip(options.token, options.pid, options.pName)
  readdirSync(dir, { withFileTypes: true })
    .filter(o => o.isFile() && isUsefulFile(o.name, options.includes))
    .forEach(o => {
      const copyPath = path.extname(o.name).toLowerCase() === '.css' ? options.cssFileName : o.name
      fs.copyFileSync(path.resolve(dir, o.name), path.resolve(options.destDir, copyPath))
    })
  // 删掉tmp目录
  rmSync(TEMP(options.pName), { force: true, recursive: true })
}

const JS_SVG_RE = /window\.\w+?\s*=\s*'(.*?)'/

function parseSvgs(content: string): SvgParsed[] {
  const re = new RegExp(/<symbol\s*(.*?)\s*>(.*?)(?:<\/symbol>)/, 'g')
  let result: RegExpExecArray | null
  const list: SvgParsed[] = []
  // eslint-disable-next-line no-cond-assign
  while (result = re.exec(content)) {
    const classname = result[1]
    const inner = result[2]
    const attrs = parseAttrs(classname)
    list.push({
      id: attrs.id,
      content: `<svg width="150" height="150" ${classname}>${inner}</svg>`,
    })
  }

  return list
}

async function loadSvgs(options: BaseOptions) {
  rmSync(TEMP(options.pName), { force: true, recursive: true })
  mkdirSync(TEMP(options.pName))
  const dir = await downloadAndUnzip(options.token, options.pid, options.pName)
  const svgJsPath = path.resolve(dir, 'iconfont.js')
  if (!existsSync(svgJsPath)) throw new Error('不存在iconfont.js文件！')
  const content = readFileSync(svgJsPath, { encoding: 'utf-8' })
  const re = new RegExp(JS_SVG_RE, 'g')
  const result = re.exec(content)
  if (!result) throw new Error('没有找到svg内容！')
  const svg = result[1]
  const svgs = parseSvgs(svg)
  return svgs
}

export async function downloadSvgs(options: DownloadSvgsOptions) {
  const svgs = await loadSvgs(options)
  svgs.forEach(svg => {
    const filename = options.filename ? options.filename(svg.id) : svg.id
    writeFileSync(path.resolve(options.destDir, `${filename}.svg`), svg.content, { encoding: 'utf-8' })
  })
  rmSync(TEMP(options.pName), { force: true, recursive: true })
}
