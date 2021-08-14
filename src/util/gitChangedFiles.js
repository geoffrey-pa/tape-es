import { spawnSync } from 'child_process'

const [bin, ...args] = 'git ls-files --exclude-standard --others --modified'.split(' ')
export const gitChangedFiles = () => {
    const files = spawnSync(bin, args)
    if(files.status)
        throw new Error(files.stderr.toString())
    return files.stdout.toString().split('\n').slice(0, -1)
}