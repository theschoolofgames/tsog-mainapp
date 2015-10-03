LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := cocos2d_lwf_static

LOCAL_MODULE_FILENAME := libcocos2dlwf

FILE_LIST := $(wildcard $(LOCAL_PATH)/cocos2dx/*.cpp) 
FILE_LIST += $(wildcard $(LOCAL_PATH)/cocos2dx/js-bindings/*.cpp) 
FILE_LIST += $(wildcard $(LOCAL_PATH)/core/*.cpp)
FILE_LIST += $(wildcard $(LOCAL_PATH)/h102/*.cpp)
FILE_LIST += $(wildcard $(LOCAL_PATH)/supports/lzma/*.c)

LOCAL_SRC_FILES := $(FILE_LIST:$(LOCAL_PATH)/%=%)

LOCAL_C_INCLUDES := $(LOCAL_PATH)/supports/lzma \
                    $(LOCAL_PATH)/core \
                    $(LOCAL_PATH)/h102 \
                    $(LOCAL_PATH)/cocos2dx 

LOCAL_STATIC_LIBRARIES := cocos2d_js_static

LOCAL_EXPORT_CFLAGS := -DCOCOS2D_DEBUG=2 -DCOCOS2D_JAVASCRIPT

include $(BUILD_STATIC_LIBRARY)

$(call import-module, scripting/js-bindings/proj.android)