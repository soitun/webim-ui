include build/config.mk

PRODUCT_NAME = discuzX

JS_APP_FILES = ${APP_SRC_DIR}/ui.chatlink.js\
	${APP_SRC_DIR}/notification.js\
	${APP_SRC_DIR}/ui.notification.js\

CSS_APP_FILES = ${APP_SRC_DIR}/chatlink.css\
	${APP_SRC_DIR}/notification.css\
	${APP_SRC_DIR}/discuzX.css\

include build/include.mk
