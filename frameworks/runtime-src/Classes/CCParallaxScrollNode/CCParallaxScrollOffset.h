//
//  CCParallaxScrollOffset.h
//  ParallaxScrollNodeTest
//
//  Created by Jason Marziani on 3/26/12.
//  Made compatible with Cocos2d-x 2.x by Stefan Nguyen on 7/30/12.
//
//  Copyright (c) 2012 Vinova Pte Ltd. All rights reserved.
//
//  Made compatible with Cocos2d-x 2.x by Stefan Nguyen on 7/30/12.
//

#ifndef ParallaxScrollNodeTest_CCParallaxScrollOffset_h
#define ParallaxScrollNodeTest_CCParallaxScrollOffset_h

#include "cocos2d.h"

class CCParallaxScrollOffset : public cocos2d::Layer
{
public:
    virtual bool init();
    CREATE_FUNC(CCParallaxScrollOffset);
  
    //
    CC_SYNTHESIZE(cocos2d::Point, scrollOffset, ScrollOffset);
    CC_SYNTHESIZE(cocos2d::Point, origPosition, OrigPosition);
    CC_SYNTHESIZE(cocos2d::Point, relVelocity, RelVelocity);
    CC_SYNTHESIZE(cocos2d::Point, ratio, Ratio);
    CC_SYNTHESIZE(cocos2d::Point, buffer, Buffer);
    CC_SYNTHESIZE(cocos2d::Node*, theChild, TheChild);
    
    static CCParallaxScrollOffset* scrollWithNode(cocos2d::Node *node, cocos2d::Point r, cocos2d::Point p, cocos2d::Point s);
    static CCParallaxScrollOffset* scrollWithNode(cocos2d::Node *node, cocos2d::Point r, cocos2d::Point p, cocos2d::Point s, cocos2d::Point v);
    CCParallaxScrollOffset* initWithNode(cocos2d::Node *node, cocos2d::Point r, cocos2d::Point p, cocos2d::Point s, cocos2d::Point v);
    CCParallaxScrollOffset* initWithNode(cocos2d::Node *node, cocos2d::Point r, cocos2d::Point p, cocos2d::Point s);
};

#endif
