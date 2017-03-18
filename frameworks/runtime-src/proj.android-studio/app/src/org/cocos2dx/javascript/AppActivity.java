/****************************************************************************
Copyright (c) 2015 Chukong Technologies Inc.
 
http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package org.cocos2dx.javascript;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;

import android.os.Bundle;

import com.crashlytics.android.Crashlytics;
import EkStep.EkStep;
import com.h102.SpeechRecognizer;
import com.h102.Wrapper;

import java.util.Locale;

import io.fabric.sdk.android.Fabric;

public class AppActivity extends Cocos2dxActivity {

    private static final String TAG = AppActivity.class.getSimpleName();

    private static AppActivity app = null;

    @Override
    public Cocos2dxGLSurfaceView onCreateView() {
        Locale.setDefault(Locale.US);
        Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
        app = this;
        // TestCpp should create stencil buffer
        glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);

        Wrapper.activity = this;
        SpeechRecognizer.setupInstance(this);

        final Fabric fabric = new Fabric.Builder(this)
                .kits(new Crashlytics())
                .debuggable(true)
                .build();
        Fabric.with(fabric);

//        Wrapper.requestPermission("RECORD_AUDIO");
        EkStep.setup(this);
        EkStep.getInstance().sendTelemetryEvent("GE_LAUNCH_GAME");
        return glSurfaceView;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
        Wrapper.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }


    @Override
    protected void onDestroy() {
        SpeechRecognizer.getInstance().shutdown();
        super.onDestroy();
    }

    @Override
    protected void onLoadNativeLibraries() {
        try {
            ApplicationInfo ai = getPackageManager().getApplicationInfo(getPackageName(), PackageManager.GET_META_DATA);
            Bundle bundle = ai.metaData;

            int resourceId = bundle.getInt("android.app.lib_names");
            String[] libNameArray = getResources().getStringArray(resourceId);

            for (String libName : libNameArray) {
                System.loadLibrary(libName);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void onStop() {
        EkStep.getInstance().sendTelemetryEvent("GE_GAME_END");
        super.onStop();
    }

}