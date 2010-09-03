include build/config.mk

PRODUCT_NAME = service

JS_APP_FILES = ${JS_SRC_DIR}/ui.buddy.js\

CSS_APP_FILES = ${CSS_SRC_DIR}/buddy.css\
	${CSS_SRC_DIR}/user.css\
	${APP_SRC_DIR}/service.css\

include build/include.mk
