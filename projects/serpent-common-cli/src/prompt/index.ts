import { prompt as inquirerPrompt } from 'inquirer'
import { tryReadJsonFile, writeJsonSync } from '../fs'
import { pt } from './types'

export type Question<T = pt.Answers> = pt.DistinctQuestion<T> & {
  name: string
  /** 是否将本次输入的结果保存起来，以供下次默认值使用 */
  save?: boolean
}
interface Options<T = pt.Answers> {
  /** 指定要保存结果的文件路径 */
  savePath?: string

  /** 注入新的问题或对已有问题重新排序 */
  resort?: (questions: Question<T>[]) => (Question<T> | string | [string, Partial<Omit<Question<T>, 'name'>>?])[]
}

export async function prompt<T = pt.Answers>(questions: Question<T>[], opts: Options<T> = {}): Promise<T> {
  const { resort, savePath } = opts

  if (resort) {
    const newQuestions = resort(questions)
    questions = newQuestions.map(target => {
      if (Array.isArray(target) || typeof target === 'string') {
        const name = typeof target === 'string' ? target : target[0]
        const options = typeof target === 'string' ? {} : target[1]
        const found = questions.find(qq => qq.name === name)
        if (!found) throw new Error(`can't found related inquirer config object whose name is ${name}`)
        return { ...found, ...options } as any
      } else {
        if (!target?.name || !target.type) throw new Error('inquirer config object should contains `name` and `type`')
        return { ...target } as any
      }
    })
  }

  checkRepeat(questions)

  if (savePath) {
    questions = handleFetch(questions, savePath)
  }

  const answers = await inquirerPrompt<T>(questions)

  if (savePath) {
    handleStore(questions, savePath, answers)
  }

  return answers as any
}

/**
 * confirm 确认提示
 */
export async function confirm(
  message: string,
  options?: Omit<Partial<pt.QuestionMap['confirm']>, 'name' | 'type' | 'message'>
) {
  const answer = await prompt([
    {
      ...(options as any),
      name: 'key',
      type: 'confirm',
      message: message,
    },
  ])

  return answer.key
}

/**
 * 列表选择提示
 */
export async function select(
  message: string,
  choices: Required<pt.QuestionMap['list']>['choices'],
  options?: Omit<Partial<pt.QuestionMap['list']>, 'name' | 'type' | 'message'>
) {
  const answer = await prompt([
    {
      ...(options as any),
      name: 'key',
      type: 'list',
      message: message,
      choices,
    },
  ])

  return answer.key
}

/** 检查是否有重复的 name 属性 */
function checkRepeat<T>(questions: Question<T>[]) {
  const set = new Set<string>()
  questions.forEach(q => {
    if (set.has(q.name)) {
      throw new Error(`there are two inquirer config objects who's name is "${q.name}"`)
    } else {
      set.add(q.name)
    }
  })
}

/** 获取填过的值 */
function handleFetch<T>(questions: Question<T>[], savePath: string) {
  const initAnswers = tryReadJsonFile(savePath)
  if (initAnswers && typeof initAnswers === 'object') {
    questions = questions.map(q => {
      if (initAnswers.hasOwnProperty(q.name) && q.save) {
        return { ...q, default: initAnswers[q.name] }
      }
      return q
    })
  }
  return questions
}

/** 保存填过的值 */
function handleStore<T>(questions: Question<T>[], savePath: string, answers: any) {
  writeJsonSync(
    savePath,
    questions.reduce((res, q) => {
      if (q.save && answers.hasOwnProperty(q.name) && answers[q.name] != null) {
        res[q.name] = answers[q.name]
      }
      return res
      // 不要删除已有的值，因为可能会多次 prompt
    }, (tryReadJsonFile(savePath) || {}) as Record<string, any>)
  )
}
