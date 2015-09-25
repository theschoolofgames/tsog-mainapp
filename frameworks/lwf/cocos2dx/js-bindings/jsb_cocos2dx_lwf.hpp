#include "base/ccConfig.h"
#ifndef __cocos2dx_lwf_h__
#define __cocos2dx_lwf_h__

#include "jsapi.h"
#include "jsfriendapi.h"

extern JSClass  *jsb_cocos2d_LWFBitmap_class;
extern JSObject *jsb_cocos2d_LWFBitmap_prototype;

bool js_cocos2dx_lwf_LWFBitmap_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_lwf_LWFBitmap_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_lwf_LWFBitmap(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_lwf(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_lwf_LWFBitmap_GetBitmap(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_lwf_LWFBitmap_GetBitmapEx(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_cocos2d_LWFNode_class;
extern JSObject *jsb_cocos2d_LWFNode_prototype;

bool js_cocos2dx_lwf_LWFNode_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_lwf_LWFNode_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_lwf_LWFNode(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_lwf(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_lwf_LWFNode_isDestructed(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_lwf_LWFNode_getTextureLoadHandler(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_lwf_LWFNode_handleTouch(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_lwf_LWFNode_getNodeHandlers(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_lwf_LWFNode_requestRemoveFromParent(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_lwf_LWFNode_removeNodeFromParent(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_lwf_LWFNode_dump(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_lwf_LWFNode_LWFNode(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_h102_LWFSprite_class;
extern JSObject *jsb_h102_LWFSprite_prototype;

bool js_cocos2dx_lwf_LWFSprite_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_lwf_LWFSprite_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_lwf_LWFSprite(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_lwf(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_lwf_LWFSprite_create(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_lwf_LWFSprite_LWFSprite(JSContext *cx, uint32_t argc, jsval *vp);

#endif // __cocos2dx_lwf_h__
