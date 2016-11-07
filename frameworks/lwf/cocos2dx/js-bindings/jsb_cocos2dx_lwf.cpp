#include "jsb_cocos2dx_lwf.hpp"
#include "scripting/js-bindings/manual/cocos2d_specifics.hpp"
#include "lwf.h"
#include "lwf_cocos2dx.h"
#include "LWFSprite.h"

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
JSClass  *jsb_cocos2d_LWFBitmap_class;
JSObject *jsb_cocos2d_LWFBitmap_prototype;

bool js_cocos2dx_lwf_LWFBitmap_GetBitmap(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::LWFBitmap* cobj = (cocos2d::LWFBitmap *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_lwf_LWFBitmap_GetBitmap : Invalid Native Object");
    if (argc == 0) {
        LWF::Bitmap* ret = cobj->GetBitmap();
        jsval jsret = JSVAL_NULL;
        if (ret) {
            jsret = OBJECT_TO_JSVAL(js_get_or_create_jsobject<LWF::Bitmap>(cx, (LWF::Bitmap*)ret));
        } else {
            jsret = JSVAL_NULL;
        };
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_lwf_LWFBitmap_GetBitmap : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_lwf_LWFBitmap_GetBitmapEx(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::LWFBitmap* cobj = (cocos2d::LWFBitmap *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_lwf_LWFBitmap_GetBitmapEx : Invalid Native Object");
    if (argc == 0) {
        LWF::BitmapEx* ret = cobj->GetBitmapEx();
        jsval jsret = JSVAL_NULL;
        if (ret) {
            jsret = OBJECT_TO_JSVAL(js_get_or_create_jsobject<LWF::BitmapEx>(cx, (LWF::BitmapEx*)ret));
        } else {
            jsret = JSVAL_NULL;
        };
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_lwf_LWFBitmap_GetBitmapEx : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}

extern JSObject *jsb_cocos2d_Sprite_prototype;

void js_register_cocos2dx_lwf_LWFBitmap(JSContext *cx, JS::HandleObject global) {
    jsb_cocos2d_LWFBitmap_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_cocos2d_LWFBitmap_class->name = "LWFBitmap";
    jsb_cocos2d_LWFBitmap_class->addProperty = JS_PropertyStub;
    jsb_cocos2d_LWFBitmap_class->delProperty = JS_DeletePropertyStub;
    jsb_cocos2d_LWFBitmap_class->getProperty = JS_PropertyStub;
    jsb_cocos2d_LWFBitmap_class->setProperty = JS_StrictPropertyStub;
    jsb_cocos2d_LWFBitmap_class->enumerate = JS_EnumerateStub;
    jsb_cocos2d_LWFBitmap_class->resolve = JS_ResolveStub;
    jsb_cocos2d_LWFBitmap_class->convert = JS_ConvertStub;
    jsb_cocos2d_LWFBitmap_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("GetBitmap", js_cocos2dx_lwf_LWFBitmap_GetBitmap, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("GetBitmapEx", js_cocos2dx_lwf_LWFBitmap_GetBitmapEx, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    JSFunctionSpec *st_funcs = NULL;

    JS::RootedObject parent_proto(cx, jsb_cocos2d_Sprite_prototype);
    jsb_cocos2d_LWFBitmap_prototype = JS_InitClass(
        cx, global,
        parent_proto,
        jsb_cocos2d_LWFBitmap_class,
        empty_constructor, 0,
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);

    JS::RootedObject proto(cx, jsb_cocos2d_LWFBitmap_prototype);
    JS::RootedValue className(cx, std_string_to_jsval(cx, "LWFBitmap"));
    JS_SetProperty(cx, proto, "_className", className);
    JS_SetProperty(cx, proto, "__nativeObj", JS::TrueHandleValue);
    JS_SetProperty(cx, proto, "__is_ref", JS::TrueHandleValue);
    // add the proto and JSClass to the type->js info hash table
    jsb_register_class<cocos2d::LWFBitmap>(cx, jsb_cocos2d_LWFBitmap_class, proto, parent_proto);
}

JSClass  *jsb_cocos2d_LWFNode_class;
JSObject *jsb_cocos2d_LWFNode_prototype;

bool js_cocos2dx_lwf_LWFNode_isDestructed(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::LWFNode* cobj = (cocos2d::LWFNode *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_lwf_LWFNode_isDestructed : Invalid Native Object");
    if (argc == 0) {
        bool ret = cobj->isDestructed();
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_lwf_LWFNode_isDestructed : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_lwf_LWFNode_getTextureLoadHandler(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::LWFNode* cobj = (cocos2d::LWFNode *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_lwf_LWFNode_getTextureLoadHandler : Invalid Native Object");
    if (argc == 0) {
        LWF::TextureLoadHandler ret = cobj->getTextureLoadHandler();
        jsval jsret = JSVAL_NULL;
        #pragma warning NO CONVERSION FROM NATIVE FOR std::function;
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_lwf_LWFNode_getTextureLoadHandler : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_lwf_LWFNode_handleTouch(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::LWFNode* cobj = (cocos2d::LWFNode *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_lwf_LWFNode_handleTouch : Invalid Native Object");
    if (argc == 2) {
        cocos2d::Touch* arg0 = nullptr;
        cocos2d::Event* arg1 = nullptr;
        do {
            if (args.get(0).isNull()) { arg0 = nullptr; break; }
            if (!args.get(0).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JS::RootedObject tmpObj(cx, args.get(0).toObjectOrNull());
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg0 = (cocos2d::Touch*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
        } while (0);
        do {
            if (args.get(1).isNull()) { arg1 = nullptr; break; }
            if (!args.get(1).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JS::RootedObject tmpObj(cx, args.get(1).toObjectOrNull());
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg1 = (cocos2d::Event*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg1, cx, false, "Invalid Native Object");
        } while (0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_lwf_LWFNode_handleTouch : Error processing arguments");
        bool ret = cobj->handleTouch(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_lwf_LWFNode_handleTouch : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_cocos2dx_lwf_LWFNode_getNodeHandlers(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::LWFNode* cobj = (cocos2d::LWFNode *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_lwf_LWFNode_getNodeHandlers : Invalid Native Object");
    if (argc == 0) {
        const cocos2d::LWFNodeHandlers& ret = cobj->getNodeHandlers();
        jsval jsret = JSVAL_NULL;
        #pragma warning NO CONVERSION FROM NATIVE FOR LWFNodeHandlers;
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_lwf_LWFNode_getNodeHandlers : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_lwf_LWFNode_requestRemoveFromParent(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::LWFNode* cobj = (cocos2d::LWFNode *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_lwf_LWFNode_requestRemoveFromParent : Invalid Native Object");
    if (argc == 0) {
        cobj->requestRemoveFromParent();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_lwf_LWFNode_requestRemoveFromParent : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_lwf_LWFNode_removeNodeFromParent(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
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
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_lwf_LWFNode_removeNodeFromParent : Error processing arguments");
        cocos2d::LWFNode::removeNodeFromParent(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_lwf_LWFNode_removeNodeFromParent : wrong number of arguments");
    return false;
}

bool js_cocos2dx_lwf_LWFNode_dump(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        cocos2d::LWFNode::dump();
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_lwf_LWFNode_dump : wrong number of arguments");
    return false;
}

bool js_cocos2dx_lwf_LWFNode_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    cocos2d::LWFNode* cobj = new (std::nothrow) cocos2d::LWFNode();

    js_type_class_t *typeClass = js_get_type_from_native<cocos2d::LWFNode>(cobj);

    // link the native object with the javascript object
    JS::RootedObject jsobj(cx, jsb_ref_create_jsobject(cx, cobj, typeClass, "cocos2d::LWFNode"));
    args.rval().set(OBJECT_TO_JSVAL(jsobj));
    if (JS_HasProperty(cx, jsobj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(jsobj), "_ctor", args);
    return true;
}


extern JSObject *jsb_cocos2d_Sprite_prototype;

void js_register_cocos2dx_lwf_LWFNode(JSContext *cx, JS::HandleObject global) {
    jsb_cocos2d_LWFNode_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_cocos2d_LWFNode_class->name = "LWFNode";
    jsb_cocos2d_LWFNode_class->addProperty = JS_PropertyStub;
    jsb_cocos2d_LWFNode_class->delProperty = JS_DeletePropertyStub;
    jsb_cocos2d_LWFNode_class->getProperty = JS_PropertyStub;
    jsb_cocos2d_LWFNode_class->setProperty = JS_StrictPropertyStub;
    jsb_cocos2d_LWFNode_class->enumerate = JS_EnumerateStub;
    jsb_cocos2d_LWFNode_class->resolve = JS_ResolveStub;
    jsb_cocos2d_LWFNode_class->convert = JS_ConvertStub;
    jsb_cocos2d_LWFNode_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("isDestructed", js_cocos2dx_lwf_LWFNode_isDestructed, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getTextureLoadHandler", js_cocos2dx_lwf_LWFNode_getTextureLoadHandler, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("handleTouch", js_cocos2dx_lwf_LWFNode_handleTouch, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getNodeHandlers", js_cocos2dx_lwf_LWFNode_getNodeHandlers, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("requestRemoveFromParent", js_cocos2dx_lwf_LWFNode_requestRemoveFromParent, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("removeNodeFromParent", js_cocos2dx_lwf_LWFNode_removeNodeFromParent, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("dump", js_cocos2dx_lwf_LWFNode_dump, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    JS::RootedObject parent_proto(cx, jsb_cocos2d_Sprite_prototype);
    jsb_cocos2d_LWFNode_prototype = JS_InitClass(
        cx, global,
        parent_proto,
        jsb_cocos2d_LWFNode_class,
        js_cocos2dx_lwf_LWFNode_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);

    JS::RootedObject proto(cx, jsb_cocos2d_LWFNode_prototype);
    JS::RootedValue className(cx, std_string_to_jsval(cx, "LWFNode"));
    JS_SetProperty(cx, proto, "_className", className);
    JS_SetProperty(cx, proto, "__nativeObj", JS::TrueHandleValue);
    JS_SetProperty(cx, proto, "__is_ref", JS::TrueHandleValue);
    // add the proto and JSClass to the type->js info hash table
    jsb_register_class<cocos2d::LWFNode>(cx, jsb_cocos2d_LWFNode_class, proto, parent_proto);
}

JSClass  *jsb_h102_LWFSprite_class;
JSObject *jsb_h102_LWFSprite_prototype;

bool js_cocos2dx_lwf_LWFSprite_create(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        std::string arg0;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_lwf_LWFSprite_create : Error processing arguments");

        auto ret = h102::LWFSprite::create(arg0);
        js_type_class_t *typeClass = js_get_type_from_native<h102::LWFSprite>(ret);
        JS::RootedObject jsret(cx, jsb_ref_autoreleased_create_jsobject(cx, ret, typeClass, "h102::LWFSprite"));
        args.rval().set(OBJECT_TO_JSVAL(jsret));
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_lwf_LWFSprite_create : wrong number of arguments");
    return false;
}

bool js_cocos2dx_lwf_LWFSprite_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    h102::LWFSprite* cobj = new (std::nothrow) h102::LWFSprite();

    js_type_class_t *typeClass = js_get_type_from_native<h102::LWFSprite>(cobj);

    // link the native object with the javascript object
    JS::RootedObject jsobj(cx, jsb_ref_create_jsobject(cx, cobj, typeClass, "h102::LWFSprite"));
    args.rval().set(OBJECT_TO_JSVAL(jsobj));
    if (JS_HasProperty(cx, jsobj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(jsobj), "_ctor", args);
    return true;
}


extern JSObject *jsb_cocos2d_LWFNode_prototype;

void js_register_cocos2dx_lwf_LWFSprite(JSContext *cx, JS::HandleObject global) {
    jsb_h102_LWFSprite_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_h102_LWFSprite_class->name = "LWFSprite";
    jsb_h102_LWFSprite_class->addProperty = JS_PropertyStub;
    jsb_h102_LWFSprite_class->delProperty = JS_DeletePropertyStub;
    jsb_h102_LWFSprite_class->getProperty = JS_PropertyStub;
    jsb_h102_LWFSprite_class->setProperty = JS_StrictPropertyStub;
    jsb_h102_LWFSprite_class->enumerate = JS_EnumerateStub;
    jsb_h102_LWFSprite_class->resolve = JS_ResolveStub;
    jsb_h102_LWFSprite_class->convert = JS_ConvertStub;
    jsb_h102_LWFSprite_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("create", js_cocos2dx_lwf_LWFSprite_create, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    JS::RootedObject parent_proto(cx, jsb_cocos2d_LWFNode_prototype);
    jsb_h102_LWFSprite_prototype = JS_InitClass(
        cx, global,
        parent_proto,
        jsb_h102_LWFSprite_class,
        js_cocos2dx_lwf_LWFSprite_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);

    JS::RootedObject proto(cx, jsb_h102_LWFSprite_prototype);
    JS::RootedValue className(cx, std_string_to_jsval(cx, "LWFSprite"));
    JS_SetProperty(cx, proto, "_className", className);
    JS_SetProperty(cx, proto, "__nativeObj", JS::TrueHandleValue);
    JS_SetProperty(cx, proto, "__is_ref", JS::TrueHandleValue);
    // add the proto and JSClass to the type->js info hash table
    jsb_register_class<h102::LWFSprite>(cx, jsb_h102_LWFSprite_class, proto, parent_proto);
}

void register_all_cocos2dx_lwf(JSContext* cx, JS::HandleObject obj) {
    // Get the ns
    JS::RootedObject ns(cx);
    get_or_create_js_obj(cx, obj, "cc", &ns);

    js_register_cocos2dx_lwf_LWFBitmap(cx, ns);
    js_register_cocos2dx_lwf_LWFNode(cx, ns);
    js_register_cocos2dx_lwf_LWFSprite(cx, ns);
}

