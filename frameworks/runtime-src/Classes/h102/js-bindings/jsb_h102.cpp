//
//  jsb_h102_utils.cpp
//  tsog
//
//  Created by Thuy Dong Xuan on 3/11/16.
//
//

#include "jsb_h102.hpp"
#include "cocos2d_specifics.hpp"
#include "Utils.hpp"

static bool js_is_native_obj(JSContext *cx, uint32_t argc, jsval *vp)
{
  JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
  args.rval().setBoolean(true);
  return true;
}

JSClass  *jsb_h102_Utils_class;
JSObject *jsb_h102_Utils_prototype;

bool js_h102_Utils_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
  JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
  bool ok = true;
  h102::Utils* cobj = new (std::nothrow) h102::Utils();

  TypeTest<h102::Utils> t;
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
  AddNamedObjectRoot(cx, &p->obj, "h102::Utils");
  if (JS_HasProperty(cx, obj, "_ctor", &ok) && ok)
    ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(obj), "_ctor", args);
  return true;
}

bool js_h102_utils_isPixelTransparent(JSContext *cx, uint32_t argc, jsval *vp)
{
  JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
  bool ok = true;
  
  do {
    if (argc == 3) {
      cocos2d::Image* arg0;
      do {
        if (args.get(0).isNull()) { arg0 = nullptr; break; }
        if (!args.get(0).isObject()) { ok = false; break; }
        js_proxy_t *jsProxy;
        JSObject *tmpObj = args.get(0).toObjectOrNull();
        jsProxy = jsb_get_js_proxy(tmpObj);
        arg0 = (cocos2d::Image*)(jsProxy ? jsProxy->ptr : NULL);
        JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
      } while (0);
      if (!ok) { ok = true; break; }
      
      int arg1, arg2;
      ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
      ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
      
      if (!ok) { ok = true; break; }
      bool ret = h102::Utils::isPixelTransparent(arg0, arg1, arg2);
      jsval jsret = JSVAL_NULL;
      jsret = BOOLEAN_TO_JSVAL(ret);
      args.rval().set(jsret);
      return true;
    }
  } while(0);
  
  JS_ReportError(cx, "js_h102_utils_isPixelTransparent : wrong number of arguments");
  return false;
}

void js_h102_Utils_finalize(JSFreeOp *fop, JSObject *obj) {
  CCLOGINFO("jsbindings: finalizing JS object %p (H102::Utils)", obj);
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
  jsb_h102_Utils_class->finalize = js_h102_Utils_finalize;
  jsb_h102_Utils_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);
  
  static JSPropertySpec properties[] = {
    JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
    JS_PS_END
  };
  
  static JSFunctionSpec funcs[] = {
    JS_FS_END
  };
  
  static JSFunctionSpec st_funcs[] = {
    JS_FN("isPixelTransparent", js_h102_utils_isPixelTransparent, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
    JS_FS_END
  };
  
  jsb_h102_Utils_prototype = JS_InitClass(
                                          cx, global,
                                          JS::NullPtr(),
                                          jsb_h102_Utils_class,
                                          js_h102_Utils_constructor, 0, // constructor
                                          properties,
                                          funcs,
                                          NULL, // no static properties
                                          st_funcs);
  
  // make the class enumerable in the registered namespace
  //  bool found;
  //FIXME: Removed in Firefox v27
  //  JS_SetPropertyAttributes(cx, global, "LWFBitmap", JSPROP_ENUMERATE | JSPROP_READONLY, &found);
  
  // add the proto and JSClass to the type->js info hash table
  TypeTest<h102::Utils> t;
  js_type_class_t *p;
  std::string typeName = t.s_name();
  if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
  {
    p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
    p->jsclass = jsb_h102_Utils_class;
    p->proto = jsb_h102_Utils_prototype;
    p->parentProto = NULL;
    _js_global_type_map.insert(std::make_pair(typeName, p));
  }
}


void register_all_h102(JSContext* cx, JS::HandleObject obj) {
  // Get the ns
  JS::RootedObject ns(cx);
  get_or_create_js_obj(cx, obj, "h102", &ns);
  
  js_register_h102_Utils(cx, ns);
}