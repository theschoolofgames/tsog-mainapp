LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)
LOCAL_MODULE := pocketsphinx
LOCAL_MODULE_FILENAME := lib$(LOCAL_MODULE)_jni

LOCAL_SRC_FILES := libs/$(TARGET_ARCH_ABI)/$(LOCAL_MODULE_FILENAME).so
LOCAL_EXPORT_C_INCLUDES := $(LOCAL_PATH)
LOCAL_EXPORT_LDLIBS := -llog

LOCAL_STATIC_LIBRARIES := pocketsphinx

include $(PREBUILT_SHARED_LIBRARY)
