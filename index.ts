
import inquirer, { Question, } from 'inquirer'
import { C } from 'topkat-utils'

type TestFn = (userResponse: string) => boolean

type QuestionType = 'input' | 'number' | 'confirm' | 'list' | 'rawlist' | 'expand' | 'checkbox' | 'password' | 'editor'

export async function cliPrompt<
    U extends string,
    T extends { message: string, confirm?: boolean } | { choices: U[] | readonly U[], message?: never },
>(
    config: T,
    tests: TestFn | Array<TestFn> = [],
    formattingFunction?: TestFn
): Promise<T extends { choices: any } ? T['choices'][number] : boolean> {
    let response
    let hasErr = true

    const type: QuestionType = 'confirm' in config ? 'confirm' as const : 'choices' in config ? 'list' : 'input'

    const choices = 'choices' in config ? config.choices : undefined

    const newConf: Question = {
        name: 'response',
        message: config.message,
        type,
        choices
    }
    newConf.name = 'response'
    newConf.type = 'confirm' in config ? 'confirm' : 'message' in config ? 'text' : 'list'
    if ('choices' in config) newConf.choices.push(...cliPromptBlankSpace())
    while (hasErr) {
        response = (await inquirer.prompt(newConf as any)).response
        hasErr = typeof tests === 'function' ? !tests(response) : tests.some(test => !test(response))
    }
    br()
    return (typeof formattingFunction === 'function' ? formattingFunction(response) : response) as any
}

function cliPromptBlankSpace(): string[] {
    return Array(10).fill(new inquirer.Separator(' '))
}

/** choices: ['A', 'B', separator(), 'C']
 * @param fillingChar optionnal
 */
export function cliPromptSeparator(fillingChar?: string) {
    return new inquirer.Separator(fillingChar)
}

function br() { C.log('\n') }

/** Display a "Yes" / "No" choice to user, response is converted as a boolean */
export async function cliBooleanChoice() {
    const resp = await cliPrompt({ choices: ['Yes', 'No'] })
    return resp === 'Yes'
}