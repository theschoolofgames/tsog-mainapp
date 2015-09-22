//
//  LWFSprite.cpp
//  HUB102
//
//  Created by Stefan Nguyen on 7/30/15.
//
//

#include "LWFSprite.h"

USING_NS_CC;
namespace h102 {
    LWFSprite* LWFSprite::create(const std::string& filepath)
    {
        LWFSprite *sprite = new LWFSprite();
        if (sprite && sprite->init(filepath)) {
            sprite->autorelease();
            
            Size visibleSize = Director::getInstance()->getVisibleSize();

            sprite->lwf->FitForWidth(visibleSize.width, visibleSize.height);
            sprite->setContentSize(Size(sprite->lwf->width*sprite->lwf->scaleByStage, sprite->lwf->height*sprite->lwf->scaleByStage));
            
            return sprite;
        }
        CC_SAFE_DELETE(sprite);
        return NULL;
    }
    
    LWFSprite::LWFSprite() : LWFNode()
    {
        
    }
    
    LWFSprite::~LWFSprite()
    {
        
    }
    
    bool LWFSprite::init(const std::string &filepath)
    {
        LWFNodeHandlers h;
        return LWFNode::initWithLWFFile(filepath, h);
    }
}