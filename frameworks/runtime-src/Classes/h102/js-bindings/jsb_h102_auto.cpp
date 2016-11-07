#include "jsb_h102_auto.hpp"
#include "scripting/js-bindings/manual/cocos2d_specifics.hpp"
#include "Utils.hpp"

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
JSClass  *jsb_h102_Utils_class;
JSObject *jsb_h102_Utils_prototype;

bool js_h102_Utils_isPixelTransparent(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 3) {
        cocos2d::Image* arg0 = nullptr;
        int arg1 = 0;
        int arg2 = 0;
        do {
            if (args.get(0).isNull()) { arg0 = nullptr; break; }
            if (!args.get(0).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JS::RootedObject tmpObj(cx, args.get(0).toObjectOrNull());
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg0 = (cocos2d::Image*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
        } while (0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_h102_Utils_isPixelTransparent : Error processing arguments");

        bool ret = h102::Utils::isPixelTransparent(arg0, arg1, arg2);
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_h102_Utils_isPixelTransparent : wrong number of arguments");
    return false;
}

bool js_h102_Utils_imageMatchPercentage(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        cocos2d::Image* arg0 = nullptr;
        cocos2d::Image* arg1 = nullptr;
        do {
            if (args.get(0).isNull()) { arg0 = nullptr; break; }
            if (!args.get(0).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JS::RootedObject tmpObj(cx, args.get(0).toObjectOrNull());
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg0 = (cocos2d::Image*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
        } while (0);
        do {
            if (args.get(1).isNull()) { arg1 = nullptr; break; }
            if (!args.get(1).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JS::RootedObject tmpObj(cx, args.get(1).toObjectOrNull());
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg1 = (cocos2d::Image*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg1, cx, false, "Invalid Native Object");
        } while (0);
        JSB_PRECONDITION2(ok, cx, false, "js_h102_Utils_imageMatchPercentage : Error processing arguments");

        double ret = h102::Utils::imageMatchPercentage(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        jsret = DOUBLE_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_h102_Utils_imageMatchPercentage : wrong number of arguments");
    return false;
}

bool js_h102_Utils_forceRender(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        h102::Utils::forceRender();
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_h102_Utils_forceRender : wrong number of arguments");
    return false;
}


void js_register_h102_Utils(JSContext *cx, JS::HandleObject global) {
    jsb_h102_Utils_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_h102_Utils_class->name = "Utils";
    jsb_h102_Utils_class->addProperty = JS_PropertyStub;
    jsb_h102_Utils_class->delProperty = JS_DeletePropertyStub;
    jsb_h102_Utils_class->getProperty = JS_PropertyStub;
    jsb_h102_Utils_class->setProperty = JS_StrictPropertyStub;
    jsb_h102_Utils_class->enumerate = JS_EnumerateStub;
    jsb_h102_Utils_class->resolve = JS_ResolveStub;
    jsb_h102_Utils_class->convert = JS_ConvertStub;
    jsb_h102_Utils_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("isPixelTransparent", js_h102_Utils_isPixelTransparent, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("imageMatchPercentage", js_h102_Utils_imageMatchPercentage, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("forceRender", js_h102_Utils_forceRender, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_h102_Utils_prototype = JS_InitClass(
        cx, global,
        JS::NullPtr(),
        jsb_h102_Utils_class,
        dummy_constructor<h102::Utils>, 0, // no constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);

    JS::RootedObject proto(cx, jsb_h102_Utils_prototype);
    JS::RootedValue className(cx, std_string_to_jsval(cx, "Utils"));
    JS_SetProperty(cx, proto, "_className", className);
    JS_SetProperty(cx, proto, "__nativeObj", JS::TrueHandleValue);
    JS_SetProperty(cx, proto, "__is_ref", JS::FalseHandleValue);
    // add the proto and JSClass to the type->js info hash table
    jsb_register_class<h102::Utils>(cx, jsb_h102_Utils_class, proto, JS::NullPtr());
}

void register_all_h102(JSContext* cx, JS::HandleObject obj) {
    // Get the ns
    JS::RootedObject ns(cx);
    get_or_create_js_obj(cx, obj, "h102", &ns);

    js_register_h102_Utils(cx, ns);
}

