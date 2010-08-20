module("core");

test("webim.ui Class", 4, function() {
	var el = document.createElement("div");
	var cn = "webim-window-tab ui-state-default ui-state-default";
	el.className = cn;
	ok(hasClass(el, "ui-state-default"), "hasClass");

	removeClass(el, "ui-state-default");
	ok(!hasClass(el, "ui-state-default"), "removeClass");

	addClass(el, "ui-state-default ui-state-default");
	ok(hasClass(el, "ui-state-default"), "addClass");
	replaceClass(el, "ui-state-default", "ui-state-hightlight");
	ok(!hasClass(el, "ui-state-default"), "replaceClass");
	
});
