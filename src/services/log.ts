import chalk from 'chalk'
import { Spinner } from 'cli-spinner'
import cliSpinners from 'cli-spinners'
import { Icons } from '../constants/icons'

type LogStatus = 'error' | 'info' | 'warn' | 'success';

type ColoredFunction = (text: string) => void;
const getColoredFunction = (status: LogStatus): ColoredFunction => {
	switch (status) {
	case 'error':
		return chalk.red
	case 'info':
		return chalk.whiteBright
	case 'warn':
		return chalk.yellow
	case 'success':
		return chalk.green

	default:
		return chalk.white
	}
}

const loader = (): Spinner => {
	const spinner = new Spinner()
	const loaderIcon = cliSpinners.dots
	spinner.setSpinnerString(loaderIcon.frames.join(''))
	spinner.setSpinnerDelay(loaderIcon.interval)
	return spinner
}

const spinner = loader()
let interval: NodeJS.Timeout | null = null 

const loading = (text: string, icons: string[] = [], i = 0) => {
	stopLoaderIfNeeded()
	const fullText = `${chalk.yellow(`${text}...`)} ${icons[i] || ''}`
	spinner.setSpinnerTitle(`%s ${fullText}`)
	spinner.start()
	interval = setInterval(async () => {
		spinner.stop(true)
		// await new Promise(r => setTimeout(r, 50))
		if(interval)
			clearInterval(interval)

		let newIndex = 0
		if(icons.length) {
			const isLastIcon = i === icons.length - 1
			const firstIcon = 0
			const nextIcon = i + 1
			newIndex = isLastIcon ? firstIcon : nextIcon
		}
		loading(text, icons, newIndex)
	}, 1000 + (100 * Math.floor(Math.random() * 10)))
}

export const stopLoaderIfNeeded = () => {
	interval && clearInterval(interval)
	spinner.isSpinning() && spinner.stop(true)
}

const success = (text: string, icon = '') => {
	stopLoaderIfNeeded()
	const textWithIcon = `${Icons.Ok} ${chalk.white(text)} ${icon}`
	console.log(chalk.bold(textWithIcon))
}

const endLoading = (text: string, icon = '') => {
	stopLoaderIfNeeded()
	success(text, icon)
}

const log = (text: string, status: LogStatus) => {
	stopLoaderIfNeeded()
	const colored = getColoredFunction(status)
	const logText = colored(text)
	console.log(logText)
}

const info = (text: string) => log(text, 'info')
const error = (text: string) => log(text, 'error')
const warn = (text: string) => log(text, 'warn')
export default { info, error, warn, success, loading, endLoading, stopLoaderIfNeeded }
