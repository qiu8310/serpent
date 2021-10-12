/* eslint-disable @typescript-eslint/ban-types */

/**
 * Provides components for the module.
 */
export namespace pt {
  /**
   * Represents a union which preserves autocompletion.
   *
   * @template T
   * The keys which are available for autocompletion.
   *
   * @template F
   * The fallback-type.
   */
  type LiteralUnion<T extends F, F = string> = T | (F & {})

  /**
   * Represents a list-based question.
   *
   * @template T
   * The type of the answers.
   *
   * @template TChoiceMap
   * The valid choices for the question.
   */
  interface ListQuestionOptionsBase<T, TChoiceMap> extends Question<T> {
    /**
     * The choices of the prompt.
     */
    choices?: AsyncDynamicQuestionProperty<readonly DistinctChoice<TChoiceMap>[], T> | undefined

    /**
     * The number of elements to show on each page.
     */
    pageSize?: number | undefined
  }

  /**
   * Provides options for a question.
   *
   * @template T
   * The type of the answers.
   */
  export interface Question<T extends Answers = Answers> {
    /**
     * The type of the question.
     */
    type?: string | undefined

    /**
     * The key to save the answer to the answers-hash.
     */
    name?: KeyUnion<T> | undefined

    /**
     * The message to show to the user.
     */
    message?: AsyncDynamicQuestionProperty<string, T> | undefined

    /**
     * The default value of the question.
     */
    default?: AsyncDynamicQuestionProperty<any, T> | undefined

    /**
     * The prefix of the `message`.
     */
    prefix?: string | undefined

    /**
     * The suffix of the `message`.
     */
    suffix?: string | undefined

    /**
     * Post-processes the answer.
     *
     * @param input
     * The answer provided by the user.
     *
     * @param answers
     * The answers provided by the user.
     */
    filter?(input: any, answers: T): any

    /**
     * A value indicating whether the question should be prompted.
     */
    when?: AsyncDynamicQuestionProperty<boolean, T> | undefined

    /**
     * Validates the integrity of the answer.
     *
     * @param input
     * The answer provided by the user.
     *
     * @param answers
     * The answers provided by the user.
     *
     * @returns
     * Either a value indicating whether the answer is valid or a `string` which describes the error.
     */
    validate?(input: any, answers?: T): boolean | string | Promise<boolean | string>
  }

  /**
   * A set of answers.
   */
  export interface Answers extends Record<string, any> {}

  /**
   * Represents either a key of `T` or a `string`.
   *
   * @template T
   * The type of the keys to suggest.
   */
  type KeyUnion<T> = LiteralUnion<Extract<keyof T, string>>

  /**
   * Represents a dynamic property for a question.
   *
   * @template T
   * The type of the property.
   *
   * @template TAnswers
   * The type of the answers.
   */
  type DynamicQuestionProperty<T, TAnswers extends Answers = Answers> = T | ((answers: TAnswers) => T)

  /**
   * Represents a dynamic property for a question which can be fetched asynchronously.
   *
   * @template T
   * The type of the property.
   *
   * @template TAnswers
   * The type of the answers.
   */
  type AsyncDynamicQuestionProperty<T, TAnswers extends Answers = Answers> = DynamicQuestionProperty<
    T | Promise<T>,
    TAnswers
  >

  /**
   * Represents a choice-item.
   */
  interface ChoiceBase {
    /**
     * The type of the choice.
     */
    type?: string | undefined
  }

  /**
   * Provides options for a choice.
   */
  interface ChoiceOptions extends ChoiceBase {
    /**
     * @inheritdoc
     */
    type?: 'choice' | undefined

    /**
     * The name of the choice to show to the user.
     */
    name?: string | undefined

    /**
     * The value of the choice.
     */
    value?: any

    /**
     * The short form of the name of the choice.
     */
    short?: string | undefined

    /**
     * The extra properties of the choice.
     */
    extra?: any
  }

  /**
   * Provides options for a choice of the `ListPrompt`.
   *
   * @template T
   * The type of the answers.
   */
  interface ListChoiceOptions<T extends Answers = Answers> extends ChoiceOptions {
    /**
     * A value indicating whether the choice is disabled.
     */
    disabled?: DynamicQuestionProperty<boolean | string, T> | undefined
  }

  /**
   * Provides options for a choice of the `CheckboxPrompt`.
   *
   * @template T
   * The type of the answers.
   */
  interface CheckboxChoiceOptions<T extends Answers = Answers> extends ListChoiceOptions<T> {
    /**
     * A value indicating whether the choice should be initially checked.
     */
    checked?: boolean | undefined
  }

  /**
   * Provides options for a choice of the `ExpandPrompt`.
   */
  interface ExpandChoiceOptions extends ChoiceOptions {
    /**
     * The key to press for selecting the choice.
     */
    key?: string | undefined
  }

  /**
   * Represents a separator.
   */
  interface SeparatorOptions extends ChoiceBase {
    /**
     * Gets the type of the choice.
     */
    type: 'separator'

    /**
     * Gets or sets the text of the separator.
     */
    line?: string | undefined
  }

  /**
   * Provides all valid choice-types for any kind of question.
   *
   * @template T
   * The type of the answers.
   */
  interface BaseChoiceMap<T extends Answers = Answers> {
    ChoiceOptions: ChoiceOptions
    SeparatorOptions: SeparatorOptions
  }

  /**
   * Provides all valid choice-types for the `ListQuestion`.
   *
   * @template T
   * The type of the answers.
   */
  interface ListChoiceMap<T extends Answers = Answers> extends BaseChoiceMap<T> {
    ListChoiceOptions: ListChoiceOptions<T>
  }

  /**
   * Provides all valid choice-types for the `CheckboxQuestion`.
   *
   * @template T
   * The type of the answers.
   */
  interface CheckboxChoiceMap<T extends Answers = Answers> extends BaseChoiceMap<T> {
    CheckboxChoiceOptions: CheckboxChoiceOptions<T>
  }

  /**
   * Provides all valid choice-types for the `ExpandQuestion`.
   *
   * @template T
   * The type of the answers.
   */
  interface ExpandChoiceMap<T extends Answers = Answers> extends BaseChoiceMap<T> {
    ExpandChoiceOptions: ExpandChoiceOptions
  }

  /**
   * Provides all valid choice-types.
   *
   * @template T
   * The type of the answers.
   */
  interface AllChoiceMap<T extends Answers = Answers> {
    BaseChoiceMap: BaseChoiceMap<T>[keyof BaseChoiceMap<T>]
    ListChoiceMap: ListChoiceMap<T>[keyof ListChoiceMap<T>]
    CheckboxChoiceMap: CheckboxChoiceMap<T>[keyof CheckboxChoiceMap<T>]
    ExpandChoiceMap: ExpandChoiceMap<T>[keyof ExpandChoiceMap<T>]
  }

  /**
   * Provides valid choices for the question of the `TChoiceMap`.
   *
   * @template TAnswers
   * The type of the answers.
   *
   * @template TChoiceMap
   * The choice-types to provide.
   */
  type DistinctChoice<TAnswers extends Answers = Answers, TChoiceMap = AllChoiceMap<TAnswers>> =
    | string
    | TChoiceMap[keyof TChoiceMap]

  /**
   * Provides options for a question for the `InputPrompt`.
   *
   * @template T
   * The type of the answers.
   */
  interface InputQuestionOptions<T extends Answers = Answers> extends Question<T> {
    /**
     * Transforms the value to display to the user.
     *
     * @param input
     * The input provided by the user.
     *
     * @param answers
     * The answers provided by the users.
     *
     * @param flags
     * Additional information about the value.
     *
     * @returns
     * The value to display to the user.
     */
    transformer?(input: any, answers: T, flags: { isFinal?: boolean | undefined }): string | Promise<string>
  }

  /**
   * Provides options for a question for the `InputPrompt`.
   *
   * @template T
   * The type of the answers.
   */
  interface InputQuestion<T extends Answers = Answers> extends InputQuestionOptions<T> {
    /**
     * @inheritdoc
     */
    type?: 'input' | undefined
  }

  /**
   * Provides options for a question for the `NumberPrompt`.
   *
   * @template T
   * The type of the answers.
   */
  interface NumberQuestion<T extends Answers = Answers> extends InputQuestionOptions<T> {
    /**
     * @inheritdoc
     */
    type: 'number'
  }

  /**
   * Provides options for a question for the `PasswordPrompt`.
   *
   * @template T
   * The type of the answers.
   */
  interface PasswordQuestion<T extends Answers = Answers> extends InputQuestionOptions<T> {
    /**
     * @inheritdoc
     */
    type: 'password'
    /**
     * The character to replace the user-input.
     */
    mask?: string | undefined
  }

  /**
   * Provides options for a question for the `ListPrompt`.
   *
   * @template T
   * The type of the answers.
   */
  interface ListQuestionOptions<T extends Answers = Answers> extends ListQuestionOptionsBase<T, ListChoiceMap<T>> {
    /**
     * A value indicating whether choices in a list should be looped.
     */
    loop?: boolean | undefined
  }

  /**
   * Provides options for a question for the `ListPrompt`.
   *
   * @template T
   * The type of the answers.
   */
  interface ListQuestion<T extends Answers = Answers> extends ListQuestionOptions<T> {
    /**
     * @inheritdoc
     */
    type: 'list'
  }

  /**
   * Provides options for a question for the `RawListPrompt`.
   *
   * @template T
   * The type of the answers.
   */
  interface RawListQuestion<T extends Answers = Answers> extends ListQuestionOptions<T> {
    /**
     * @inheritdoc
     */
    type: 'rawlist'
  }

  /**
   * Provides options for a question for the `ExpandPrompt`.
   *
   * @template T
   * The type of the answers.
   */
  interface ExpandQuestion<T extends Answers = Answers> extends ListQuestionOptionsBase<T, ExpandChoiceMap<T>> {
    /**
     * @inheritdoc
     */
    type: 'expand'
  }

  /**
   * Provides options for a question for the `CheckboxPrompt`.
   *
   * @template T
   * The type of the answers.
   */
  interface CheckboxQuestion<T extends Answers = Answers> extends ListQuestionOptionsBase<T, CheckboxChoiceMap<T>> {
    /**
     * @inheritdoc
     */
    type: 'checkbox'
  }

  /**
   * Provides options for a question for the `ConfirmPrompt`.
   *
   * @template T
   * The type of the answers.
   */
  interface ConfirmQuestion<T extends Answers = Answers> extends Question<T> {
    /**
     * @inheritdoc
     */
    type: 'confirm'
  }

  /**
   * Provides options for a question for the `EditorPrompt`.
   *
   * @template T
   * The type of the answers.
   */
  interface EditorQuestion<T extends Answers = Answers> extends Question<T> {
    /**
     * @inheritdoc
     */
    type: 'editor'
  }

  /**
   * Provides the available question-types.
   *
   * @template T
   * The type of the answers.
   */
  export interface QuestionMap<T extends Answers = Answers> {
    /**
     * The `InputQuestion` type.
     */
    input: InputQuestion<T>

    /**
     * The `NumberQuestion` type.
     */
    number: NumberQuestion<T>

    /**
     * The `PasswordQuestion` type.
     */
    password: PasswordQuestion<T>

    /**
     * The `ListQuestion` type.
     */
    list: ListQuestion<T>

    /**
     * The `RawListQuestion` type.
     */
    rawList: RawListQuestion<T>

    /**
     * The `ExpandQuestion` type.
     */
    expand: ExpandQuestion<T>

    /**
     * The `CheckboxQuestion` type.
     */
    checkbox: CheckboxQuestion<T>

    /**
     * The `ConfirmQuestion` type.
     */
    confirm: ConfirmQuestion<T>

    /**
     * The `EditorQuestion` type.
     */
    editor: EditorQuestion<T>
  }

  /**
   * Represents one of the available questions.
   *
   * @template T
   * The type of the answers.
   */
  export type DistinctQuestion<T extends Answers = Answers> = QuestionMap<T>[keyof QuestionMap<T>]

  /**
   * Represents a collection of questions.
   *
   * @template T
   * The type of the answers.
   */
  export type QuestionCollection<T extends Answers = Answers> = DistinctQuestion<T> | readonly DistinctQuestion<T>[]
}
