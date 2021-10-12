import { ChildProcess } from 'child_process'
import { Stream, Readable as ReadableStream } from 'stream'

export namespace runTypes {
  type StdioOption = 'pipe' | 'ipc' | 'ignore' | 'inherit' | Stream | number | undefined

  interface CommonOptions<EncodingType> {
    /**
		Kill the spawned process when the parent process exits unless either:
			- the spawned process is [`detached`](https://nodejs.org/api/child_process.html#child_process_options_detached)
			- the parent process is terminated abruptly, for example, with `SIGKILL` as opposed to `SIGTERM` or a normal exit

		@default true
		*/
    readonly cleanup?: boolean

    /**
		Prefer locally installed binaries when looking for a binary to execute.

		If you `$ npm install foo`, you can then `execa('foo')`.

		@default false
		*/
    readonly preferLocal?: boolean

    /**
		Preferred path to find locally installed binaries in (use with `preferLocal`).

		@default process.cwd()
		*/
    readonly localDir?: string

    /**
		Path to the Node.js executable to use in child processes.

		This can be either an absolute path or a path relative to the `cwd` option.

		Requires `preferLocal` to be `true`.

		For example, this can be used together with [`get-node`](https://github.com/ehmicky/get-node) to run a specific Node.js version in a child process.

		@default process.execPath
		*/
    readonly execPath?: string

    /**
		Buffer the output from the spawned process. When set to `false`, you must read the output of `stdout` and `stderr` (or `all` if the `all` option is `true`). Otherwise the returned promise will not be resolved/rejected.

		If the spawned process fails, `error.stdout`, `error.stderr`, and `error.all` will contain the buffered data.

		@default true
		*/
    readonly buffer?: boolean

    /**
		Same options as [`stdio`](https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio).

		@default 'pipe'
		*/
    readonly stdin?: StdioOption

    /**
		Same options as [`stdio`](https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio).

		@default 'pipe'
		*/
    readonly stdout?: StdioOption

    /**
		Same options as [`stdio`](https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio).

		@default 'pipe'
		*/
    readonly stderr?: StdioOption

    /**
		Setting this to `false` resolves the promise with the error instead of rejecting it.

		@default true
		*/
    readonly reject?: boolean

    /**
		Add an `.all` property on the promise and the resolved value. The property contains the output of the process with `stdout` and `stderr` interleaved.

		@default false
		*/
    readonly all?: boolean

    /**
		Strip the final [newline character](https://en.wikipedia.org/wiki/Newline) from the output.

		@default true
		*/
    readonly stripFinalNewline?: boolean

    /**
		Set to `false` if you don't want to extend the environment variables when providing the `env` property.

		@default true
		*/
    readonly extendEnv?: boolean

    /**
		Current working directory of the child process.

		@default process.cwd()
		*/
    readonly cwd?: string

    /**
		Environment key-value pairs. Extends automatically from `process.env`. Set `extendEnv` to `false` if you don't want this.

		@default process.env
		*/
    readonly env?: NodeJS.ProcessEnv

    /**
		Explicitly set the value of `argv[0]` sent to the child process. This will be set to `command` or `file` if not specified.
		*/
    readonly argv0?: string

    /**
		Child's [stdio](https://nodejs.org/api/child_process.html#child_process_options_stdio) configuration.

		@default 'pipe'
		*/
    readonly stdio?: 'pipe' | 'ignore' | 'inherit' | readonly StdioOption[]

    /**
		Specify the kind of serialization used for sending messages between processes when using the `stdio: 'ipc'` option or `execa.node()`:
			- `json`: Uses `JSON.stringify()` and `JSON.parse()`.
			- `advanced`: Uses [`v8.serialize()`](https://nodejs.org/api/v8.html#v8_v8_serialize_value)

		Requires Node.js `13.2.0` or later.

		[More info.](https://nodejs.org/api/child_process.html#child_process_advanced_serialization)

		@default 'json'
		*/
    readonly serialization?: 'json' | 'advanced'

    /**
		Prepare child to run independently of its parent process. Specific behavior [depends on the platform](https://nodejs.org/api/child_process.html#child_process_options_detached).

		@default false
		*/
    readonly detached?: boolean

    /**
		Sets the user identity of the process.
		*/
    readonly uid?: number

    /**
		Sets the group identity of the process.
		*/
    readonly gid?: number

    /**
		If `true`, runs `command` inside of a shell. Uses `/bin/sh` on UNIX and `cmd.exe` on Windows. A different shell can be specified as a string. The shell should understand the `-c` switch on UNIX or `/d /s /c` on Windows.

		We recommend against using this option since it is:
		- not cross-platform, encouraging shell-specific syntax.
		- slower, because of the additional shell interpretation.
		- unsafe, potentially allowing command injection.

		@default false
		*/
    readonly shell?: boolean | string

    /**
		Specify the character encoding used to decode the `stdout` and `stderr` output. If set to `null`, then `stdout` and `stderr` will be a `Buffer` instead of a string.

		@default 'utf8'
		*/
    readonly encoding?: EncodingType

    /**
		If `timeout` is greater than `0`, the parent will send the signal identified by the `killSignal` property (the default is `SIGTERM`) if the child runs longer than `timeout` milliseconds.

		@default 0
		*/
    readonly timeout?: number

    /**
		Largest amount of data in bytes allowed on `stdout` or `stderr`. Default: 100 MB.

		@default 100_000_000
		*/
    readonly maxBuffer?: number

    /**
		Signal value to be used when the spawned process will be killed.

		@default 'SIGTERM'
		*/
    readonly killSignal?: string | number

    /**
		If `true`, no quoting or escaping of arguments is done on Windows. Ignored on other platforms. This is set to `true` automatically when the `shell` option is `true`.

		@default false
		*/
    readonly windowsVerbatimArguments?: boolean

    /**
		On Windows, do not create a new console window. Please note this also prevents `CTRL-C` [from working](https://github.com/nodejs/node/issues/29837) on Windows.

		@default true
		*/
    readonly windowsHide?: boolean
  }

  export interface Options<EncodingType = string> extends CommonOptions<EncodingType> {
    /**
		Write some input to the `stdin` of your binary.
		*/
    readonly input?: string | Buffer | ReadableStream
  }

  interface ExecaReturnBase<StdoutStderrType> {
    /**
		The file and arguments that were run.
		*/
    command: string

    /**
		The numeric exit code of the process that was run.
		*/
    exitCode: number

    /**
		The output of the process on stdout.
		*/
    stdout: StdoutStderrType

    /**
		The output of the process on stderr.
		*/
    stderr: StdoutStderrType

    /**
		Whether the process failed to run.
		*/
    failed: boolean

    /**
		Whether the process timed out.
		*/
    timedOut: boolean

    /**
		Whether the process was killed.
		*/
    killed: boolean

    /**
		The name of the signal that was used to terminate the process. For example, `SIGFPE`.

		If a signal terminated the process, this property is defined and included in the error message. Otherwise it is `undefined`.
		*/
    signal?: string

    /**
		A human-friendly description of the signal that was used to terminate the process. For example, `Floating point arithmetic error`.

		If a signal terminated the process, this property is defined and included in the error message. Otherwise it is `undefined`. It is also `undefined` when the signal is very uncommon which should seldomly happen.
		*/
    signalDescription?: string
  }

  interface ExecaSyncReturnValue<StdoutErrorType = string> extends ExecaReturnBase<StdoutErrorType> {}

  /**
	Result of a child process execution. On success this is a plain object. On failure this is also an `Error` instance.

	The child process fails when:
	- its exit code is not `0`
	- it was killed with a signal
	- timing out
	- being canceled
	- there's not enough memory or there are already too many child processes
	*/
  interface ExecaReturnValue<StdoutErrorType = string> extends ExecaSyncReturnValue<StdoutErrorType> {
    /**
		The output of the process with `stdout` and `stderr` interleaved.

		This is `undefined` if either:
		- the `all` option is `false` (default value)
		- `execa.sync()` was used
		*/
    all?: StdoutErrorType

    /**
		Whether the process was canceled.
		*/
    isCanceled: boolean
  }

  interface ExecaSyncError<StdoutErrorType = string> extends Error, ExecaReturnBase<StdoutErrorType> {
    /**
		Error message when the child process failed to run. In addition to the underlying error message, it also contains some information related to why the child process errored.

		The child process stderr then stdout are appended to the end, separated with newlines and not interleaved.
		*/
    message: string

    /**
		This is the same as the `message` property except it does not include the child process stdout/stderr.
		*/
    shortMessage: string

    /**
		Original error message. This is the same as the `message` property except it includes neither the child process stdout/stderr nor some additional information added by Execa.

		This is `undefined` unless the child process exited due to an `error` event or a timeout.
		*/
    originalMessage?: string
  }

  interface ExecaError<StdoutErrorType = string> extends ExecaSyncError<StdoutErrorType> {
    /**
		The output of the process with `stdout` and `stderr` interleaved.

		This is `undefined` if either:
		- the `all` option is `false` (default value)
		- `execa.sync()` was used
		*/
    all?: StdoutErrorType

    /**
		Whether the process was canceled.
		*/
    isCanceled: boolean
  }

  interface KillOptions {
    /**
		Milliseconds to wait for the child process to terminate before sending `SIGKILL`.

		Can be disabled with `false`.

		@default 5000
		*/
    forceKillAfterTimeout?: number | false
  }

  interface ExecaChildPromise<StdoutErrorType> {
    catch<ResultType = never>(
      onRejected?: (reason: ExecaError<StdoutErrorType>) => ResultType | PromiseLike<ResultType>
    ): Promise<ExecaReturnValue<StdoutErrorType> | ResultType>

    /**
		Same as the original [`child_process#kill()`](https://nodejs.org/api/child_process.html#child_process_subprocess_kill_signal), except if `signal` is `SIGTERM` (the default value) and the child process is not terminated after 5 seconds, force it by sending `SIGKILL`.
		*/
    kill(signal?: string, options?: KillOptions): void

    /**
		Similar to [`childProcess.kill()`](https://nodejs.org/api/child_process.html#child_process_subprocess_kill_signal). This is preferred when cancelling the child process execution as the error is more descriptive and [`childProcessResult.isCanceled`](#iscanceled) is set to `true`.
		*/
    cancel(): void

    /**
		Stream combining/interleaving [`stdout`](https://nodejs.org/api/child_process.html#child_process_subprocess_stdout) and [`stderr`](https://nodejs.org/api/child_process.html#child_process_subprocess_stderr).

		This is `undefined` if either:
			- the `all` option is `false` (the default value)
			- both `stdout` and `stderr` options are set to [`'inherit'`, `'ipc'`, `Stream` or `integer`](https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio)
		*/
    all?: ReadableStream
  }

  export type ExecaChildProcess<StdoutErrorType = string> = ChildProcess &
    ExecaChildPromise<StdoutErrorType> &
    Promise<ExecaReturnValue<StdoutErrorType>>
}
