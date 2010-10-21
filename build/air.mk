include build/config.mk

PRODUCT_NAME = air

CSS_BASE_FILES = ${CSS_SRC_DIR}/core.css\
	${CSS_SRC_DIR}/ui.core.css\
	${CSS_SRC_DIR}/icons.css\
	${CSS_SRC_DIR}/emot.css\
	${CSS_SRC_DIR}/history.css\
	${CSS_SRC_DIR}/air.css\
	${CSS_SRC_DIR}/chat.css\

JS_BASE_FILES = ${JS_SRC_DIR}/core.js\
	${JS_SRC_DIR}/date.js\
	${JS_SRC_DIR}/notice.js\
	${JS_SRC_DIR}/i18n.js\
	${JS_SRC_DIR}/air.js\
	${JS_SRC_DIR}/air.window.js\
	${JS_SRC_DIR}/air.layout.js\
	${JS_SRC_DIR}/ui.history.js\
	${JS_SRC_DIR}/ui.emot.js\
	${JS_SRC_DIR}/ui.chat.js\

JS_APP_FILES = ${JS_SRC_DIR}/ui.setting.js\
	${JS_SRC_DIR}/ui.user.js\
	${JS_SRC_DIR}/ui.login.js\
	${JS_SRC_DIR}/ui.buddy.js\
	${JS_SRC_DIR}/ui.room.js\
	${JS_SRC_DIR}/ui.menu.js\
	${JS_SRC_DIR}/ui.tabs.js\

CSS_APP_FILES = ${CSS_SRC_DIR}/buddy.css\
	${CSS_SRC_DIR}/setting.css\
	${CSS_SRC_DIR}/user.css\
	${CSS_SRC_DIR}/login.css\
	${CSS_SRC_DIR}/tabs.css\
	${CSS_SRC_DIR}/room.css\
	${CSS_SRC_DIR}/menu.css\

include build/include.mk
