#include "AppDelegate.h"

#include "SimpleAudioEngine.h"
#include "jsb_cocos2dx_auto.hpp"
#include "jsb_cocos2dx_ui_auto.hpp"
#include "jsb_cocos2dx_studio_auto.hpp"
#include "jsb_cocos2dx_builder_auto.hpp"
#include "jsb_cocos2dx_spine_auto.hpp"
#include "jsb_cocos2dx_extension_auto.hpp"
#include "jsb_cocos2dx_3d_auto.hpp"
#include "jsb_cocos2dx_3d_extension_auto.hpp"
#include "3d/jsb_cocos2dx_3d_manual.h"
#include "ui/jsb_cocos2dx_ui_manual.h"
#include "cocostudio/jsb_cocos2dx_studio_manual.h"
#include "cocosbuilder/js_bindings_ccbreader.h"
#include "spine/jsb_cocos2dx_spine_manual.h"
#include "extension/jsb_cocos2dx_extension_manual.h"
#include "localstorage/js_bindings_system_registration.h"
#include "chipmunk/js_bindings_chipmunk_registration.h"
#include "jsb_opengl_registration.h"
#include "network/XMLHTTPRequest.h"
#include "network/jsb_websocket.h"
#include "network/jsb_socketio.h"
#include "jsb_cocos2dx_physics3d_auto.hpp"
#include "physics3d/jsb_cocos2dx_physics3d_manual.h"
#include "jsb_cocos2dx_navmesh_auto.hpp"
#include "navmesh/jsb_cocos2dx_navmesh_manual.h"

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
#include "jsb_cocos2dx_experimental_video_auto.hpp"
#include "experimental/jsb_cocos2dx_experimental_video_manual.h"
#include "jsb_cocos2dx_experimental_webView_auto.hpp"
#include "experimental/jsb_cocos2dx_experimental_webView_manual.h"
#endif

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WINRT || CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_IOS || CC_TARGET_PLATFORM == CC_PLATFORM_MAC || CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
#include "jsb_cocos2dx_audioengine_auto.hpp"
#endif

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
#include "platform/android/CCJavascriptJavaBridge.h"
#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS || CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
#include "platform/ios/JavaScriptObjCBridge.h"
#endif

#include "cocos2dx/js-bindings/jsb_cocos2dx_lwf.hpp"

#include "SimpleAudioEngine.h"
#include "AudioEngine.h"

#include <thread>
//#include "../../SoundTouch/core/WavFile.h"
#include "SoundStretch.h"

#define ARRAY_SIZE(a)                               \
((sizeof(a) / sizeof(*(a))) /                     \
static_cast<size_t>(!(sizeof(a) % sizeof(*(a)))))

USING_NS_CC;
using namespace CocosDenshion;
using namespace cocos2d::experimental;

AppDelegate::AppDelegate()
{
}

AppDelegate::~AppDelegate()
{
    ScriptEngineManager::destroyInstance();
}

void AppDelegate::initGLContextAttrs()
{
    GLContextAttrs glContextAttrs = {8, 8, 8, 8, 24, 8};
    
    GLView::setGLContextAttrs(glContextAttrs);
}

bool AppDelegate::applicationDidFinishLaunching()
{
    // initialize director
    auto director = Director::getInstance();
    auto glview = director->getOpenGLView();
    if(!glview) {
#if(CC_TARGET_PLATFORM == CC_PLATFORM_WP8) || (CC_TARGET_PLATFORM == CC_PLATFORM_WINRT)
        glview = cocos2d::GLViewImpl::create("tsog");
#else
        glview = cocos2d::GLViewImpl::createWithRect("tsog", Rect(0,0,900,640));
#endif
        director->setOpenGLView(glview);
}

    // set FPS. the default value is 1.0/60 if you don't call this
    director->setAnimationInterval(1.0 / 60);
    
    ScriptingCore* sc = ScriptingCore::getInstance();
    sc->addRegisterCallback(register_all_cocos2dx);
    sc->addRegisterCallback(register_cocos2dx_js_core);
    sc->addRegisterCallback(jsb_register_system);

    // extension can be commented out to reduce the package
    sc->addRegisterCallback(register_all_cocos2dx_extension);
    sc->addRegisterCallback(register_all_cocos2dx_extension_manual);

    // chipmunk can be commented out to reduce the package
//    sc->addRegisterCallback(jsb_register_chipmunk);
    // opengl can be commented out to reduce the package
    sc->addRegisterCallback(JSB_register_opengl);
    
    // builder can be commented out to reduce the package
//    sc->addRegisterCallback(register_all_cocos2dx_builder);
//    sc->addRegisterCallback(register_CCBuilderReader);
    
    // ui can be commented out to reduce the package, attension studio need ui module
    sc->addRegisterCallback(register_all_cocos2dx_ui);
    sc->addRegisterCallback(register_all_cocos2dx_ui_manual);
    
    // LWF
    sc->addRegisterCallback(register_all_cocos2dx_lwf);

    // studio can be commented out to reduce the package, 
//    sc->addRegisterCallback(register_all_cocos2dx_studio);
//    sc->addRegisterCallback(register_all_cocos2dx_studio_manual);
    
    // spine can be commented out to reduce the package
    sc->addRegisterCallback(register_all_cocos2dx_spine);
    sc->addRegisterCallback(register_all_cocos2dx_spine_manual);
    
    // XmlHttpRequest can be commented out to reduce the package
    sc->addRegisterCallback(MinXmlHttpRequest::_js_register);
    // websocket can be commented out to reduce the package
//    sc->addRegisterCallback(register_jsb_websocket);
    // sokcet io can be commented out to reduce the package
//    sc->addRegisterCallback(register_jsb_socketio);

    // 3d can be commented out to reduce the package
//    sc->addRegisterCallback(register_all_cocos2dx_3d);
//    sc->addRegisterCallback(register_all_cocos2dx_3d_manual);
    
    // 3d extension can be commented out to reduce the package
//    sc->addRegisterCallback(register_all_cocos2dx_3d_extension);
    
#if CC_USE_3D_PHYSICS && CC_ENABLE_BULLET_INTEGRATION
    // Physics 3d can be commented out to reduce the package
//    sc->addRegisterCallback(register_all_cocos2dx_physics3d);
//    sc->addRegisterCallback(register_all_cocos2dx_physics3d_manual);
#endif

#if CC_USE_NAVMESH
    sc->addRegisterCallback(register_all_cocos2dx_navmesh);
    sc->addRegisterCallback(register_all_cocos2dx_navmesh_manual);
#endif

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
    sc->addRegisterCallback(register_all_cocos2dx_experimental_video);
    sc->addRegisterCallback(register_all_cocos2dx_experimental_video_manual);
    sc->addRegisterCallback(register_all_cocos2dx_experimental_webView);
    sc->addRegisterCallback(register_all_cocos2dx_experimental_webView_manual);
#endif

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WINRT || CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_IOS || CC_TARGET_PLATFORM == CC_PLATFORM_MAC || CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
    sc->addRegisterCallback(register_all_cocos2dx_audioengine);
#endif

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
    sc->addRegisterCallback(JavascriptJavaBridge::_js_register);
#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS || CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
    sc->addRegisterCallback(JavaScriptObjCBridge::_js_register);
#endif
    sc->start();    
    sc->runScript("script/jsb_boot.js");
#if defined(COCOS2D_DEBUG) && (COCOS2D_DEBUG > 0)
    sc->enableDebugger();
#endif
    ScriptEngineProtocol *engine = ScriptingCore::getInstance();
    ScriptEngineManager::getInstance()->setScriptEngine(engine);
    ScriptingCore::getInstance()->runScript("main.js");
  
  auto console = director->getConsole();
  console->listenOnTCP(6050);
  
  JS_SetErrorReporter(sc->getGlobalContext(), [](JSContext *cx, const char *message, JSErrorReport *report) {
      std::stringstream msg;
      bool isWarning = JSREPORT_IS_WARNING(report->flags);
      msg << (isWarning ? "JavaScript warning: " : "JavaScript error: ");
      msg << message << " ";
      if (report->filename)
      {
          msg << report->filename;
          msg << " line " << report->lineno << ":" << report->column << "\n";
      }
      
      JS::RootedValue excn(cx);
      if (JS_GetPendingException(cx, &excn) && excn.isObject())
      {
          JS::RootedObject excnObj(cx, &excn.toObject());
          // TODO: this violates the docs ("The error reporter callback must not reenter the JSAPI.")
          
          // Hide the exception from EvaluateScript
          JSExceptionState* excnState = JS_SaveExceptionState(cx);
          JS_ClearPendingException(cx);
          
          JS::RootedValue rval(cx);
          const char dumpStack[] = "this.stack.trimRight().replace(/^/mg, '  ')"; // indent each line
          if (JS_EvaluateScript(cx, excnObj, dumpStack, ARRAY_SIZE(dumpStack)-1, "(eval)", 1, &rval))
          {
              std::string stackTrace;
              jsval_to_std_string(cx, rval, &stackTrace);
              msg << "\n" << stackTrace;
              
              JS_RestoreExceptionState(cx, excnState);
          }
          else
          {
              // Error got replaced by new exception from EvaluateScript
              JS_DropExceptionState(cx, excnState);
          }
      }
      
      std::string mess = msg.str();
      
      std::string search = "\n";
      std::string replace = "\\n";
      size_t pos = 0;
      while ((pos = mess.find(search, pos)) != std::string::npos) {
          mess.replace(pos, search.length(), replace);
          pos += replace.length();
      }
      
      pos = 0;
      string fullPath = FileUtils::getInstance()->fullPathForFilename("main.js");
      fullPath = fullPath.substr(0, fullPath.size()-7);
      replace = "";
      while ((pos = mess.find(fullPath, pos)) != std::string::npos) {
          mess.replace(pos, fullPath.length(), replace);
          pos += replace.length();
      }
      
      CCLOG("%s", mess.c_str());
//    Director::getInstance()->getRunningScene()->runAction(Sequence::create(DelayTime::create(0),
//                                                                           CallFunc::create([mess](){
//      ScriptingCore::getInstance()->evalString(StringUtils::format("showNativeMessage(\"%s\", \"%s\")", "Error", mess.c_str()).c_str(), NULL);
//    }), NULL));
  });
  
  director->getEventDispatcher()->addCustomEventListener("chipmunkify", [=](EventCustom* event) {
    std::thread t(&AppDelegate::chipmunkifySound, this);
    t.join();
//    this->chipmunkifySound();
//    string inFileDir = StringUtils::format("%s%s", FileUtils::getInstance()->getWritablePath().c_str(), "record_sound.wav");
//    ScriptingCore::getInstance()->evalString(StringUtils::format("AudioListener.getInstance().onAudioChipmunkified('%s')", inFileDir.c_str()).c_str(), nullptr);
  });
  
    return true;
}

void AppDelegate::chipmunkifySound()
{
  string inFileDir = StringUtils::format("%s%s", FileUtils::getInstance()->getWritablePath().c_str(), "record_sound.wav");
  string outFileDir = StringUtils::format("%s%s", FileUtils::getInstance()->getWritablePath().c_str(), "out.wav");
  
//  string inFileDir = StringUtils::format("%s%s", "/sdcard/", "record_sound.wav");
//  string outFileDir = StringUtils::format("%s%s", "/sdcard/", "out.wav");
  
  SoundStretch soundStretch;
  
  soundStretch.process(inFileDir.c_str(), outFileDir.c_str(), 0, 10, 0);
  
  AudioEngine::uncache(outFileDir.c_str());
  AudioEngine::preload(outFileDir.c_str());

  Director::getInstance()->getScheduler()->performFunctionInCocosThread([=]() {
    ScriptingCore::getInstance()->evalString(StringUtils::format("AudioListener.getInstance().onAudioChipmunkified('%s')", outFileDir.c_str()).c_str(), nullptr);
  });
}

// This function will be called when the app is inactive. When comes a phone call,it's be invoked too
void AppDelegate::applicationDidEnterBackground()
{
    auto director = Director::getInstance();
    director->stopAnimation();
    director->getEventDispatcher()->dispatchCustomEvent("game_on_hide");
    SimpleAudioEngine::getInstance()->pauseBackgroundMusic();
    SimpleAudioEngine::getInstance()->pauseAllEffects();    
}

// this function will be called when the app is active again
void AppDelegate::applicationWillEnterForeground()
{
    auto director = Director::getInstance();
    director->startAnimation();
    director->getEventDispatcher()->dispatchCustomEvent("game_on_show");
    SimpleAudioEngine::getInstance()->resumeBackgroundMusic();
    SimpleAudioEngine::getInstance()->resumeAllEffects();
}
