//
//  SimpleAudioRecordEngine.h
//  tsog
//
//  Created by Thuy Dong Xuan on 12/7/15.
//
//

#ifndef SimpleAudioRecordEngine_h
#define SimpleAudioRecordEngine_h

#include "Export.h"

namespace CocosDenshion
{
    
    class EXPORT_DLL SimpleAudioRecordEngine
    {
    public:
        static SimpleAudioRecordEngine *getInstance();
        
    protected:
        SimpleAudioRecordEngine();
        virtual ~SimpleAudioRecordEngine();
        
    public:
        virtual bool checkMic();
        virtual bool isRecording();
        virtual void initRecord(const char *fileName);
        virtual void startRecord();
        virtual void stopRecord();
    };
}

#endif /* SimpleAudioRecordEngine_h */
