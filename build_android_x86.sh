cocos compile -p android -m debug --compile-script 1 --android-studio -j 4 --app-abi x86
cd frameworks/runtime-src/proj.android-studio && ./gradlew crashlyticsUploadSymbolsDebug
cd ../../..