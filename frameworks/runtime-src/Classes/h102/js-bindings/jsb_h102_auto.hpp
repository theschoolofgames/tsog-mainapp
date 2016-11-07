#include "base/ccConfig.h"
#ifndef __h102_h__
#define __h102_h__

#include "jsapi.h"
#include "jsfriendapi.h"

extern JSClass  *jsb_h102_Utils_class;
extern JSObject *jsb_h102_Utils_prototype;

bool js_h102_Utils_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_h102_Utils_finalize(JSContext *cx, JSObject *obj);
void js_register_h102_Utils(JSContext *cx, JS::HandleObject global);
void register_all_h102(JSContext* cx, JS::HandleObject obj);
bool js_h102_Utils_isPixelTransparent(JSContext *cx, uint32_t argc, jsval *vp);
bool js_h102_Utils_imageMatchPercentage(JSContext *cx, uint32_t argc, jsval *vp);
bool js_h102_Utils_forceRender(JSContext *cx, uint32_t argc, jsval *vp);

#endif // __h102_h__
