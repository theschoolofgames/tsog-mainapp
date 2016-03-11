//
//  jsb_h102_utils.hpp
//  tsog
//
//  Created by Thuy Dong Xuan on 3/11/16.
//
//

#include "base/ccConfig.h"
#ifndef jsb_h102_utils_hpp
#define jsb_h102_utils_hpp

#include "jsapi.h"
#include "jsfriendapi.h"

extern JSClass  *jsb_h102_Utils_class;
extern JSObject *jsb_h102_Utils_prototype;

bool js_h102_Utils_constructor(JSContext *cx, uint32_t argc, jsval *vp);
bool js_h102_utils_isPixelTransparent(JSContext *cx, uint32_t argc, jsval *vp);


void register_all_h102(JSContext* cx, JS::HandleObject obj);

#endif /* jsb_h102_utils_hpp */
