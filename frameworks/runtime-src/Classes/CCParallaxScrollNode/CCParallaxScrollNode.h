//
//  ParallaxScrollNode.h
//  ParallaxScrollNodeTest
//
//  Created by Jason Marziani on 3/26/12.
//  Copyright (c) 2012 Little Wins LLC. All rights reserved.
//
//  Made compatible with Cocos2d-x 2.x by Stefan Nguyen on 7/30/12.
//

#ifndef ParallaxScrollNodeTest_ParallaxScrollNode_h
#define ParallaxScrollNodeTest_ParallaxScrollNode_h

#include "cocos2d.h"
#include "CCParallaxScrollOffset.h"

#ifndef PTM_RATIO
#define PTM_RATIO 32
#endif

class CCParallaxScrollNode : public cocos2d::Layer
{
  cocos2d::SpriteBatchNode batch;
  cocos2d::Size _range;
  
  cocos2d::Vector<CCParallaxScrollOffset *> _scrollOffsets;
public:
	virtual bool init();
	CREATE_FUNC(CCParallaxScrollNode);
  
  void addChild(cocos2d::Sprite *node, int z, cocos2d::Point r, cocos2d::Point p, cocos2d::Point so);
  void addChild(cocos2d::Sprite *node, int z, cocos2d::Point r, cocos2d::Point p, cocos2d::Point so, cocos2d::Point v);
  
  void removeChild(cocos2d::Sprite *node, bool cleanup);
  void updateWithVelocity(cocos2d::Point vel, float dt);
  void updateWithYPosition(float y, float dt);
  
  void addInfiniteScrollWithZ(int z, cocos2d::Point ratio, cocos2d::Point pos, cocos2d::Point dir, cocos2d::Sprite *firstObject, ...);
  void addInfiniteScrollXWithZ(int z, cocos2d::Point ratio, cocos2d::Point pos, cocos2d::Sprite* firstObject, ...);
  void addInfiniteScrollYWithZ(int z,  cocos2d::Point ratio, cocos2d::Point pos, cocos2d::Sprite* firstObject, ...);
  
  void addInfiniteScrollWithObjects(const cocos2d::Vector<cocos2d::Sprite *>& objects, int z, cocos2d::Point ratio, cocos2d::Point pos, cocos2d::Point dir);
  void addInfiniteScrollWithObjects(const cocos2d::Vector<cocos2d::Sprite *>& objects, int z, cocos2d::Point ratio, cocos2d::Point pos, cocos2d::Point dir, cocos2d::Point relVel);
  void addInfiniteScrollWithObjects(const cocos2d::Vector<cocos2d::Sprite *>& objects, int z, cocos2d::Point ratio, cocos2d::Point pos, cocos2d::Point dir, cocos2d::Point relVel, cocos2d::Point padding);
  
};

#endif
