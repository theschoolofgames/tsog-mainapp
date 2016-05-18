//
//  Utils.cpp
//  tsog
//
//  Created by Thuy Dong Xuan on 3/11/16.
//
//

#include "Utils.hpp"

USING_NS_CC;
namespace h102 {
  
  bool Utils::isPixelTransparent(cocos2d::Image* image, int x, int y)
  {
//    image->saveToFile(StringUtils::format("%sabc.png", FileUtils::getInstance()->getWritablePath().c_str()));
    
    if (!image->hasAlpha())
      return false;

    int channels = 4;
    y = image->getHeight() - y;
    
    unsigned char *data = image->getData();
    
    unsigned char *pixel = data + (x + y * image->getWidth()) * channels;
    
//    unsigned char r = *pixel;
//    unsigned char g = *(pixel + 1);
//    unsigned char b = *(pixel + 2);
    unsigned char a = *(pixel + 3);
    
    return a == 0;
  }
}