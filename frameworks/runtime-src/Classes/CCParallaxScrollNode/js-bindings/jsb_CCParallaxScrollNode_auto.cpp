#include "jsb_CCParallaxScrollNode_auto.hpp"
#include "scripting/js-bindings/manual/cocos2d_specifics.hpp"
#include "CCParallaxScrollNode.h"
#include "CCParallaxScrollOffset.h"

template<class T>
static bool dummy_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS_ReportError(cx, "Constructor for the requested class is not available, please refer to the API reference.");
    return false;
}

static bool empty_constructor(JSContext *cx, uint32_t argc, jsval *vp) {
    return false;
}

static bool js_is_native_obj(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    args.rval().setBoolean(true);
    return true;
}
JSClass  *jsb_CCParallaxScrollOffset_class;
JSObject *jsb_CCParallaxScrollOffset_prototype;

bool js_CCParallaxScrollNode_CCParallaxScrollOffset_getRelVelocity(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollOffset* cobj = (CCParallaxScrollOffset *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_getRelVelocity : Invalid Native Object");
    if (argc == 0) {
        cocos2d::Point ret = cobj->getRelVelocity();
        jsval jsret = JSVAL_NULL;
        jsret = ccpoint_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollOffset_getRelVelocity : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_setScrollOffset(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollOffset* cobj = (CCParallaxScrollOffset *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setScrollOffset : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Point arg0;
        ok &= jsval_to_ccpoint(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setScrollOffset : Error processing arguments");
        cobj->setScrollOffset(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setScrollOffset : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_setRelVelocity(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollOffset* cobj = (CCParallaxScrollOffset *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setRelVelocity : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Point arg0;
        ok &= jsval_to_ccpoint(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setRelVelocity : Error processing arguments");
        cobj->setRelVelocity(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setRelVelocity : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_setBuffer(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollOffset* cobj = (CCParallaxScrollOffset *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setBuffer : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Point arg0;
        ok &= jsval_to_ccpoint(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setBuffer : Error processing arguments");
        cobj->setBuffer(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setBuffer : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_getOrigPosition(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollOffset* cobj = (CCParallaxScrollOffset *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_getOrigPosition : Invalid Native Object");
    if (argc == 0) {
        cocos2d::Point ret = cobj->getOrigPosition();
        jsval jsret = JSVAL_NULL;
        jsret = ccpoint_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollOffset_getOrigPosition : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_setOrigPosition(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollOffset* cobj = (CCParallaxScrollOffset *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setOrigPosition : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Point arg0;
        ok &= jsval_to_ccpoint(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setOrigPosition : Error processing arguments");
        cobj->setOrigPosition(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setOrigPosition : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_getTheChild(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollOffset* cobj = (CCParallaxScrollOffset *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_getTheChild : Invalid Native Object");
    if (argc == 0) {
        cocos2d::Node* ret = cobj->getTheChild();
        jsval jsret = JSVAL_NULL;
        if (ret) {
            jsret = OBJECT_TO_JSVAL(js_get_or_create_jsobject<cocos2d::Node>(cx, (cocos2d::Node*)ret));
        } else {
            jsret = JSVAL_NULL;
        };
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollOffset_getTheChild : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_initWithNode(JSContext *cx, uint32_t argc, jsval *vp)
{
    bool ok = true;
    CCParallaxScrollOffset* cobj = nullptr;

    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx);
    obj.set(args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cobj = (CCParallaxScrollOffset *)(proxy ? proxy->ptr : nullptr);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_initWithNode : Invalid Native Object");
    do {
        if (argc == 4) {
            cocos2d::Node* arg0 = nullptr;
            do {
                if (args.get(0).isNull()) { arg0 = nullptr; break; }
                if (!args.get(0).isObject()) { ok = false; break; }
                js_proxy_t *jsProxy;
                JS::RootedObject tmpObj(cx, args.get(0).toObjectOrNull());
                jsProxy = jsb_get_js_proxy(tmpObj);
                arg0 = (cocos2d::Node*)(jsProxy ? jsProxy->ptr : NULL);
                JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
            } while (0);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg1;
            ok &= jsval_to_ccpoint(cx, args.get(1), &arg1);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg2;
            ok &= jsval_to_ccpoint(cx, args.get(2), &arg2);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg3;
            ok &= jsval_to_ccpoint(cx, args.get(3), &arg3);
            if (!ok) { ok = true; break; }
            CCParallaxScrollOffset* ret = cobj->initWithNode(arg0, arg1, arg2, arg3);
            jsval jsret = JSVAL_NULL;
            if (ret) {
            jsret = OBJECT_TO_JSVAL(js_get_or_create_jsobject<CCParallaxScrollOffset>(cx, (CCParallaxScrollOffset*)ret));
        } else {
            jsret = JSVAL_NULL;
        };
            args.rval().set(jsret);
            return true;
        }
    } while(0);

    do {
        if (argc == 5) {
            cocos2d::Node* arg0 = nullptr;
            do {
                if (args.get(0).isNull()) { arg0 = nullptr; break; }
                if (!args.get(0).isObject()) { ok = false; break; }
                js_proxy_t *jsProxy;
                JS::RootedObject tmpObj(cx, args.get(0).toObjectOrNull());
                jsProxy = jsb_get_js_proxy(tmpObj);
                arg0 = (cocos2d::Node*)(jsProxy ? jsProxy->ptr : NULL);
                JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
            } while (0);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg1;
            ok &= jsval_to_ccpoint(cx, args.get(1), &arg1);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg2;
            ok &= jsval_to_ccpoint(cx, args.get(2), &arg2);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg3;
            ok &= jsval_to_ccpoint(cx, args.get(3), &arg3);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg4;
            ok &= jsval_to_ccpoint(cx, args.get(4), &arg4);
            if (!ok) { ok = true; break; }
            CCParallaxScrollOffset* ret = cobj->initWithNode(arg0, arg1, arg2, arg3, arg4);
            jsval jsret = JSVAL_NULL;
            if (ret) {
            jsret = OBJECT_TO_JSVAL(js_get_or_create_jsobject<CCParallaxScrollOffset>(cx, (CCParallaxScrollOffset*)ret));
        } else {
            jsret = JSVAL_NULL;
        };
            args.rval().set(jsret);
            return true;
        }
    } while(0);

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollOffset_initWithNode : wrong number of arguments");
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_getScrollOffset(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollOffset* cobj = (CCParallaxScrollOffset *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_getScrollOffset : Invalid Native Object");
    if (argc == 0) {
        cocos2d::Point ret = cobj->getScrollOffset();
        jsval jsret = JSVAL_NULL;
        jsret = ccpoint_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollOffset_getScrollOffset : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_init(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollOffset* cobj = (CCParallaxScrollOffset *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_init : Invalid Native Object");
    if (argc == 0) {
        bool ret = cobj->init();
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollOffset_init : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_getRatio(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollOffset* cobj = (CCParallaxScrollOffset *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_getRatio : Invalid Native Object");
    if (argc == 0) {
        cocos2d::Point ret = cobj->getRatio();
        jsval jsret = JSVAL_NULL;
        jsret = ccpoint_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollOffset_getRatio : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_setRatio(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollOffset* cobj = (CCParallaxScrollOffset *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setRatio : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Point arg0;
        ok &= jsval_to_ccpoint(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setRatio : Error processing arguments");
        cobj->setRatio(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setRatio : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_setTheChild(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollOffset* cobj = (CCParallaxScrollOffset *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setTheChild : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Node* arg0 = nullptr;
        do {
            if (args.get(0).isNull()) { arg0 = nullptr; break; }
            if (!args.get(0).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JS::RootedObject tmpObj(cx, args.get(0).toObjectOrNull());
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg0 = (cocos2d::Node*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
        } while (0);
        JSB_PRECONDITION2(ok, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setTheChild : Error processing arguments");
        cobj->setTheChild(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollOffset_setTheChild : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_getBuffer(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollOffset* cobj = (CCParallaxScrollOffset *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollOffset_getBuffer : Invalid Native Object");
    if (argc == 0) {
        cocos2d::Point ret = cobj->getBuffer();
        jsval jsret = JSVAL_NULL;
        jsret = ccpoint_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollOffset_getBuffer : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_scrollWithNode(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    
    do {
        if (argc == 5) {
            cocos2d::Node* arg0 = nullptr;
            do {
                if (args.get(0).isNull()) { arg0 = nullptr; break; }
                if (!args.get(0).isObject()) { ok = false; break; }
                js_proxy_t *jsProxy;
                JS::RootedObject tmpObj(cx, args.get(0).toObjectOrNull());
                jsProxy = jsb_get_js_proxy(tmpObj);
                arg0 = (cocos2d::Node*)(jsProxy ? jsProxy->ptr : NULL);
                JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
            } while (0);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg1;
            ok &= jsval_to_ccpoint(cx, args.get(1), &arg1);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg2;
            ok &= jsval_to_ccpoint(cx, args.get(2), &arg2);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg3;
            ok &= jsval_to_ccpoint(cx, args.get(3), &arg3);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg4;
            ok &= jsval_to_ccpoint(cx, args.get(4), &arg4);
            if (!ok) { ok = true; break; }
            CCParallaxScrollOffset* ret = CCParallaxScrollOffset::scrollWithNode(arg0, arg1, arg2, arg3, arg4);
            jsval jsret = JSVAL_NULL;
            if (ret) {
                jsret = OBJECT_TO_JSVAL(js_get_or_create_jsobject<CCParallaxScrollOffset>(cx, (CCParallaxScrollOffset*)ret));
            } else {
                jsret = JSVAL_NULL;
            };
            args.rval().set(jsret);
            return true;
        }
    } while (0);
    
    do {
        if (argc == 4) {
            cocos2d::Node* arg0 = nullptr;
            do {
                if (args.get(0).isNull()) { arg0 = nullptr; break; }
                if (!args.get(0).isObject()) { ok = false; break; }
                js_proxy_t *jsProxy;
                JS::RootedObject tmpObj(cx, args.get(0).toObjectOrNull());
                jsProxy = jsb_get_js_proxy(tmpObj);
                arg0 = (cocos2d::Node*)(jsProxy ? jsProxy->ptr : NULL);
                JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
            } while (0);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg1;
            ok &= jsval_to_ccpoint(cx, args.get(1), &arg1);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg2;
            ok &= jsval_to_ccpoint(cx, args.get(2), &arg2);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg3;
            ok &= jsval_to_ccpoint(cx, args.get(3), &arg3);
            if (!ok) { ok = true; break; }
            CCParallaxScrollOffset* ret = CCParallaxScrollOffset::scrollWithNode(arg0, arg1, arg2, arg3);
            jsval jsret = JSVAL_NULL;
            if (ret) {
                jsret = OBJECT_TO_JSVAL(js_get_or_create_jsobject<CCParallaxScrollOffset>(cx, (CCParallaxScrollOffset*)ret));
            } else {
                jsret = JSVAL_NULL;
            };
            args.rval().set(jsret);
            return true;
        }
    } while (0);
    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollOffset_scrollWithNode : wrong number of arguments");
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollOffset_create(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {

        auto ret = CCParallaxScrollOffset::create();
        js_type_class_t *typeClass = js_get_type_from_native<CCParallaxScrollOffset>(ret);
        JS::RootedObject jsret(cx, jsb_ref_autoreleased_create_jsobject(cx, ret, typeClass, "CCParallaxScrollOffset"));
        args.rval().set(OBJECT_TO_JSVAL(jsret));
        return true;
    }
    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollOffset_create : wrong number of arguments");
    return false;
}


extern JSObject *jsb_cocos2d_Layer_prototype;

void js_register_CCParallaxScrollNode_CCParallaxScrollOffset(JSContext *cx, JS::HandleObject global) {
    jsb_CCParallaxScrollOffset_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_CCParallaxScrollOffset_class->name = "CCParallaxScrollOffset";
    jsb_CCParallaxScrollOffset_class->addProperty = JS_PropertyStub;
    jsb_CCParallaxScrollOffset_class->delProperty = JS_DeletePropertyStub;
    jsb_CCParallaxScrollOffset_class->getProperty = JS_PropertyStub;
    jsb_CCParallaxScrollOffset_class->setProperty = JS_StrictPropertyStub;
    jsb_CCParallaxScrollOffset_class->enumerate = JS_EnumerateStub;
    jsb_CCParallaxScrollOffset_class->resolve = JS_ResolveStub;
    jsb_CCParallaxScrollOffset_class->convert = JS_ConvertStub;
    jsb_CCParallaxScrollOffset_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("getRelVelocity", js_CCParallaxScrollNode_CCParallaxScrollOffset_getRelVelocity, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setScrollOffset", js_CCParallaxScrollNode_CCParallaxScrollOffset_setScrollOffset, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setRelVelocity", js_CCParallaxScrollNode_CCParallaxScrollOffset_setRelVelocity, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setBuffer", js_CCParallaxScrollNode_CCParallaxScrollOffset_setBuffer, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getOrigPosition", js_CCParallaxScrollNode_CCParallaxScrollOffset_getOrigPosition, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setOrigPosition", js_CCParallaxScrollNode_CCParallaxScrollOffset_setOrigPosition, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getTheChild", js_CCParallaxScrollNode_CCParallaxScrollOffset_getTheChild, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("initWithNode", js_CCParallaxScrollNode_CCParallaxScrollOffset_initWithNode, 4, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getScrollOffset", js_CCParallaxScrollNode_CCParallaxScrollOffset_getScrollOffset, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("init", js_CCParallaxScrollNode_CCParallaxScrollOffset_init, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getRatio", js_CCParallaxScrollNode_CCParallaxScrollOffset_getRatio, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setRatio", js_CCParallaxScrollNode_CCParallaxScrollOffset_setRatio, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setTheChild", js_CCParallaxScrollNode_CCParallaxScrollOffset_setTheChild, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getBuffer", js_CCParallaxScrollNode_CCParallaxScrollOffset_getBuffer, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("scrollWithNode", js_CCParallaxScrollNode_CCParallaxScrollOffset_scrollWithNode, 4, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("create", js_CCParallaxScrollNode_CCParallaxScrollOffset_create, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    JS::RootedObject parent_proto(cx, jsb_cocos2d_Layer_prototype);
    jsb_CCParallaxScrollOffset_prototype = JS_InitClass(
        cx, global,
        parent_proto,
        jsb_CCParallaxScrollOffset_class,
        dummy_constructor<CCParallaxScrollOffset>, 0, // no constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);

    JS::RootedObject proto(cx, jsb_CCParallaxScrollOffset_prototype);
    JS::RootedValue className(cx, std_string_to_jsval(cx, "CCParallaxScrollOffset"));
    JS_SetProperty(cx, proto, "_className", className);
    JS_SetProperty(cx, proto, "__nativeObj", JS::TrueHandleValue);
    JS_SetProperty(cx, proto, "__is_ref", JS::TrueHandleValue);
    // add the proto and JSClass to the type->js info hash table
    jsb_register_class<CCParallaxScrollOffset>(cx, jsb_CCParallaxScrollOffset_class, proto, parent_proto);
}

JSClass  *jsb_CCParallaxScrollNode_class;
JSObject *jsb_CCParallaxScrollNode_prototype;

bool js_CCParallaxScrollNode_CCParallaxScrollNode_addChild(JSContext *cx, uint32_t argc, jsval *vp)
{
    bool ok = true;
    CCParallaxScrollNode* cobj = nullptr;

    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx);
    obj.set(args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cobj = (CCParallaxScrollNode *)(proxy ? proxy->ptr : nullptr);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollNode_addChild : Invalid Native Object");
    do {
        if (argc == 6) {
            cocos2d::Sprite* arg0 = nullptr;
            do {
                if (args.get(0).isNull()) { arg0 = nullptr; break; }
                if (!args.get(0).isObject()) { ok = false; break; }
                js_proxy_t *jsProxy;
                JS::RootedObject tmpObj(cx, args.get(0).toObjectOrNull());
                jsProxy = jsb_get_js_proxy(tmpObj);
                arg0 = (cocos2d::Sprite*)(jsProxy ? jsProxy->ptr : NULL);
                JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
            } while (0);
            if (!ok) { ok = true; break; }
            int arg1 = 0;
            ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg2;
            ok &= jsval_to_ccpoint(cx, args.get(2), &arg2);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg3;
            ok &= jsval_to_ccpoint(cx, args.get(3), &arg3);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg4;
            ok &= jsval_to_ccpoint(cx, args.get(4), &arg4);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg5;
            ok &= jsval_to_ccpoint(cx, args.get(5), &arg5);
            if (!ok) { ok = true; break; }
            cobj->addChild(arg0, arg1, arg2, arg3, arg4, arg5);
            args.rval().setUndefined();
            return true;
        }
    } while(0);

    do {
        if (argc == 5) {
            cocos2d::Sprite* arg0 = nullptr;
            do {
                if (args.get(0).isNull()) { arg0 = nullptr; break; }
                if (!args.get(0).isObject()) { ok = false; break; }
                js_proxy_t *jsProxy;
                JS::RootedObject tmpObj(cx, args.get(0).toObjectOrNull());
                jsProxy = jsb_get_js_proxy(tmpObj);
                arg0 = (cocos2d::Sprite*)(jsProxy ? jsProxy->ptr : NULL);
                JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
            } while (0);
            if (!ok) { ok = true; break; }
            int arg1 = 0;
            ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg2;
            ok &= jsval_to_ccpoint(cx, args.get(2), &arg2);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg3;
            ok &= jsval_to_ccpoint(cx, args.get(3), &arg3);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg4;
            ok &= jsval_to_ccpoint(cx, args.get(4), &arg4);
            if (!ok) { ok = true; break; }
            cobj->addChild(arg0, arg1, arg2, arg3, arg4);
            args.rval().setUndefined();
            return true;
        }
    } while(0);

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollNode_addChild : wrong number of arguments");
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollNode_updateWithYPosition(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollNode* cobj = (CCParallaxScrollNode *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollNode_updateWithYPosition : Invalid Native Object");
    if (argc == 2) {
        double arg0 = 0;
        double arg1 = 0;
        ok &= JS::ToNumber( cx, args.get(0), &arg0) && !std::isnan(arg0);
        ok &= JS::ToNumber( cx, args.get(1), &arg1) && !std::isnan(arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollNode_updateWithYPosition : Error processing arguments");
        cobj->updateWithYPosition(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollNode_updateWithYPosition : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollNode_removeChild(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollNode* cobj = (CCParallaxScrollNode *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollNode_removeChild : Invalid Native Object");
    if (argc == 2) {
        cocos2d::Sprite* arg0 = nullptr;
        bool arg1;
        do {
            if (args.get(0).isNull()) { arg0 = nullptr; break; }
            if (!args.get(0).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JS::RootedObject tmpObj(cx, args.get(0).toObjectOrNull());
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg0 = (cocos2d::Sprite*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
        } while (0);
        arg1 = JS::ToBoolean(args.get(1));
        JSB_PRECONDITION2(ok, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollNode_removeChild : Error processing arguments");
        cobj->removeChild(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollNode_removeChild : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollNode_init(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollNode* cobj = (CCParallaxScrollNode *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollNode_init : Invalid Native Object");
    if (argc == 0) {
        bool ret = cobj->init();
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollNode_init : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollNode_updateWithVelocity(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCParallaxScrollNode* cobj = (CCParallaxScrollNode *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollNode_updateWithVelocity : Invalid Native Object");
    if (argc == 2) {
        cocos2d::Point arg0;
        double arg1 = 0;
        ok &= jsval_to_ccpoint(cx, args.get(0), &arg0);
        ok &= JS::ToNumber( cx, args.get(1), &arg1) && !std::isnan(arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollNode_updateWithVelocity : Error processing arguments");
        cobj->updateWithVelocity(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollNode_updateWithVelocity : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollNode_addInfiniteScrollWithObjects(JSContext *cx, uint32_t argc, jsval *vp)
{
    bool ok = true;
    CCParallaxScrollNode* cobj = nullptr;

    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx);
    obj.set(args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cobj = (CCParallaxScrollNode *)(proxy ? proxy->ptr : nullptr);
    JSB_PRECONDITION2( cobj, cx, false, "js_CCParallaxScrollNode_CCParallaxScrollNode_addInfiniteScrollWithObjects : Invalid Native Object");
    do {
        if (argc == 6) {
            cocos2d::Vector<cocos2d::Sprite *> arg0;
            ok &= jsval_to_ccvector(cx, args.get(0), &arg0);
            if (!ok) { ok = true; break; }
            int arg1 = 0;
            ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg2;
            ok &= jsval_to_ccpoint(cx, args.get(2), &arg2);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg3;
            ok &= jsval_to_ccpoint(cx, args.get(3), &arg3);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg4;
            ok &= jsval_to_ccpoint(cx, args.get(4), &arg4);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg5;
            ok &= jsval_to_ccpoint(cx, args.get(5), &arg5);
            if (!ok) { ok = true; break; }
            cobj->addInfiniteScrollWithObjects(arg0, arg1, arg2, arg3, arg4, arg5);
            args.rval().setUndefined();
            return true;
        }
    } while(0);

    do {
        if (argc == 5) {
            cocos2d::Vector<cocos2d::Sprite *> arg0;
            ok &= jsval_to_ccvector(cx, args.get(0), &arg0);
            if (!ok) { ok = true; break; }
            int arg1 = 0;
            ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg2;
            ok &= jsval_to_ccpoint(cx, args.get(2), &arg2);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg3;
            ok &= jsval_to_ccpoint(cx, args.get(3), &arg3);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg4;
            ok &= jsval_to_ccpoint(cx, args.get(4), &arg4);
            if (!ok) { ok = true; break; }
            cobj->addInfiniteScrollWithObjects(arg0, arg1, arg2, arg3, arg4);
            args.rval().setUndefined();
            return true;
        }
    } while(0);

    do {
        if (argc == 7) {
            cocos2d::Vector<cocos2d::Sprite *> arg0;
            ok &= jsval_to_ccvector(cx, args.get(0), &arg0);
            if (!ok) { ok = true; break; }
            int arg1 = 0;
            ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg2;
            ok &= jsval_to_ccpoint(cx, args.get(2), &arg2);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg3;
            ok &= jsval_to_ccpoint(cx, args.get(3), &arg3);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg4;
            ok &= jsval_to_ccpoint(cx, args.get(4), &arg4);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg5;
            ok &= jsval_to_ccpoint(cx, args.get(5), &arg5);
            if (!ok) { ok = true; break; }
            cocos2d::Point arg6;
            ok &= jsval_to_ccpoint(cx, args.get(6), &arg6);
            if (!ok) { ok = true; break; }
            cobj->addInfiniteScrollWithObjects(arg0, arg1, arg2, arg3, arg4, arg5, arg6);
            args.rval().setUndefined();
            return true;
        }
    } while(0);

    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollNode_addInfiniteScrollWithObjects : wrong number of arguments");
    return false;
}
bool js_CCParallaxScrollNode_CCParallaxScrollNode_create(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {

        auto ret = CCParallaxScrollNode::create();
        js_type_class_t *typeClass = js_get_type_from_native<CCParallaxScrollNode>(ret);
        JS::RootedObject jsret(cx, jsb_ref_autoreleased_create_jsobject(cx, ret, typeClass, "CCParallaxScrollNode"));
        args.rval().set(OBJECT_TO_JSVAL(jsret));
        return true;
    }
    JS_ReportError(cx, "js_CCParallaxScrollNode_CCParallaxScrollNode_create : wrong number of arguments");
    return false;
}


extern JSObject *jsb_cocos2d_Layer_prototype;

void js_register_CCParallaxScrollNode_CCParallaxScrollNode(JSContext *cx, JS::HandleObject global) {
    jsb_CCParallaxScrollNode_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_CCParallaxScrollNode_class->name = "CCParallaxScrollNode";
    jsb_CCParallaxScrollNode_class->addProperty = JS_PropertyStub;
    jsb_CCParallaxScrollNode_class->delProperty = JS_DeletePropertyStub;
    jsb_CCParallaxScrollNode_class->getProperty = JS_PropertyStub;
    jsb_CCParallaxScrollNode_class->setProperty = JS_StrictPropertyStub;
    jsb_CCParallaxScrollNode_class->enumerate = JS_EnumerateStub;
    jsb_CCParallaxScrollNode_class->resolve = JS_ResolveStub;
    jsb_CCParallaxScrollNode_class->convert = JS_ConvertStub;
    jsb_CCParallaxScrollNode_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("addChild", js_CCParallaxScrollNode_CCParallaxScrollNode_addChild, 5, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("updateWithYPosition", js_CCParallaxScrollNode_CCParallaxScrollNode_updateWithYPosition, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("removeChild", js_CCParallaxScrollNode_CCParallaxScrollNode_removeChild, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("init", js_CCParallaxScrollNode_CCParallaxScrollNode_init, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("updateWithVelocity", js_CCParallaxScrollNode_CCParallaxScrollNode_updateWithVelocity, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("addInfiniteScrollWithObjects", js_CCParallaxScrollNode_CCParallaxScrollNode_addInfiniteScrollWithObjects, 5, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("create", js_CCParallaxScrollNode_CCParallaxScrollNode_create, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    JS::RootedObject parent_proto(cx, jsb_cocos2d_Layer_prototype);
    jsb_CCParallaxScrollNode_prototype = JS_InitClass(
        cx, global,
        parent_proto,
        jsb_CCParallaxScrollNode_class,
        dummy_constructor<CCParallaxScrollNode>, 0, // no constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);

    JS::RootedObject proto(cx, jsb_CCParallaxScrollNode_prototype);
    JS::RootedValue className(cx, std_string_to_jsval(cx, "CCParallaxScrollNode"));
    JS_SetProperty(cx, proto, "_className", className);
    JS_SetProperty(cx, proto, "__nativeObj", JS::TrueHandleValue);
    JS_SetProperty(cx, proto, "__is_ref", JS::TrueHandleValue);
    // add the proto and JSClass to the type->js info hash table
    jsb_register_class<CCParallaxScrollNode>(cx, jsb_CCParallaxScrollNode_class, proto, parent_proto);
}

void register_all_CCParallaxScrollNode(JSContext* cx, JS::HandleObject obj) {
    // Get the ns
    JS::RootedObject ns(cx);
    get_or_create_js_obj(cx, obj, "cc", &ns);

    js_register_CCParallaxScrollNode_CCParallaxScrollNode(cx, ns);
    js_register_CCParallaxScrollNode_CCParallaxScrollOffset(cx, ns);
}

