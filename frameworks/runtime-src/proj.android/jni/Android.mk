LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := cocos2djs_shared

LOCAL_MODULE_FILENAME := libcocos2djs

FILE_LIST := $(wildcard $(LOCAL_PATH)/../../Classes/*.cpp) 
FILE_LIST += $(wildcard $(LOCAL_PATH)/../../Classes/jansson/*.c)
FILE_LIST += $(wildcard $(LOCAL_PATH)/../../Classes/NDKHelper/*.cpp)

LOCAL_SRC_FILES := hellojavascript/main.cpp
LOCAL_SRC_FILES += $(FILE_LIST:$(LOCAL_PATH)/%=%)

LOCAL_C_INCLUDES := $(LOCAL_PATH)/../../Classes \
                    $(LOCAL_PATH)/../../Classes/jansson \
                    $(LOCAL_PATH)/../../Classes/NDKHelper

LOCAL_STATIC_LIBRARIES := cocos2d_js_static
LOCAL_STATIC_LIBRARIES += cocos2d_lwf_static

LOCAL_EXPORT_CFLAGS := -DCOCOS2D_DEBUG=2 -DCOCOS2D_JAVASCRIPT

include $(BUILD_SHARED_LIBRARY)


$(call import-module, scripting/js-bindings/proj.android)
$(call import-module, ../../lwf)
