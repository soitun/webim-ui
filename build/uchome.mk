include build/config.mk

PRODUCT_NAME = uchome
JS_APP_FILES = ${APP_SRC_DIR}/ui.chatlink.js\
	${APP_SRC_DIR}/notification.js\
	${APP_SRC_DIR}/ui.notification.js\

CSS_APP_FILES = ${APP_SRC_DIR}/chatlink.css\
	${APP_SRC_DIR}/notification.css\
	${APP_SRC_DIR}/uchome.css\

include build/include.mk
