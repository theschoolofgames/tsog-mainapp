LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := cocos2djs_shared

LOCAL_MODULE_FILENAME := libcocos2djs

FILE_LIST := $(wildcard $(LOCAL_PATH)/../../../Classes/*.cpp)
FILE_LIST += $(wildcard $(LOCAL_PATH)/../../../Classes/h102/*.cpp)
FILE_LIST += $(wildcard $(LOCAL_PATH)/../../../Classes/h102/js-bindings/*.cpp)

LOCAL_SRC_FILES := hellojavascript/main.cpp
LOCAL_SRC_FILES += $(FILE_LIST:$(LOCAL_PATH)/%=%)

LOCAL_WHOLE_STATIC_LIBRARIES := pocketsphinx PluginIAP sdkbox android_native_app_glue 

LOCAL_CPPFLAGS := -DSDKBOX_ENABLED
LOCAL_C_INCLUDES := $(LOCAL_PATH)/../../../Classes \
					$(LOCAL_PATH)/../../../Classes/h102 \
					$(LOCAL_PATH)/../../../Classes/h102/js-bindings \
					$(LOCAL_PATH)/../../../../lwf \
					$(LOCAL_PATH)/../../../../SoundTouch \
					$(LOCAL_PATH)/../../../../SoundStretch

LOCAL_STATIC_LIBRARIES := cocos2d_js_static cocos2d_lwf_static cocos2d_soundstretch_static

LOCAL_EXPORT_CFLAGS := -DCOCOS2D_DEBUG=2 -DCOCOS2D_JAVASCRIPT
LOCAL_LDLIBS := -llog \
-landroid \
-llog

include $(BUILD_SHARED_LIBRARY)

$(call import-add-path,$(LOCAL_PATH))

$(call import-module, scripting/js-bindings/proj.android)
$(call import-module, ../../lwf)
$(call import-module, ../../SoundStretch)
$(call import-module, ./pocketsphinx)
$(call import-module, ./sdkbox)
$(call import-module, ./pluginiap)
