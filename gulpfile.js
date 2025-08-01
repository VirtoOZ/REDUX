// Импорт основного модуля
import gulp from "gulp";
// Импорт общих плагинов
import { plugins } from "./config/gulp-plugins.js";
// Импорт путей
import { pathtofiles } from "./config/gulp-settings.js";
// Импорт функционала NodeJS
import fs from 'fs';

// Передаем значение в глобальную переменную
global.app = {
	isBuild: process.argv.includes('--build'),
	isDev: !process.argv.includes('--build'),
	isWebP: !process.argv.includes('--nowebp'),
	isImgOpt: !process.argv.includes('--noimgopt'),
	isFontsReW: process.argv.includes('--rewrite'),
	gulp: gulp,
	path: pathtofiles,
	plugins: plugins
}

// Импорт задач
import { reset } from "./config/gulp-tasks/reset.js";
import { html } from "./config/gulp-tasks/html.js";
import { css } from "./config/gulp-tasks/css.js";
import { js } from "./config/gulp-tasks/js.js";
import { jsDev } from "./config/gulp-tasks/js-dev.js";
import { WebP, imagesOptimize, copySvg } from "./config/gulp-tasks/images.js";
import { ftp } from "./config/gulp-tasks/ftp.js";
import { zip } from "./config/gulp-tasks/zip.js";
import { sprite } from "./config/gulp-tasks/sprite.js";
import { gitignore } from "./config/gulp-tasks/gitignore.js";
import { otfToTtf, ttfToWoff2, woff2Copy, fontsStyle } from "./config/gulp-tasks/fonts.js";

// Последовательная обработка шрифтов
const fonts = gulp.series(reset, function (done) {
	// Если есть папка fonts
	if (fs.existsSync(`${app.path.srcFolder}/fonts`)) {
		gulp.series(otfToTtf, ttfToWoff2, woff2Copy, fontsStyle)(done);
	} else {
		done();
	}
});
// const fonts = gulp.series(reset, otfToTtf, ttfToWoff2, woff2Copy, fontsStyle);

// Порядок выполнения задач для режима разработчик
const devTasks = gulp.series(fonts, gitignore);
// Порядок выполнения задач для режима продакшн
const buildTasks = gulp.series(fonts, jsDev, js, gulp.parallel(html, css, gulp.parallel(WebP, copySvg), gitignore));

// Экспорт задач
export { html }
export { css }
export { js }
export { jsDev }
export { fonts }
export { sprite }
export { ftp }
export { zip }

// Построение сценариев выполнения задач
const development = devTasks;
const build = buildTasks;
const deployFTP = gulp.series(buildTasks, ftp);
const deployZIP = gulp.series(buildTasks, zip);

// Экспорт сценариев
export { development }
export { build }
export { deployFTP }
export { deployZIP }

// Выполнение сценария по умолчанию
gulp.task('default', development);