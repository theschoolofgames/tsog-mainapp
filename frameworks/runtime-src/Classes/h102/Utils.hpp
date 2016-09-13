//
//  Utils.hpp
//  tsog
//
//  Created by Thuy Dong Xuan on 3/11/16.
//
//

#ifndef Utils_hpp
#define Utils_hpp

#include "cocos2d.h"

namespace h102
{
  class Utils
  {
  public:
    static bool isPixelTransparent(cocos2d::Image* image, int x, int y);
    static void forceRender();
    static float imageMatchPercentage(cocos2d::Image* img1, cocos2d::Image* img2);
  };
};

#endif /* Utils_hpp */
