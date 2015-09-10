//
//  LWFSprite.h
//  HUB102
//
//  Created by Stefan Nguyen on 7/30/15.
//
//

#ifndef __LWFSprite__
#define __LWFSprite__

#include "cocos2d.h"
#include "lwf_cocos2dx.h"

namespace h102
{
    class LWFSprite : public cocos2d::LWFNode
    {
        bool init(const std::string &filepath);
    public:
        static LWFSprite* create(const std::string& filepath);
        
        LWFSprite();
        virtual ~LWFSprite();
    };
};

#endif /* defined(__LWFSprite__) */
