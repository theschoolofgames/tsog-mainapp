cocos compile -p android -m release --compile-script 1 --android-studio -j 4 --app-abi armeabi:x86
cd frameworks/runtime-src/proj.android-studio && ./gradlew crashlyticsUploadSymbolsRelease
cd ../../..