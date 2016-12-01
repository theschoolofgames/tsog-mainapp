#include "base/ccConfig.h"
#ifndef __CCParallaxScrollNode_h__
#define __CCParallaxScrollNode_h__

#include "jsapi.h"
#include "jsfriendapi.h"

extern JSClass  *jsb_CCParallaxScrollOffset_class;
extern JSObject *jsb_CCParallaxScrollOffset_prototype;

bool js_CCParallaxScrollNode_CCParallaxScrollOffset_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_CCParallaxScrollNode_CCParallaxScrollOffset_finalize(JSContext *cx, JSObject *obj);
void js_register_CCParallaxScrollNode_CCParallaxScrollOffset(JSContext *cx, JS::HandleObject global);
void register_all_CCParallaxScrollNode(JSContext* cx, JS::HandleObject obj);
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_getRelVelocity(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_setScrollOffset(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_setRelVelocity(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_setBuffer(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_getOrigPosition(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_setOrigPosition(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_getTheChild(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_initWithNode(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_getScrollOffset(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_init(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_getRatio(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_setRatio(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_setTheChild(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_getBuffer(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_scrollWithNode(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_create(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_CCParallaxScrollNode_class;
extern JSObject *jsb_CCParallaxScrollNode_prototype;

bool js_CCParallaxScrollNode_CCParallaxScrollNode_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_CCParallaxScrollNode_CCParallaxScrollNode_finalize(JSContext *cx, JSObject *obj);
void js_register_CCParallaxScrollNode_CCParallaxScrollNode(JSContext *cx, JS::HandleObject global);
void register_all_CCParallaxScrollNode(JSContext* cx, JS::HandleObject obj);
bool js_CCParallaxScrollNode_CCParallaxScrollNode_addChild(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollNode_updateWithYPosition(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollNode_removeChild(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollNode_init(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollNode_updateWithVelocity(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollNode_addInfiniteScrollWithObjects(JSContext *cx, uint32_t argc, jsval *vp);
bool js_CCParallaxScrollNode_CCParallaxScrollNode_create(JSContext *cx, uint32_t argc, jsval *vp);

#endif // __CCParallaxScrollNode_h__
