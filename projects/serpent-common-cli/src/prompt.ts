import { PromptOptions } from './types/enquirer'
import { prompt as enquirerPrompt } from 'enquirer'
import { tryReadJsonFile } from './fs/tryReadJsonFile'
import { writeJsonSync } from './fs/writeJsonSync'

type Question = PromptOptions & {
  /** 是否将本次输入的结果保存起来，以供下次默认值使用 */
  save?: boolean
}

type Answers = Record<string, any>

interface Options {
  /** 指定要保存结果的文件路径 */
  savePath?: string

  /** 注入新的问题或对已有问题重新排序 */
  resort?: (questions: Question[]) => [string, Partial<Omit<Question, 'name'>>?][]
}

export async function prompt(questions: Question[], opts: Options = {}) {
  const { resort, savePath } = opts

  if (resort) {
    const newQuestions = resort(questions)
    questions = newQuestions.map(([name, opts]) => {
      const found = questions.find(qq => qq.name === name)
      if (found) return { ...found, ...opts }
      if (!opts?.message || !opts.type) throw new Error('enquirer config object should contains `message` and `type`')
      return { name, ...opts } as any
    })
  }

  checkRepeat(questions)

  if (savePath) {
    questions = handleFetch(questions, savePath)
  }

  const answers = (await enquirerPrompt(questions)) as Answers

  if (savePath) {
    handleStore(questions, savePath, answers)
  }

  return answers
}

/** 检查是否有重复的 name 属性 */
function checkRepeat(questions: Question[]) {
  const set = new Set<string>()
  questions.forEach(q => {
    if (set.has(q.name)) {
      throw new Error(`there are two enquirer config objects who's name is "${q.name}"`)
    } else {
      set.add(q.name)
    }
  })
}

/** 获取填过的值 */
function handleFetch(questions: Question[], savePath: string) {
  const initAnswers = tryReadJsonFile(savePath)
  if (initAnswers && typeof initAnswers === 'object') {
    questions = questions.map(q => {
      if (initAnswers.hasOwnProperty(q.name) && q.save) {
        return { ...q, initial: initAnswers[q.name] }
      }
      return q
    })
  }
  return questions
}

/** 保存填过的值 */
function handleStore(questions: Question[], savePath: string, answers: Answers) {
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
