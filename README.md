## What is The School of Games?

The School Of Games (TSoG) was started with a burning desire to bring personalized, quality education to every Pre-K and Kindergarten child around the world. The School of Games is a platform of immersive video games which adapts to each child’s learning ability to impart basic literacy (reading,writing & arithmetic) on highly affordable devices like the refurbished ones. TSoG firmly believes that education through technology CAN and WOULD break the cycle of poverty, word gap, and digital divide. The team of The School of Games is the perfect amalgam of passion and expertise. This combination of educator, researcher and business developer has carefully studied the market and through various iterations of human centred design have validated the idea. The common goal that each team member shares is to return the fun and free access of education to kids, the way learning was really meant to be.

## Setup Development Environment

### Prerequisites

#### For iOS:

- Download and install XCode: https://itunes.apple.com/en/app/xcode/id497799835?mt=12

#### For Android:

- Download and install Android SDK: https://developer.android.com/studio/index.html#downloads
- Download and install Android NDK (r10e): http://dl.google.com/android/repository/android-ndk-r10e-darwin-x86_64.zip

### Install cocos2d

- Download latest cocos2d-x: http://www.cocos2d-x.org/download
- Extract cocos2d-x downloaded zip file
- Run `./setup.py`
- Run `cocos -v` to verify cocos2d-x was installed properly

### Build the game

For Android:

	./build_android.sh

For iOS:

	./build_ios.sh

Or you can also use an IDE:

- Open Android Studio project in `frameworks/runtime-src/proj.android-studio/`
- Open XCode project file `frameworks/runtime-src/proj.ios_mac/tsog.xcworkspace` _(we use [CocoaPods](https://cocoapods.org/) so make sure to have it installed properly)_