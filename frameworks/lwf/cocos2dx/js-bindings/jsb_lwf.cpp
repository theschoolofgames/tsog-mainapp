#include "jsb_lwf.hpp"
#include "cocos2d_specifics.hpp"
#include "lwf.h"
#include "lwf_cocos2dx.h"
#include "LWFSprite.h"

template<class T>
static bool dummy_constructor(JSContext *cx, uint32_t argc, jsval *vp) {
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedValue initializing(cx);
    bool isNewValid = true;
    JS::RootedObject global(cx, ScriptingCore::getInstance()->getGlobalObject());
    isNewValid = JS_GetProperty(cx, global, "initializing", &initializing) && initializing.toBoolean();
    if (isNewValid)
    {
        TypeTest<T> t;
        js_type_class_t *typeClass = nullptr;
        std::string typeName = t.s_name();
        auto typeMapIter = _js_global_type_map.find(typeName);
        CCASSERT(typeMapIter != _js_global_type_map.end(), "Can't find the class type!");
        typeClass = typeMapIter->second;
        CCASSERT(typeClass, "The value is null.");

        JS::RootedObject proto(cx, typeClass->proto.get());
        JS::RootedObject parent(cx, typeClass->parentProto.get());
        JS::RootedObject _tmp(cx, JS_NewObject(cx, typeClass->jsclass, proto, parent));
        
        args.rval().set(OBJECT_TO_JSVAL(_tmp));
        return true;
    }

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

bool js_lwf_LWFBitmap_GetBitmap(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::LWFBitmap* cobj = (cocos2d::LWFBitmap *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_lwf_LWFBitmap_GetBitmap : Invalid Native Object");
    if (argc == 0) {
        LWF::Bitmap* ret = cobj->GetBitmap();
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<LWF::Bitmap>(cx, (LWF::Bitmap*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_lwf_LWFBitmap_GetBitmap : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_lwf_LWFBitmap_GetBitmapEx(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::LWFBitmap* cobj = (cocos2d::LWFBitmap *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_lwf_LWFBitmap_GetBitmapEx : Invalid Native Object");
    if (argc == 0) {
        LWF::BitmapEx* ret = cobj->GetBitmapEx();
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<LWF::BitmapEx>(cx, (LWF::BitmapEx*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_lwf_LWFBitmap_GetBitmapEx : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}

extern JSObject *jsb_cocos2d_Sprite_prototype;

void js_cocos2d_LWFBitmap_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (LWFBitmap)", obj);
}

void js_register_lwf_LWFBitmap(JSContext *cx, JS::HandleObject global) {
    jsb_cocos2d_LWFBitmap_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_cocos2d_LWFBitmap_class->name = "Bitmap";
    jsb_cocos2d_LWFBitmap_class->addProperty = JS_PropertyStub;
    jsb_cocos2d_LWFBitmap_class->delProperty = JS_DeletePropertyStub;
    jsb_cocos2d_LWFBitmap_class->getProperty = JS_PropertyStub;
    jsb_cocos2d_LWFBitmap_class->setProperty = JS_StrictPropertyStub;
    jsb_cocos2d_LWFBitmap_class->enumerate = JS_EnumerateStub;
    jsb_cocos2d_LWFBitmap_class->resolve = JS_ResolveStub;
    jsb_cocos2d_LWFBitmap_class->convert = JS_ConvertStub;
    jsb_cocos2d_LWFBitmap_class->finalize = js_cocos2d_LWFBitmap_finalize;
    jsb_cocos2d_LWFBitmap_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("GetBitmap", js_lwf_LWFBitmap_GetBitmap, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("GetBitmapEx", js_lwf_LWFBitmap_GetBitmapEx, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    JSFunctionSpec *st_funcs = NULL;

    jsb_cocos2d_LWFBitmap_prototype = JS_InitClass(
        cx, global,
        JS::RootedObject(cx, jsb_cocos2d_Sprite_prototype),
        jsb_cocos2d_LWFBitmap_class,
        empty_constructor, 0,
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "Bitmap", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<cocos2d::LWFBitmap> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_cocos2d_LWFBitmap_class;
        p->proto = jsb_cocos2d_LWFBitmap_prototype;
        p->parentProto = jsb_cocos2d_Sprite_prototype;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_cocos2d_LWFNode_class;
JSObject *jsb_cocos2d_LWFNode_prototype;

bool js_lwf_LWFNode_isDestructed(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::LWFNode* cobj = (cocos2d::LWFNode *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_lwf_LWFNode_isDestructed : Invalid Native Object");
    if (argc == 0) {
        bool ret = cobj->isDestructed();
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_lwf_LWFNode_isDestructed : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_lwf_LWFNode_getTextureLoadHandler(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::LWFNode* cobj = (cocos2d::LWFNode *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_lwf_LWFNode_getTextureLoadHandler : Invalid Native Object");
    if (argc == 0) {
        LWF::TextureLoadHandler ret = cobj->getTextureLoadHandler();
        jsval jsret = JSVAL_NULL;
        #pragma warning NO CONVERSION FROM NATIVE FOR std::function;
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_lwf_LWFNode_getTextureLoadHandler : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_lwf_LWFNode_handleTouch(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::LWFNode* cobj = (cocos2d::LWFNode *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_lwf_LWFNode_handleTouch : Invalid Native Object");
    if (argc == 2) {
        cocos2d::Touch* arg0;
        cocos2d::Event* arg1;
        do {
            if (args.get(0).isNull()) { arg0 = nullptr; break; }
            if (!args.get(0).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JSObject *tmpObj = args.get(0).toObjectOrNull();
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg0 = (cocos2d::Touch*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
        } while (0);
        do {
            if (args.get(1).isNull()) { arg1 = nullptr; break; }
            if (!args.get(1).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JSObject *tmpObj = args.get(1).toObjectOrNull();
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg1 = (cocos2d::Event*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg1, cx, false, "Invalid Native Object");
        } while (0);
        JSB_PRECONDITION2(ok, cx, false, "js_lwf_LWFNode_handleTouch : Error processing arguments");
        bool ret = cobj->handleTouch(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_lwf_LWFNode_handleTouch : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_lwf_LWFNode_getNodeHandlers(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::LWFNode* cobj = (cocos2d::LWFNode *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_lwf_LWFNode_getNodeHandlers : Invalid Native Object");
    if (argc == 0) {
        const cocos2d::LWFNodeHandlers& ret = cobj->getNodeHandlers();
        jsval jsret = JSVAL_NULL;
        #pragma warning NO CONVERSION FROM NATIVE FOR LWFNodeHandlers;
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_lwf_LWFNode_getNodeHandlers : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_lwf_LWFNode_requestRemoveFromParent(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::LWFNode* cobj = (cocos2d::LWFNode *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_lwf_LWFNode_requestRemoveFromParent : Invalid Native Object");
    if (argc == 0) {
        cobj->requestRemoveFromParent();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_lwf_LWFNode_requestRemoveFromParent : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_lwf_LWFNode_removeNodeFromParent(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        cocos2d::Node* arg0;
        do {
            if (args.get(0).isNull()) { arg0 = nullptr; break; }
            if (!args.get(0).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JSObject *tmpObj = args.get(0).toObjectOrNull();
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg0 = (cocos2d::Node*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
        } while (0);
        JSB_PRECONDITION2(ok, cx, false, "js_lwf_LWFNode_removeNodeFromParent : Error processing arguments");
        cocos2d::LWFNode::removeNodeFromParent(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_lwf_LWFNode_removeNodeFromParent : wrong number of arguments");
    return false;
}

bool js_lwf_LWFNode_dump(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        cocos2d::LWFNode::dump();
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_lwf_LWFNode_dump : wrong number of arguments");
    return false;
}

bool js_lwf_LWFNode_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    cocos2d::LWFNode* cobj = new (std::nothrow) cocos2d::LWFNode();
    cocos2d::Ref *_ccobj = dynamic_cast<cocos2d::Ref *>(cobj);
    if (_ccobj) {
        _ccobj->autorelease();
    }
    TypeTest<cocos2d::LWFNode> t;
    js_type_class_t *typeClass = nullptr;
    std::string typeName = t.s_name();
    auto typeMapIter = _js_global_type_map.find(typeName);
    CCASSERT(typeMapIter != _js_global_type_map.end(), "Can't find the class type!");
    typeClass = typeMapIter->second;
    CCASSERT(typeClass, "The value is null.");
    // JSObject *obj = JS_NewObject(cx, typeClass->jsclass, typeClass->proto, typeClass->parentProto);
    JS::RootedObject proto(cx, typeClass->proto.get());
    JS::RootedObject parent(cx, typeClass->parentProto.get());
    JS::RootedObject obj(cx, JS_NewObject(cx, typeClass->jsclass, proto, parent));
    args.rval().set(OBJECT_TO_JSVAL(obj));
    // link the native object with the javascript object
    js_proxy_t* p = jsb_new_proxy(cobj, obj);
    AddNamedObjectRoot(cx, &p->obj, "cocos2d::LWFNode");
    if (JS_HasProperty(cx, obj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(obj), "_ctor", args);
    return true;
}


extern JSObject *jsb_cocos2d_Sprite_prototype;

void js_cocos2d_LWFNode_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (LWFNode)", obj);
}

static bool js_cocos2d_LWFNode_ctor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    cocos2d::LWFNode *nobj = new (std::nothrow) cocos2d::LWFNode();
    if (nobj) {
        nobj->autorelease();
    }
    js_proxy_t* p = jsb_new_proxy(nobj, obj);
    AddNamedObjectRoot(cx, &p->obj, "cocos2d::LWFNode");
    bool isFound = false;
    if (JS_HasProperty(cx, obj, "_ctor", &isFound) && isFound)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(obj), "_ctor", args);
    args.rval().setUndefined();
    return true;
}
void js_register_lwf_LWFNode(JSContext *cx, JS::HandleObject global) {
    jsb_cocos2d_LWFNode_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_cocos2d_LWFNode_class->name = "Node";
    jsb_cocos2d_LWFNode_class->addProperty = JS_PropertyStub;
    jsb_cocos2d_LWFNode_class->delProperty = JS_DeletePropertyStub;
    jsb_cocos2d_LWFNode_class->getProperty = JS_PropertyStub;
    jsb_cocos2d_LWFNode_class->setProperty = JS_StrictPropertyStub;
    jsb_cocos2d_LWFNode_class->enumerate = JS_EnumerateStub;
    jsb_cocos2d_LWFNode_class->resolve = JS_ResolveStub;
    jsb_cocos2d_LWFNode_class->convert = JS_ConvertStub;
    jsb_cocos2d_LWFNode_class->finalize = js_cocos2d_LWFNode_finalize;
    jsb_cocos2d_LWFNode_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("isDestructed", js_lwf_LWFNode_isDestructed, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getTextureLoadHandler", js_lwf_LWFNode_getTextureLoadHandler, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("handleTouch", js_lwf_LWFNode_handleTouch, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getNodeHandlers", js_lwf_LWFNode_getNodeHandlers, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("requestRemoveFromParent", js_lwf_LWFNode_requestRemoveFromParent, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("ctor", js_cocos2d_LWFNode_ctor, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("removeNodeFromParent", js_lwf_LWFNode_removeNodeFromParent, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("dump", js_lwf_LWFNode_dump, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_cocos2d_LWFNode_prototype = JS_InitClass(
        cx, global,
        JS::RootedObject(cx, jsb_cocos2d_Sprite_prototype),
        jsb_cocos2d_LWFNode_class,
        js_lwf_LWFNode_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "Node", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<cocos2d::LWFNode> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_cocos2d_LWFNode_class;
        p->proto = jsb_cocos2d_LWFNode_prototype;
        p->parentProto = jsb_cocos2d_Sprite_prototype;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_cocos2d_LWFParticle_class;
JSObject *jsb_cocos2d_LWFParticle_prototype;

bool js_lwf_LWFParticle_GetParticle(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::LWFParticle* cobj = (cocos2d::LWFParticle *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_lwf_LWFParticle_GetParticle : Invalid Native Object");
    if (argc == 0) {
        LWF::Particle* ret = cobj->GetParticle();
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<LWF::Particle>(cx, (LWF::Particle*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_lwf_LWFParticle_GetParticle : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}

extern JSObject *jsb_cocos2d_ParticleSystemQuad_prototype;

void js_cocos2d_LWFParticle_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (LWFParticle)", obj);
}

void js_register_lwf_LWFParticle(JSContext *cx, JS::HandleObject global) {
    jsb_cocos2d_LWFParticle_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_cocos2d_LWFParticle_class->name = "Particle";
    jsb_cocos2d_LWFParticle_class->addProperty = JS_PropertyStub;
    jsb_cocos2d_LWFParticle_class->delProperty = JS_DeletePropertyStub;
    jsb_cocos2d_LWFParticle_class->getProperty = JS_PropertyStub;
    jsb_cocos2d_LWFParticle_class->setProperty = JS_StrictPropertyStub;
    jsb_cocos2d_LWFParticle_class->enumerate = JS_EnumerateStub;
    jsb_cocos2d_LWFParticle_class->resolve = JS_ResolveStub;
    jsb_cocos2d_LWFParticle_class->convert = JS_ConvertStub;
    jsb_cocos2d_LWFParticle_class->finalize = js_cocos2d_LWFParticle_finalize;
    jsb_cocos2d_LWFParticle_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("GetParticle", js_lwf_LWFParticle_GetParticle, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    JSFunctionSpec *st_funcs = NULL;

    jsb_cocos2d_LWFParticle_prototype = JS_InitClass(
        cx, global,
        JS::RootedObject(cx, jsb_cocos2d_ParticleSystemQuad_prototype),
        jsb_cocos2d_LWFParticle_class,
        empty_constructor, 0,
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "Particle", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<cocos2d::LWFParticle> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_cocos2d_LWFParticle_class;
        p->proto = jsb_cocos2d_LWFParticle_prototype;
        p->parentProto = jsb_cocos2d_ParticleSystemQuad_prototype;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_cocos2d_LWFText_class;
JSObject *jsb_cocos2d_LWFText_prototype;

bool js_lwf_LWFText_GetText(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::LWFText* cobj = (cocos2d::LWFText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_lwf_LWFText_GetText : Invalid Native Object");
    if (argc == 0) {
        LWF::Text* ret = cobj->GetText();
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<LWF::Text>(cx, (LWF::Text*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_lwf_LWFText_GetText : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}

extern JSObject *jsb_cocos2d_Label_prototype;

void js_cocos2d_LWFText_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (LWFText)", obj);
}

void js_register_lwf_LWFText(JSContext *cx, JS::HandleObject global) {
    jsb_cocos2d_LWFText_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_cocos2d_LWFText_class->name = "Text";
    jsb_cocos2d_LWFText_class->addProperty = JS_PropertyStub;
    jsb_cocos2d_LWFText_class->delProperty = JS_DeletePropertyStub;
    jsb_cocos2d_LWFText_class->getProperty = JS_PropertyStub;
    jsb_cocos2d_LWFText_class->setProperty = JS_StrictPropertyStub;
    jsb_cocos2d_LWFText_class->enumerate = JS_EnumerateStub;
    jsb_cocos2d_LWFText_class->resolve = JS_ResolveStub;
    jsb_cocos2d_LWFText_class->convert = JS_ConvertStub;
    jsb_cocos2d_LWFText_class->finalize = js_cocos2d_LWFText_finalize;
    jsb_cocos2d_LWFText_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("GetText", js_lwf_LWFText_GetText, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    JSFunctionSpec *st_funcs = NULL;

    jsb_cocos2d_LWFText_prototype = JS_InitClass(
        cx, global,
        JS::RootedObject(cx, jsb_cocos2d_Label_prototype),
        jsb_cocos2d_LWFText_class,
        empty_constructor, 0,
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "Text", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<cocos2d::LWFText> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_cocos2d_LWFText_class;
        p->proto = jsb_cocos2d_LWFText_prototype;
        p->parentProto = jsb_cocos2d_Label_prototype;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_h102_LWFSprite_class;
JSObject *jsb_h102_LWFSprite_prototype;

bool js_lwf_LWFSprite_create(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        std::string arg0;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_lwf_LWFSprite_create : Error processing arguments");
        h102::LWFSprite* ret = h102::LWFSprite::create(arg0);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<h102::LWFSprite>(cx, (h102::LWFSprite*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_lwf_LWFSprite_create : wrong number of arguments");
    return false;
}

bool js_lwf_LWFSprite_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    h102::LWFSprite* cobj = new (std::nothrow) h102::LWFSprite();
    cocos2d::Ref *_ccobj = dynamic_cast<cocos2d::Ref *>(cobj);
    if (_ccobj) {
        _ccobj->autorelease();
    }
    TypeTest<h102::LWFSprite> t;
    js_type_class_t *typeClass = nullptr;
    std::string typeName = t.s_name();
    auto typeMapIter = _js_global_type_map.find(typeName);
    CCASSERT(typeMapIter != _js_global_type_map.end(), "Can't find the class type!");
    typeClass = typeMapIter->second;
    CCASSERT(typeClass, "The value is null.");
    // JSObject *obj = JS_NewObject(cx, typeClass->jsclass, typeClass->proto, typeClass->parentProto);
    JS::RootedObject proto(cx, typeClass->proto.get());
    JS::RootedObject parent(cx, typeClass->parentProto.get());
    JS::RootedObject obj(cx, JS_NewObject(cx, typeClass->jsclass, proto, parent));
    args.rval().set(OBJECT_TO_JSVAL(obj));
    // link the native object with the javascript object
    js_proxy_t* p = jsb_new_proxy(cobj, obj);
    AddNamedObjectRoot(cx, &p->obj, "h102::LWFSprite");
    if (JS_HasProperty(cx, obj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(obj), "_ctor", args);
    return true;
}


extern JSObject *jsb_cocos2d_LWFNode_prototype;

void js_h102_LWFSprite_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (LWFSprite)", obj);
}

void js_register_lwf_LWFSprite(JSContext *cx, JS::HandleObject global) {
    jsb_h102_LWFSprite_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_h102_LWFSprite_class->name = "Sprite";
    jsb_h102_LWFSprite_class->addProperty = JS_PropertyStub;
    jsb_h102_LWFSprite_class->delProperty = JS_DeletePropertyStub;
    jsb_h102_LWFSprite_class->getProperty = JS_PropertyStub;
    jsb_h102_LWFSprite_class->setProperty = JS_StrictPropertyStub;
    jsb_h102_LWFSprite_class->enumerate = JS_EnumerateStub;
    jsb_h102_LWFSprite_class->resolve = JS_ResolveStub;
    jsb_h102_LWFSprite_class->convert = JS_ConvertStub;
    jsb_h102_LWFSprite_class->finalize = js_h102_LWFSprite_finalize;
    jsb_h102_LWFSprite_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("create", js_lwf_LWFSprite_create, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_h102_LWFSprite_prototype = JS_InitClass(
        cx, global,
        JS::RootedObject(cx, jsb_cocos2d_LWFNode_prototype),
        jsb_h102_LWFSprite_class,
        js_lwf_LWFSprite_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "Sprite", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<h102::LWFSprite> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_h102_LWFSprite_class;
        p->proto = jsb_h102_LWFSprite_prototype;
        p->parentProto = jsb_cocos2d_LWFNode_prototype;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

void register_all_lwf(JSContext* cx, JS::HandleObject obj) {
    // Get the ns
    JS::RootedObject ns(cx);
    get_or_create_js_obj(cx, obj, "lwf", &ns);

    js_register_lwf_LWFBitmap(cx, ns);
    js_register_lwf_LWFParticle(cx, ns);
    js_register_lwf_LWFNode(cx, ns);
    js_register_lwf_LWFSprite(cx, ns);
    js_register_lwf_LWFText(cx, ns);
}

